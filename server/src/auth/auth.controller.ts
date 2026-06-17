import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, AuthUser } from './current-user.decorator';

// Rotas de credencial: no máximo 5 tentativas por minuto por IP (anti brute-force).
const AUTH_LIMIT = { default: { ttl: 60_000, limit: 5 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle(AUTH_LIMIT)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Throttle(AUTH_LIMIT)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Throttle(AUTH_LIMIT)
  @Post('google')
  google(@Body() dto: GoogleLoginDto) {
    return this.auth.loginComGoogle(dto.idToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
