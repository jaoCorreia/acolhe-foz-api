import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StaysService } from './stays.service';
import { CheckInDto, CheckOutDto } from './dto/stay.dto';
import { AuthUser, CurrentUser, Roles } from '../../common/decorators';
import { AuditAction, UserRole } from '../../common/enums';
import { AuditService } from '../audit/audit.service';

@ApiTags('stays')
@ApiBearerAuth()
@Controller('stays')
export class StaysController {
  constructor(
    private readonly staysService: StaysService,
    private readonly audit: AuditService,
  ) {}

  @Post('check-in')
  @Roles(UserRole.CASA, UserRole.ADMIN)
  async checkIn(@Body() dto: CheckInDto, @CurrentUser() actor: AuthUser, @Req() req: any) {
    const stay = await this.staysService.checkIn(dto);
    await this.audit.record({
      userId: actor.sub,
      action: AuditAction.CHECKIN,
      entityType: 'shelter_stays',
      entityId: stay.id,
      ipAddress: req.ip,
    });
    return stay;
  }

  @Patch(':id/check-out')
  @Roles(UserRole.CASA, UserRole.ADMIN)
  async checkOut(
    @Param('id') id: string,
    @Body() dto: CheckOutDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: any,
  ) {
    const stay = await this.staysService.checkOut(id, dto);
    await this.audit.record({
      userId: actor.sub,
      action: AuditAction.CHECKOUT,
      entityType: 'shelter_stays',
      entityId: id,
      ipAddress: req.ip,
      metadata: { exitReason: dto.exitReason },
    });
    return stay;
  }

  @Get()
  list(@CurrentUser() actor: AuthUser, @Query('personId') personId?: string, @Query('shelterId') shelterId?: string) {
    if (personId) return this.staysService.listByPerson(personId);
    const target = shelterId ?? (actor.role === UserRole.CASA ? actor.shelterId : undefined);
    if (target) return this.staysService.listActiveByShelter(target);
    return [];
  }
}
