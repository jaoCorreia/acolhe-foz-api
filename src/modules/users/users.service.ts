import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/entities';
import { UserRole } from '../../common/enums';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto, paginate } from '../../common/pagination.dto';

const BCRYPT_COST = 12; // RNF-011

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  // Inclui passwordHash (select:false) — usado apenas internamente pelo Auth.
  findByEmailWithSecret(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email })
      .getOne();
  }

  findByIdWithSecret(id: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findAll(dto: PaginationDto) {
    const [data, total] = await this.repo.findAndCount({
      skip: dto.skip,
      take: dto.limit,
      order: { createdAt: 'DESC' },
    });
    return paginate(data, total, dto);
  }

  async create(dto: CreateUserDto): Promise<User> {
    if (dto.role === UserRole.CASA && !dto.shelterId) {
      throw new BadRequestException('shelterId é obrigatório para usuários do tipo CASA');
    }
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const user = this.repo.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, BCRYPT_COST),
      role: dto.role,
      shelterId: dto.role === UserRole.CASA ? dto.shelterId! : null,
      mustChangePassword: true, // RF-073: troca no primeiro acesso
    });
    return this.repo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (dto.email && dto.email !== user.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('E-mail já cadastrado');
    }
    Object.assign(user, {
      name: dto.name ?? user.name,
      email: dto.email ?? user.email,
      role: dto.role ?? user.role,
      shelterId: dto.shelterId !== undefined ? dto.shelterId : user.shelterId,
      isActive: dto.isActive !== undefined ? dto.isActive : user.isActive,
    });
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
      user.mustChangePassword = true;
    }
    return this.repo.save(user);
  }

  // RF-071: ativar/desativar sem excluir.
  async setActive(id: string, isActive: boolean): Promise<User> {
    const user = await this.findById(id);
    user.isActive = isActive;
    return this.repo.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.repo.update(id, { lastLoginAt: new Date() });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findByIdWithSecret(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new BadRequestException('Senha atual incorreta');
    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
    user.mustChangePassword = false;
    await this.repo.save(user);
  }
}
