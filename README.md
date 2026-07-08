# API — ACOLHE Foz (NestJS)

API REST centralizada (hub-and-spoke): app mobile e dashboard web consomem os
mesmos endpoints. NestJS + TypeORM + PostgreSQL/PostGIS, JWT + RBAC, Swagger.

## Rodar

```bash
cp .env.example .env          # ajuste DATABASE_URL e os segredos JWT
npm install
npm run start:dev
```

- API: `http://localhost:3000/api`
- Swagger/OpenAPI: `http://localhost:3000/api/docs`
- Health: `GET /api/health`

> O schema é gerenciado por `db/schema.sql` (`synchronize: false`). Crie o banco
> antes de subir a API (ver `db/README.md`) ou use `docker compose up`.

## Módulos

`AuthModule`, `UsersModule`, `PersonsModule`, `ApproachesModule`,
`ReferralsModule`, `SheltersModule`, `StaysModule`, `DashboardModule`,
`PartnersModule`, `AuditModule`.

## Endpoints principais

| Método | Rota | Perfis | Descrição |
|---|---|---|---|
| POST | `/auth/login` | público | access (15m) + refresh (7d) |
| POST | `/auth/refresh` | público | renova o access token (rotação) |
| POST | `/auth/logout` | JWT | invalida o refresh token |
| GET | `/persons/search` | todos | busca por nome/CPF (app) |
| POST | `/persons` | ABORDAGEM, ADMIN | cadastra pessoa |
| GET | `/persons/:id` | todos | perfil + histórico |
| POST | `/approaches` | ABORDAGEM | registra abordagem (GPS) |
| GET | `/approaches?mineToday=true` | JWT | abordagens do dia do usuário |
| GET | `/shelters/eligible` | JWT | casas elegíveis por perfil/período |
| POST | `/referrals` | ABORDAGEM, GESTAO, ADMIN | cria encaminhamento |
| PATCH | `/referrals/:id/status` | CASA, GESTAO, ADMIN | confirma/recusa |
| POST | `/stays/check-in` | CASA, ADMIN | entrada na casa |
| PATCH | `/stays/:id/check-out` | CASA, ADMIN | saída da casa |
| GET | `/dashboard/summary` | GESTAO, ADMIN | KPIs |
| GET | `/dashboard/heatmap` | GESTAO, ADMIN | pontos do mapa de calor |
| GET | `/dashboard/timeseries` | GESTAO, ADMIN | série temporal |
| GET | `/dashboard/occupancy` | GESTAO, ADMIN | ocupação das casas |
| GET | `/dashboard/demographics` | GESTAO, ADMIN | distribuição demográfica |
| GET | `/dashboard/violations` | GESTAO, ADMIN | ranking de violações |
| GET | `/dashboard/recurrence` | GESTAO, ADMIN | casos recorrentes (N+) |
| GET | `/partners` · `/partners/summary` | GESTAO, ADMIN | empresas parceiras |
| GET | `/audit` | ADMIN | log de auditoria |

## Segurança / LGPD

JWT curto + refresh rotativo (in-memory store na PoC; trocar por Redis em prod),
bcrypt custo 12, `RolesGuard` global, validação de DTOs com `whitelist`,
rate limiting (`@nestjs/throttler`), CORS por lista branca, soft delete e
`audit_logs` imutável.

## Migrations (opcional)

O schema canônico é `db/schema.sql`. Para fluxo via TypeORM:

```bash
npm run migration:generate -- src/database/migrations/Init
npm run migration:run
```
