import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PartnerCompany } from '../../database/entities';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';
import { PartnerStatus } from '../../common/enums';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(PartnerCompany) private readonly repo: Repository<PartnerCompany>,
  ) {}

  findAll() {
    return this.repo.find({ where: { deletedAt: IsNull() }, order: { legalName: 'ASC' } });
  }

  async summary() {
    const [row] = await this.repo
      .createQueryBuilder('c')
      .select('count(*)', 'total')
      .addSelect(`count(*) FILTER (WHERE c.status = 'ATIVA')`, 'active')
      .addSelect('coalesce(sum(c.open_positions),0)', 'openPositions')
      .addSelect('coalesce(sum(c.hired_count),0)', 'hired')
      .addSelect('count(DISTINCT c.sector)', 'sectors')
      .where('c.deleted_at IS NULL')
      .execute();
    return {
      total: Number(row.total),
      active: Number(row.active),
      openPositions: Number(row.openPositions),
      hired: Number(row.hired),
      sectors: Number(row.sectors),
    };
  }

  async create(dto: CreatePartnerDto): Promise<PartnerCompany> {
    const existing = await this.repo.findOne({ where: { cnpj: dto.cnpj } });
    if (existing) throw new ConflictException('CNPJ já cadastrado');
    return this.repo.save(
      this.repo.create({ ...dto, status: dto.status ?? PartnerStatus.ANALISE } as Partial<PartnerCompany>),
    );
  }

  async update(id: string, dto: UpdatePartnerDto): Promise<PartnerCompany> {
    const partner = await this.repo.findOne({ where: { id } });
    if (!partner) throw new NotFoundException('Empresa parceira não encontrada');
    Object.assign(partner, dto);
    return this.repo.save(partner);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
