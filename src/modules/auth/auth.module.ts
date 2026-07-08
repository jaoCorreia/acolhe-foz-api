import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenStore } from './refresh-token.store';

@Module({
  imports: [UsersModule, PassportModule, ConfigModule, JwtModule.register({})],
  providers: [AuthService, JwtStrategy, RefreshTokenStore],
  controllers: [AuthController],
})
export class AuthModule {}
