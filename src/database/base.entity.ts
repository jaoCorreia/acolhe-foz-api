import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Colunas implícitas em todas as tabelas (Dicionário de Dados): created_at,
// updated_at e deleted_at (soft delete — RNF-021).
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}

// TypeORM retorna DECIMAL como string; converte para number na aplicação.
export const numericTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value === null || value === undefined ? null : parseFloat(value)),
};
