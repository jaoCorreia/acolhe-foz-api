import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PersonsService } from './persons.service';
import { CreatePersonDto, SearchPersonDto, UpdatePersonDto } from './dto/person.dto';
import { PaginationDto } from '../../common/pagination.dto';
import { AuthUser, CurrentUser, Roles } from '../../common/decorators';
import { AuditAction, UserRole } from '../../common/enums';
import { AuditService } from '../audit/audit.service';

// RNF-020: campos sensíveis de saúde/substâncias apenas para GESTAO e ADMIN.
const SENSITIVE_FIELDS = ['hasMentalDisorder', 'mentalDisorderDesc', 'substanceDependency', 'photoUrl'] as const;
function stripSensitive<T extends object>(obj: T, role: UserRole): T {
  if (role === UserRole.GESTAO || role === UserRole.ADMIN) return obj;
  const copy: any = { ...obj };
  for (const f of SENSITIVE_FIELDS) delete copy[f];
  return copy as T;
}

@ApiTags('persons')
@ApiBearerAuth()
@Controller('persons')
export class PersonsController {
  constructor(
    private readonly personsService: PersonsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  @Roles(UserRole.GESTAO, UserRole.ADMIN)
  async findAll(@Query() pagination: PaginationDto, @CurrentUser() actor: AuthUser) {
    const result = await this.personsService.findAll(pagination);
    return { ...result, data: result.data.map((p) => stripSensitive(p, actor.role)) };
  }

  // Busca usada pelo app antes de cadastrar (RF-011/RF-012) — todos os perfis.
  @Get('search')
  async search(@Query() dto: SearchPersonDto, @CurrentUser() actor: AuthUser) {
    const persons = await this.personsService.search(dto);
    return persons.map((p) => stripSensitive(p, actor.role));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() actor: AuthUser) {
    const result = await this.personsService.findWithHistory(id);
    const { approaches, referrals, stays, stats, ...person } = result;
    return { ...stripSensitive(person as any, actor.role), approaches, referrals, stays, stats };
  }

  @Post()
  @Roles(UserRole.ABORDAGEM, UserRole.ADMIN)
  async create(@Body() dto: CreatePersonDto, @CurrentUser() actor: AuthUser, @Req() req: any) {
    const person = await this.personsService.create(dto);
    await this.audit.record({
      userId: actor.sub,
      action: AuditAction.CREATE_PERSON,
      entityType: 'persons',
      entityId: person.id,
      ipAddress: req.ip,
    });
    return person;
  }

  @Patch(':id')
  @Roles(UserRole.ABORDAGEM, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: any,
  ) {
    const person = await this.personsService.update(id, dto);
    await this.audit.record({
      userId: actor.sub,
      action: AuditAction.UPDATE_PERSON,
      entityType: 'persons',
      entityId: id,
      ipAddress: req.ip,
      metadata: { fields: Object.keys(dto) },
    });
    return person;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.personsService.softDelete(id);
    return { success: true };
  }
}
