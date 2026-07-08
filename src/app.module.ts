import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { envValidationSchema } from './config/env.validation';
import { ALL_ENTITIES } from './database/entities';
import { JwtAuthGuard, RolesGuard } from './common/guards';

import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PersonsModule } from './modules/persons/persons.module';
import { ApproachesModule } from './modules/approaches/approaches.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { SheltersModule } from './modules/shelters/shelters.module';
import { StaysModule } from './modules/stays/stays.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PartnersModule } from './modules/partners/partners.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: ALL_ENTITIES,
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false, // schema gerenciado por db/schema.sql + migrations
        autoLoadEntities: true,
      }),
    }),
    AuditModule,
    AuthModule,
    UsersModule,
    PersonsModule,
    ApproachesModule,
    ReferralsModule,
    SheltersModule,
    StaysModule,
    DashboardModule,
    PartnersModule,
  ],
  controllers: [HealthController],
  providers: [
    // Ordem importa: autentica (JWT) antes de checar role (RBAC); throttler global.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
