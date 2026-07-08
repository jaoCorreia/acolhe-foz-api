import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('partners')
@ApiBearerAuth()
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @Roles(UserRole.GESTAO, UserRole.ADMIN)
  findAll() {
    return this.partnersService.findAll();
  }

  @Get('summary')
  @Roles(UserRole.GESTAO, UserRole.ADMIN)
  summary() {
    return this.partnersService.summary();
  }

  @Post()
  @Roles(UserRole.GESTAO, UserRole.ADMIN)
  create(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.GESTAO, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return this.partnersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.partnersService.remove(id);
    return { success: true };
  }
}
