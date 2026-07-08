import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approach, Referral, Shelter } from '../../database/entities';
import { CreateReferralDto, UpdateReferralStatusDto } from './dto/referral.dto';
import {
  DestinationType,
  Period,
  ReferralBy,
  ReferralStatus,
  UserRole,
} from '../../common/enums';
import { AuthUser } from '../../common/decorators';

const SHELTER_DESTINATIONS = [DestinationType.CP1, DestinationType.CP2, DestinationType.CP3];

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referral) private readonly repo: Repository<Referral>,
    @InjectRepository(Approach) private readonly approaches: Repository<Approach>,
    @InjectRepository(Shelter) private readonly shelters: Repository<Shelter>,
  ) {}

  async create(dto: CreateReferralDto, actor: AuthUser): Promise<Referral> {
    const approach = await this.approaches.findOne({ where: { id: dto.approachId } });
    if (!approach) throw new NotFoundException('Abordagem não encontrada');

    const isShelter = SHELTER_DESTINATIONS.includes(dto.destinationType);
    if (isShelter && !dto.shelterId) {
      throw new BadRequestException('shelterId é obrigatório para encaminhamento a casa de passagem');
    }

    // RN-006: bloqueia encaminhamento sem vagas, exceto force por ADMIN/GESTAO.
    if (dto.shelterId) {
      const shelter = await this.shelters.findOne({ where: { id: dto.shelterId } });
      if (!shelter) throw new NotFoundException('Casa de acolhimento não encontrada');
      const available = shelter.totalCapacity - shelter.currentOccupancy;
      if (available <= 0) {
        const canForce = actor.role === UserRole.ADMIN || actor.role === UserRole.GESTAO;
        if (!dto.force || !canForce) {
          throw new BadRequestException(
            'Casa sem vagas. Apenas ADMIN/GESTAO podem forçar com justificativa (force=true).',
          );
        }
        if (!dto.notes) throw new BadRequestException('Justificativa obrigatória ao forçar encaminhamento');
      }
    }

    // RN-003/RN-004: mediador determinado pelo período da abordagem.
    const referredBy = approach.period === Period.DIA ? ReferralBy.CENTRO_POP : ReferralBy.EQUIPE_ABORDAGEM;

    const referral = this.repo.create({
      approachId: dto.approachId,
      destinationType: dto.destinationType,
      shelterId: dto.shelterId ?? null,
      referredBy,
      status: ReferralStatus.PENDENTE,
      notes: dto.notes ?? null,
    });
    return this.repo.save(referral);
  }

  async findById(id: string): Promise<Referral> {
    const referral = await this.repo.findOne({
      where: { id },
      relations: { shelter: true, approach: { person: true } },
    });
    if (!referral) throw new NotFoundException('Encaminhamento não encontrado');
    return referral;
  }

  // RF-043: encaminhamentos de uma casa (perfil CASA vê apenas a sua).
  async listByShelter(shelterId: string, status?: ReferralStatus) {
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.approach', 'approach')
      .leftJoinAndSelect('approach.person', 'person')
      .leftJoinAndSelect('r.shelter', 'shelter')
      .where('r.shelterId = :shelterId', { shelterId })
      .orderBy('r.createdAt', 'DESC');
    if (status) qb.andWhere('r.status = :status', { status });
    return qb.getMany();
  }

  async listAll(status?: ReferralStatus) {
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.approach', 'approach')
      .leftJoinAndSelect('approach.person', 'person')
      .leftJoinAndSelect('r.shelter', 'shelter')
      .orderBy('r.createdAt', 'DESC');
    if (status) qb.andWhere('r.status = :status', { status });
    return qb.getMany();
  }

  // RF-032/RF-033: casa confirma ou recusa o encaminhamento.
  async updateStatus(id: string, dto: UpdateReferralStatusDto, actor: AuthUser): Promise<Referral> {
    const referral = await this.findById(id);

    // Perfil CASA só altera encaminhamentos da própria casa.
    if (actor.role === UserRole.CASA && referral.shelterId !== actor.shelterId) {
      throw new ForbiddenException('Encaminhamento de outra casa');
    }
    if (dto.status === ReferralStatus.RECUSADO && !dto.notes) {
      throw new BadRequestException('Informe o motivo da recusa');
    }
    referral.status = dto.status;
    if (dto.notes) referral.notes = dto.notes;
    if (dto.status === ReferralStatus.CONFIRMADO && !referral.confirmedAt) {
      referral.confirmedAt = new Date();
    }
    return this.repo.save(referral);
  }
}
