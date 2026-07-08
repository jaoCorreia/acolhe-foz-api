import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities';
import { AuditAction } from '../../common/enums';

interface AuditEntry {
  userId: string;
  action: AuditAction | string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, any> | null;
}

// Registro imutável de operações sensíveis (RF-074, RN-030).
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async record(entry: AuditEntry): Promise<void> {
    // Falha de auditoria nunca deve derrubar a operação principal.
    try {
      await this.repo.insert({
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        ipAddress: entry.ipAddress ?? null,
        metadata: entry.metadata ?? null,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[audit] falha ao registrar log:', (err as Error).message);
    }
  }

  async findAll(filters: { userId?: string; action?: string; limit?: number }): Promise<AuditLog[]> {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC').take(filters.limit ?? 100);
    if (filters.userId) qb.andWhere('a.userId = :userId', { userId: filters.userId });
    if (filters.action) qb.andWhere('a.action = :action', { action: filters.action });
    return qb.getMany();
  }
}
