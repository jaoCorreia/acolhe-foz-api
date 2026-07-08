import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approach } from '../../database/entities';
import { CreateApproachDto, ListApproachesDto, UpdateApproachDto } from './dto/approach.dto';
import { AuthUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { paginate } from '../../common/pagination.dto';

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000; // RN-032

@Injectable()
export class ApproachesService {
  constructor(
    @InjectRepository(Approach) private readonly repo: Repository<Approach>,
  ) {}

  async create(dto: CreateApproachDto, userId: string): Promise<Approach> {
    const approach = this.repo.create({
      ...dto,
      approachDate: dto.approachDate ? new Date(dto.approachDate) : new Date(),
      userId,
    } as Partial<Approach>);
    return this.repo.save(approach);
  }

  async findById(id: string): Promise<Approach> {
    const approach = await this.repo.findOne({
      where: { id },
      relations: { person: true, user: true },
    });
    if (!approach) throw new NotFoundException('Abordagem não encontrada');
    return approach;
  }

  async list(dto: ListApproachesDto, actor: AuthUser) {
    const page = Number(dto.page) || 1;
    const limit = Math.min(Number(dto.limit) || 20, 100);
    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.person', 'person')
      .leftJoinAndSelect('a.user', 'user')
      .orderBy('a.approachDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // RF-028: app lista as abordagens do próprio usuário no dia.
    if (dto.mineToday) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      qb.andWhere('a.userId = :uid', { uid: actor.sub }).andWhere('a.approachDate >= :start', { start });
    } else if (dto.userId) {
      qb.andWhere('a.userId = :uid', { uid: dto.userId });
    }

    if (dto.from) qb.andWhere('a.approachDate >= :from', { from: new Date(dto.from) });
    if (dto.to) qb.andWhere('a.approachDate <= :to', { to: new Date(dto.to) });
    if (dto.period) qb.andWhere('a.period = :period', { period: dto.period });

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, { page, limit, skip: (page - 1) * limit } as any);
  }

  // RF-027/RN-032: edição só dentro de 24h; após isso, somente ADMIN.
  async update(id: string, dto: UpdateApproachDto, actor: AuthUser): Promise<Approach> {
    const approach = await this.findById(id);
    const age = Date.now() - new Date(approach.createdAt).getTime();
    if (age > EDIT_WINDOW_MS && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Edição permitida apenas dentro de 24h. Solicite a um ADMIN.');
    }
    if (actor.role === UserRole.ABORDAGEM && approach.userId !== actor.sub) {
      throw new ForbiddenException('Você só pode editar suas próprias abordagens');
    }
    Object.assign(approach, dto);
    if (dto.approachDate) approach.approachDate = new Date(dto.approachDate);
    return this.repo.save(approach);
  }
}
