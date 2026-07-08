import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto } from '../../common/pagination.dto';
import { Roles, CurrentUser, AuthUser } from '../../common/decorators';
import { AuditAction, UserRole } from '../../common/enums';
import { AuditService } from '../audit/audit.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateUserDto, @CurrentUser() actor: AuthUser, @Req() req: any) {
    const user = await this.usersService.create(dto);
    await this.audit.record({
      userId: actor.sub,
      action: AuditAction.CREATE_USER,
      entityType: 'users',
      entityId: user.id,
      ipAddress: req.ip,
    });
    return user;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: any,
  ) {
    const user = await this.usersService.update(id, dto);
    await this.audit.record({
      userId: actor.sub,
      action: AuditAction.UPDATE_USER,
      entityType: 'users',
      entityId: id,
      ipAddress: req.ip,
    });
    return user;
  }

  @Patch(':id/active')
  @Roles(UserRole.ADMIN)
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.usersService.setActive(id, isActive);
  }
}
