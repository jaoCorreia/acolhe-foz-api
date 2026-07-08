import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Tabela append-only / imutável (RN-031). Sem updated_at nem deleted_at.
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 60 })
  action: string;

  @Column({ type: 'varchar', length: 40 })
  entityType: string;

  @Column({ type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
