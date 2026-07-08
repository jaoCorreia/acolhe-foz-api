import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Education, Ethnicity, Gender, IncomeType, Region } from '../../common/enums';

// Entidade central — mapeia o formulário físico de abordagem.
@Entity('persons')
export class Person extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'date', nullable: true })
  birthDate: string | null;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cpf: string | null;

  @Column({ type: 'enum', enum: Region, nullable: true })
  region: Region | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  nationality: string | null;

  @Column({ type: 'enum', enum: Ethnicity, nullable: true })
  ethnicity: Ethnicity | null;

  @Column({ type: 'enum', enum: Education, nullable: true })
  education: Education | null;

  @Column({ type: 'boolean', nullable: true })
  isPregnant: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  hasPcd: boolean | null;

  // Campos sensíveis (saúde mental / substâncias) — acesso restrito GESTAO/ADMIN (RNF-020).
  @Column({ type: 'boolean', nullable: true })
  hasMentalDisorder: boolean | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  mentalDisorderDesc: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  substanceDependency: string[];

  @Column({ type: 'enum', enum: IncomeType, nullable: true })
  incomeType: IncomeType | null;

  @Column({ type: 'boolean', nullable: true })
  isBegging: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  isLostOrDisplaced: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  receivedSocialTicket: boolean | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ticketOriginCity: string | null;

  @Column({ type: 'text', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
