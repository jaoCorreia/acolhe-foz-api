import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Approach, Person, Referral, ShelterStay } from '../../database/entities';
import { CreatePersonDto, SearchPersonDto, UpdatePersonDto } from './dto/person.dto';
import { PaginationDto, paginate } from '../../common/pagination.dto';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person) private readonly persons: Repository<Person>,
    @InjectRepository(Approach) private readonly approaches: Repository<Approach>,
    @InjectRepository(Referral) private readonly referrals: Repository<Referral>,
    @InjectRepository(ShelterStay) private readonly stays: Repository<ShelterStay>,
  ) {}

  async findAll(dto: PaginationDto) {
    const [data, total] = await this.persons.findAndCount({
      skip: dto.skip,
      take: dto.limit,
      order: { name: 'ASC' },
    });
    return paginate(data, total, dto);
  }

  // RF-011/RF-012 + RN-010: busca por CPF (exata) ou nome (fragmento).
  async search(dto: SearchPersonDto): Promise<Person[]> {
    const limit = Math.min(dto.limit ?? 20, 50);
    if (dto.cpf) {
      const p = await this.persons.findOne({ where: { cpf: dto.cpf } });
      return p ? [p] : [];
    }
    if (!dto.q || dto.q.trim().length < 2) return [];
    const q = dto.q.trim();
    // Se o termo parece um CPF, prioriza match por CPF.
    if (/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(q)) {
      const p = await this.persons.findOne({ where: { cpf: q } });
      return p ? [p] : [];
    }
    return this.persons.find({
      where: [{ name: ILike(`%${q}%`) }, { cpf: ILike(`%${q}%`) }],
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findByCpf(cpf: string): Promise<Person | null> {
    return this.persons.findOne({ where: { cpf } });
  }

  async findById(id: string): Promise<Person> {
    const person = await this.persons.findOne({ where: { id } });
    if (!person) throw new NotFoundException('Pessoa não encontrada');
    return person;
  }

  // RF-013: perfil completo + timeline de abordagens, encaminhamentos e estadas.
  async findWithHistory(id: string) {
    const person = await this.findById(id);
    const approaches = await this.approaches.find({
      where: { personId: id },
      relations: { user: true },
      order: { approachDate: 'DESC' },
    });
    const stays = await this.stays.find({
      where: { personId: id },
      relations: { shelter: true },
      order: { checkInAt: 'DESC' },
    });
    // Encaminhamentos da pessoa (via abordagens) com a casa de destino.
    const referrals = await this.referrals
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.shelter', 'shelter')
      .leftJoin('r.approach', 'approach')
      .addSelect(['approach.id', 'approach.approachDate', 'approach.locationName'])
      .where('approach.personId = :id', { id })
      .orderBy('r.createdAt', 'DESC')
      .getMany();
    return {
      ...person,
      stats: {
        totalApproaches: approaches.length,
        totalReferrals: referrals.length,
        totalStays: stays.length,
        lastApproachAt: approaches[0]?.approachDate ?? null,
      },
      approaches,
      referrals,
      stays,
    };
  }

  async create(dto: CreatePersonDto): Promise<Person> {
    if (dto.cpf) {
      const existing = await this.persons.findOne({ where: { cpf: dto.cpf } });
      if (existing) {
        throw new ConflictException({
          message: 'Já existe pessoa cadastrada com este CPF',
          personId: existing.id,
        });
      }
    }
    const person = this.persons.create(dto as Partial<Person>);
    return this.persons.save(person);
  }

  async update(id: string, dto: UpdatePersonDto): Promise<Person> {
    const person = await this.findById(id);
    if (dto.cpf && dto.cpf !== person.cpf) {
      const existing = await this.persons.findOne({ where: { cpf: dto.cpf } });
      if (existing && existing.id !== id) throw new ConflictException('CPF já cadastrado em outra pessoa');
    }
    Object.assign(person, dto);
    return this.persons.save(person);
  }

  // RF-015: soft delete (mantém rastreabilidade).
  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.persons.softDelete(id);
  }
}
