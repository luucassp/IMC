import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
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

    const confere = await bcrypt.compare(senha, user.senhaHash);
    if (!confere) throw new UnauthorizedException('Credenciais inválidas.');

    return this.gerarSessao(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  private gerarSessao(user: { id: string; email: string; nome: string }) {
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: this.publicUser(user) };
  }

  private publicUser(user: { id: string; email: string; nome: string }) {
    return { id: user.id, email: user.email, nome: user.nome };
  }
}
