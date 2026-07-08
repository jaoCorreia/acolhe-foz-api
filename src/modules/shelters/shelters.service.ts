import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Shelter } from '../../database/entities';
import { CreateShelterDto, EligibleSheltersDto, UpdateShelterDto } from './dto/shelter.dto';
import { Gender, Period } from '../../common/enums';

const CRITICAL_THRESHOLD = 0.9; // RN-021

export interface ShelterView extends Shelter {
  availableSpots: number;
  occupancyRate: number;
  isCritical: boolean;
}

@Injectable()
export class SheltersService {
  constructor(
    @InjectRepository(Shelter) private readonly repo: Repository<Shelter>,
  ) {}

  private decorate(s: Shelter): ShelterView {
    // occupancyRate já é um getter calculado na entidade — não reatribuir (sem setter).
    const rate = s.totalCapacity > 0 ? s.currentOccupancy / s.totalCapacity : 0;
    return Object.assign(s, {
      availableSpots: Math.max(s.totalCapacity - s.currentOccupancy, 0),
      isCritical: rate >= CRITICAL_THRESHOLD,
    });
  }

  async findAll(): Promise<ShelterView[]> {
    const shelters = await this.repo.find({ where: { deletedAt: IsNull() }, order: { name: 'ASC' } });
    return shelters.map((s) => this.decorate(s));
  }

  async findById(id: string): Promise<ShelterView> {
    const shelter = await this.repo.findOne({ where: { id } });
    if (!shelter) throw new NotFoundException('Casa de acolhimento não encontrada');
    return this.decorate(shelter);
  }

  create(dto: CreateShelterDto): Promise<Shelter> {
    return this.repo.save(this.repo.create(dto as Partial<Shelter>));
  }

  // RN-022: capacidade configurável pelo ADMIN sem alterar código.
  async update(id: string, dto: UpdateShelterDto): Promise<ShelterView> {
    const shelter = await this.repo.findOne({ where: { id } });
    if (!shelter) throw new NotFoundException('Casa de acolhimento não encontrada');
    Object.assign(shelter, dto);
    if (shelter.currentOccupancy > shelter.totalCapacity) {
      shelter.currentOccupancy = shelter.totalCapacity;
    }
    await this.repo.save(shelter);
    return this.decorate(shelter);
  }

  // Mapeia gênero + idade para os tokens de perfil (RN-005).
  private profileTokens(gender: Gender, age?: number): string[] {
    const tokens: string[] = [];
    if (age !== undefined && age < 18) tokens.push('CRIANCAS');
    if (age !== undefined && age >= 60) tokens.push('IDOSOS');
    const adult = age === undefined || (age >= 18 && age < 60);
    if (gender === Gender.FEM) tokens.push('MULHERES');
    if (gender === Gender.MASC && adult) tokens.push('HOMENS_ADULTOS');
    tokens.push('FAMILIAS'); // famílias podem acompanhar
    return tokens;
  }

  // RF-030/RF-031 + RN-005: casas elegíveis com vagas, ordenadas por disponibilidade.
  async findEligible(dto: EligibleSheltersDto) {
    const tokens = this.profileTokens(dto.gender, dto.age);
    const all = await this.findAll();
    const eligible = all.map((s) => {
      const matches = s.targetProfile.some((t) => tokens.includes(t));
      return {
        ...s,
        eligible: matches,
        hasVacancy: s.availableSpots > 0,
        // RN-003/RN-004: no DIA o encaminhamento passa pelo Centro POP.
        mediatedBy: dto.period === Period.DIA ? 'CENTRO_POP' : 'EQUIPE_ABORDAGEM',
      };
    });
    // elegíveis com vaga primeiro
    eligible.sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return b.availableSpots - a.availableSpots;
    });
    return eligible;
  }

  // Atualização atômica e segura da ocupação (espelha o trigger do banco).
  async adjustOccupancy(id: string, delta: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(Shelter)
      .set({
        currentOccupancy: () =>
          delta > 0
            ? `LEAST(current_occupancy + ${delta}, total_capacity)`
            : `GREATEST(current_occupancy - ${Math.abs(delta)}, 0)`,
      })
      .where('id = :id', { id })
      .execute();
  }
}
