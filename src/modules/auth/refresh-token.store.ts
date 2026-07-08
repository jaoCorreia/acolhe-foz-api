import { Injectable } from '@nestjs/common';

/**
 * Armazenamento de refresh tokens válidos com rotação (RNF-012).
 *
 * PoC: implementação em memória. Em produção, substituir por Redis/DB
 * (conforme Documentação Técnica) sem alterar a interface.
 */
@Injectable()
export class RefreshTokenStore {
  private readonly valid = new Map<string, Set<string>>(); // userId -> jti[]

  save(userId: string, jti: string): void {
    if (!this.valid.has(userId)) this.valid.set(userId, new Set());
    this.valid.get(userId)!.add(jti);
  }

  isValid(userId: string, jti: string): boolean {
    return this.valid.get(userId)?.has(jti) ?? false;
  }

  // Rotação: invalida o jti usado e registra o novo.
  rotate(userId: string, oldJti: string, newJti: string): void {
    this.valid.get(userId)?.delete(oldJti);
    this.save(userId, newJti);
  }

  revoke(userId: string, jti: string): void {
    this.valid.get(userId)?.delete(jti);
  }

  revokeAll(userId: string): void {
    this.valid.delete(userId);
  }
}
