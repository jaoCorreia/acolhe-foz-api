import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApproachesService } from './approaches.service';
import { CreateApproachDto, ListApproachesDto, UpdateApproachDto } from './dto/approach.dto';
import { AuthUser, CurrentUser, Roles } from '../../common/decorators';
import { AuditAction, UserRole } from '../../common/enums';
import { AuditService } from '../audit/audit.service';

@ApiTags('approaches')
@ApiBearerAuth()
@Controller('approaches')
export class ApproachesController {
  constructor(
    private readonly approachesService: ApproachesService,
    private readonly audit: AuditService,
  ) {}

  // RF-020/RF-021: registra abordagem (com GPS) — perfil ABORDAGEM.
  @Post()
  @Roles(UserRole.ABORDAGEM, UserRole.ADMIN)
  async create(@Body() dto: CreateApproachDto, @CurrentUser() actor: AuthUser, @Req() req: any) {
    const approach = await this.approachesService.create(dto, actor.sub);
    await this.audit.record({
      userId: actor.sub,
      action: AuditAction.CREATE_APPROACH,
      entityType: 'approaches',
      entityId: approach.id,
      ipAddress: req.ip,
    });
    return approach;
  }

  // Lista geral (gestão) ou "minhas de hoje" (app).
  @Get()
  list(@Query() dto: ListApproachesDto, @CurrentUser() actor: AuthUser) {
    return this.approachesService.list(dto, actor);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.approachesService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ABORDAGEM, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateApproachDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: any,
  ) {
    const approach = await this.approachesService.update(id, dto, actor);
    await this.audit.record({
      userId: actor.sub,
      action: AuditAction.UPDATE_APPROACH,
      entityType: 'approaches',
      entityId: id,
      ipAddress: req.ip,
      metadata: { fields: Object.keys(dto) },
    });
    return approach;
  }
}
