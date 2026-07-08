import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { AuthUser } from '../../common/decorators';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  shelterId: string | null;
  name: string;
}

// Valida o access token e garante que a conta continua ativa (RF-005).
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.usersService.findById(payload.sub).catch(() => null);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Conta inválida ou desativada');
    }
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      shelterId: user.shelterId,
      name: user.name,
    };
  }
}
