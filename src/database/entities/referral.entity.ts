import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { DestinationType, ReferralBy, ReferralStatus } from '../../common/enums';
import { Approach } from './approach.entity';
import { Shelter } from './shelter.entity';

@Entity('referrals')
export class Referral extends BaseEntity {
  @Column({ type: 'uuid' })
  approachId: string;

  @ManyToOne(() => Approach)
  @JoinColumn({ name: 'approach_id' })
  approach?: Approach;

  @Column({ type: 'enum', enum: DestinationType })
  destinationType: DestinationType;

  @Column({ type: 'uuid', nullable: true })
  shelterId: string | null;

  @ManyToOne(() => Shelter, { nullable: true })
  @JoinColumn({ name: 'shelter_id' })
  shelter?: Shelter;

  @Column({ type: 'enum', enum: ReferralBy })
  referredBy: ReferralBy;

  @Column({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDENTE })
  status: ReferralStatus;

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
