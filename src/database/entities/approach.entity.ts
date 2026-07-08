import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity, numericTransformer } from '../base.entity';
import { DemandType, Period } from '../../common/enums';
import { Person } from './person.entity';
import { User } from './user.entity';

// Cada atendimento em campo. Base do histórico e do mapa de calor.
@Entity('approaches')
export class Approach extends BaseEntity {
  @Column({ type: 'uuid' })
  personId: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person?: Person;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'timestamptz' })
  approachDate: Date;

  @Column({ type: 'enum', enum: DemandType })
  demandType: DemandType;

  @Column({ type: 'varchar', length: 200 })
  locationName: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: numericTransformer })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: numericTransformer })
  longitude: number | null;

  @Column({ type: 'enum', enum: Period })
  period: Period;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  violations: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  procedures: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  seasServices: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  suppressedDemands: string[];

  @Column({ type: 'varchar', length: 60, nullable: true })
  streetTimeFoz: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  streetTimeTotal: string | null;

  @Column({ name: 'recent_service_30d', type: 'boolean', nullable: true })
  recentService30d: boolean | null;

  @Column({ name: 'recent_service_desc', type: 'text', nullable: true })
  recentServiceDesc: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
