import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto, UpdateReferralStatusDto } from './dto/referral.dto';
import { AuthUser, CurrentUser, Roles } from '../../common/decorators';
import { AuditAction, ReferralStatus, UserRole } from '../../common/enums';
import { AuditService } from '../audit/audit.service';

@ApiTags('referrals')
@ApiBearerAuth()
@Controller('referrals')
export class ReferralsController {
  constructor(
    private readonly referralsService: ReferralsService,
    private readonly audit: AuditService,
  ) {}

  @Post()
  @Roles(UserRole.ABORDAGEM, UserRole.GESTAO, UserRole.ADMIN)
  async create(@Body() dto: CreateReferralDto, @CurrentUser() actor: AuthUser, @Req() req: any) {
    const referral = await this.referralsService.create(dto, actor);
    await this.audit.record({
      userId: actor.sub,
      action: AuditAction.CREATE_REFERRAL,
      entityType: 'referrals',
      entityId: referral.id,
      ipAddress: req.ip,
    });
    return referral;
  }

  // Lista: CASA vê só a sua casa; GESTAO/ADMIN veem tudo.
  @Get()
  list(@CurrentUser() actor: AuthUser, @Query('status') status?: ReferralStatus) {
    if (actor.role === UserRole.CASA && actor.shelterId) {
      return this.referralsService.listByShelter(actor.shelterId, status);
    }
    return this.referralsService.listAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.referralsService.findById(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.CASA, UserRole.GESTAO, UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReferralStatusDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: any,
  ) {
    const referral = await this.referralsService.updateStatus(id, dto, actor);
    await this.audit.record({
      userId: actor.sub,
      action: AuditAction.UPDATE_REFERRAL,
      entityType: 'referrals',
      entityId: id,
      ipAddress: req.ip,
      metadata: { status: dto.status },
    });
    return referral;
  }
}
