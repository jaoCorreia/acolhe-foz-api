import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

// RF-075: consulta do log de auditoria (somente ADMIN).
@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findAll({ userId, action, limit: limit ? +limit : 100 });
  }
}
