import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from './enums';

// Marca rota como pública (sem JWT) — usada pelo guard global.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Declara quais roles podem acessar a rota (RF-004).
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
  shelterId: string | null;
  name: string;
}

// Injeta o usuário autenticado (payload do JWT) no handler.
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | any => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  },
);
