import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { PartnerStatus } from '../../common/enums';

// Empresas parceiras (tela 08) — contratação de pessoas em situação de rua.
@Entity('partner_companies')
export class PartnerCompany extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  legalName: string;

  @Column({ type: 'varchar', length: 18 })
  cnpj: string;

  @Column({ type: 'varchar', length: 100 })
  sector: string;

  @Column({ type: 'int', default: 0 })
  openPositions: number;

  @Column({ type: 'int', default: 0 })
  hiredCount: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  contactPhone: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  serviceTypes: string[];

  @Column({ type: 'enum', enum: PartnerStatus, default: PartnerStatus.ANALISE })
  status: PartnerStatus;
}
