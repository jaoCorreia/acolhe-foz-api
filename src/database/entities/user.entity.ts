import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserRole } from '../../common/enums';
import { Shelter } from './shelter.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 120 })
  email: string;

  // Nunca exposto na API (excluído nos serializers). RNF-011.
  @Column({ type: 'text', select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'uuid', nullable: true })
  shelterId: string | null;

  @ManyToOne(() => Shelter, { nullable: true })
  @JoinColumn({ name: 'shelter_id' })
  shelter?: Shelter;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  mustChangePassword: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;
}
