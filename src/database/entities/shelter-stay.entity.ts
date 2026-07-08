import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ExitReason } from '../../common/enums';
import { Person } from './person.entity';
import { Shelter } from './shelter.entity';
import { Referral } from './referral.entity';

// Histórico de estadas. Triggers no banco ajustam shelters.current_occupancy.
@Entity('shelter_stays')
export class ShelterStay extends BaseEntity {
  @Column({ type: 'uuid' })
  personId: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person?: Person;

  @Column({ type: 'uuid' })
  shelterId: string;

  @ManyToOne(() => Shelter)
  @JoinColumn({ name: 'shelter_id' })
  shelter?: Shelter;

  @Column({ type: 'uuid', nullable: true })
  referralId: string | null;

  @ManyToOne(() => Referral, { nullable: true })
  @JoinColumn({ name: 'referral_id' })
  referral?: Referral;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  checkInAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  checkOutAt: Date | null;

  @Column({ type: 'enum', enum: ExitReason, nullable: true })
  exitReason: ExitReason | null;
}
