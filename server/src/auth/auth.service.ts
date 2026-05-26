import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

type UserPublico = {
  id: string;
  email: string;
  nome: string;
  avatarUrl?: string | null;
};

@Injectable()
export class AuthService {
  private googleClient?: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register({ email, senha, nome }: RegisterDto) {
    const existente = await this.prisma.user.findUnique({ where: { email } });
    if (existente) throw new ConflictException('E-mail já cadastrado.');

    const senhaHash = await bcrypt.hash(senha, 10);
    const user = await this.prisma.user.create({
      data: { email, senhaHash, nome },
    });
    return this.gerarSessao(user);
  }

  async login({ email, senha }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas.');
    if (!user.senhaHash) {
      throw new UnauthorizedException('Esta conta usa login social. Entre com o Google.');
    }

    const confere = await bcrypt.compare(senha, user.senhaHash);
    if (!confere) throw new UnauthorizedException('Credenciais inválidas.');

    return this.gerarSessao(user);
  }

  async loginComGoogle(idToken: string) {
    const client = this.getGoogleClient();

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Token do Google inválido.');
    }

    if (!payload?.email) throw new UnauthorizedException('Token do Google sem e-mail.');

    const googleId = payload.sub;
    const email = payload.email;
    const nome = payload.name ?? email.split('@')[0];
    const avatarUrl = payload.picture ?? null;

    // Procura por googleId; senão vincula a uma conta existente do mesmo
    // e-mail; senão cria uma nova conta (sem senha).
    let user = await this.prisma.user.findUnique({ where: { googleId } });
    if (!user) {
      const porEmail = await this.prisma.user.findUnique({ where: { email } });
      user = porEmail
        ? await this.prisma.user.update({
            where: { id: porEmail.id },
            data: { googleId, avatarUrl: porEmail.avatarUrl ?? avatarUrl },
          })
        : await this.prisma.user.create({ data: { email, nome, googleId, avatarUrl } });
    }

    return this.gerarSessao(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  private getGoogleClient(): OAuth2Client {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new ServiceUnavailableException('Login com Google não está configurado no servidor.');
    }
    if (!this.googleClient) this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    return this.googleClient;
  }

  private gerarSessao(user: UserPublico) {
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: this.publicUser(user) };
  }

  private publicUser(user: UserPublico) {
    return { id: user.id, email: user.email, nome: user.nome, avatarUrl: user.avatarUrl ?? null };
  }
}
