import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { RefreshTokenStore } from './refresh-token.store';
import { AuditAction } from '../../common/enums';
import { User } from '../../database/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly store: RefreshTokenStore,
    private readonly audit: AuditService,
  ) {}

  // RF-001: autentica e emite access + refresh.
  async login(email: string, password: string, ip?: string) {
    const user = await this.users.findByEmailWithSecret(email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    if (!user.isActive) throw new UnauthorizedException('Conta desativada'); // RF-005

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    await this.users.updateLastLogin(user.id);
    const tokens = await this.issueTokens(user);

    await this.audit.record({
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'users',
      entityId: user.id,
      ipAddress: ip,
    });

    return { ...tokens, user: this.publicUser(user) };
  }

  // RF-002: renova access token usando o refresh (com rotação — RNF-012).
  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
    if (!this.store.isValid(payload.sub, payload.jti)) {
      throw new UnauthorizedException('Refresh token expirado ou revogado');
    }
    const user = await this.users.findById(payload.sub);
    if (!user.isActive) throw new UnauthorizedException('Conta desativada');

    const newJti = randomUUID();
    this.store.rotate(payload.sub, payload.jti, newJti);
    const tokens = await this.issueTokens(user, newJti);
    return { ...tokens, user: this.publicUser(user) };
  }

  // RF-003: invalida o refresh token no servidor.
  async logout(userId: string, refreshToken?: string, ip?: string) {
    if (refreshToken) {
      try {
        const payload: any = await this.jwt.verifyAsync(refreshToken, {
          secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        });
        this.store.revoke(payload.sub, payload.jti);
      } catch {
        /* token já inválido */
      }
    } else {
      this.store.revokeAll(userId);
    }
    await this.audit.record({
      userId,
      action: AuditAction.LOGOUT,
      entityType: 'users',
      entityId: userId,
      ipAddress: ip,
    });
    return { success: true };
  }

  private async issueTokens(user: User, jti = randomUUID()) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      shelterId: user.shelterId,
      name: user.name,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRATION', '15m'),
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('REFRESH_EXPIRATION', '7d'),
      },
    );
    this.store.save(user.id, jti);
    return { accessToken, refreshToken };
  }

  private publicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      shelterId: user.shelterId,
      mustChangePassword: user.mustChangePassword,
    };
  }
}
