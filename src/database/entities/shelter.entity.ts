import { Column, Entity } from 'typeorm';
import { BaseEntity, numericTransformer } from '../base.entity';

@Entity('shelters')
export class Shelter extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  // MULHERES|CRIANCAS|FAMILIAS|IDOSOS|HOMENS_ADULTOS (RN-005)
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  targetProfile: string[];

  @Column({ type: 'int' })
  totalCapacity: number;

  @Column({ type: 'int', default: 0 })
  currentOccupancy: number;

  @Column({ type: 'boolean', default: false })
  acceptsSelfReferral: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: numericTransformer })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: numericTransformer })
  longitude: number | null;

  // Derivado: percentual de ocupação (não persistido).
  get occupancyRate(): number {
    return this.totalCapacity > 0 ? Math.round((this.currentOccupancy / this.totalCapacity) * 100) : 0;
  }
}
