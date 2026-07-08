import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Shelter, ShelterStay } from '../../database/entities';
import { CheckInDto, CheckOutDto } from './dto/stay.dto';

/**
 * shelters.current_occupancy é atualizado automaticamente pelo trigger
 * trg_stay_occupancy (schema.sql) no INSERT/UPDATE de shelter_stays (RN-020).
 * Este serviço apenas gerencia as linhas de estada.
 */
@Injectable()
export class StaysService {
  constructor(
    @InjectRepository(ShelterStay) private readonly repo: Repository<ShelterStay>,
    @InjectRepository(Shelter) private readonly shelters: Repository<Shelter>,
  ) {}

  // RF-040: registra entrada.
  async checkIn(dto: CheckInDto): Promise<ShelterStay> {
    const shelter = await this.shelters.findOne({ where: { id: dto.shelterId } });
    if (!shelter) throw new NotFoundException('Casa de acolhimento não encontrada');

    const active = await this.repo.findOne({
      where: { personId: dto.personId, checkOutAt: IsNull() },
    });
    if (active) {
      throw new BadRequestException('Pessoa já possui estada ativa. Faça o check-out antes.');
    }
    if (shelter.currentOccupancy >= shelter.totalCapacity) {
      throw new BadRequestException('Casa sem vagas disponíveis');
    }

    const stay = this.repo.create({
      personId: dto.personId,
      shelterId: dto.shelterId,
      referralId: dto.referralId ?? null,
      checkInAt: dto.checkInAt ? new Date(dto.checkInAt) : new Date(),
    });
    return this.repo.save(stay);
  }

  // RF-041: registra saída.
  async checkOut(id: string, dto: CheckOutDto): Promise<ShelterStay> {
    const stay = await this.repo.findOne({ where: { id } });
    if (!stay) throw new NotFoundException('Estada não encontrada');
    if (stay.checkOutAt) throw new BadRequestException('Estada já encerrada');

    stay.checkOutAt = dto.checkOutAt ? new Date(dto.checkOutAt) : new Date();
    stay.exitReason = dto.exitReason;
    return this.repo.save(stay);
  }

  // RF-044: histórico de estadas de uma pessoa.
  listByPerson(personId: string) {
    return this.repo.find({
      where: { personId },
      relations: { shelter: true },
      order: { checkInAt: 'DESC' },
    });
  }

  // Estadas ativas de uma casa (perfil CASA).
  listActiveByShelter(shelterId: string) {
    return this.repo.find({
      where: { shelterId, checkOutAt: IsNull() },
      relations: { person: true, shelter: true },
      order: { checkInAt: 'DESC' },
    });
  }

  // Estadas ativas de toda a rede (GESTAO/ADMIN).
  listAllActive() {
    return this.repo.find({
      where: { checkOutAt: IsNull() },
      relations: { person: true, shelter: true },
      order: { checkInAt: 'DESC' },
    });
  }
}
