import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SheltersService } from './shelters.service';
import { CreateShelterDto, EligibleSheltersDto, UpdateShelterDto } from './dto/shelter.dto';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('shelters')
@ApiBearerAuth()
@Controller('shelters')
export class SheltersController {
  constructor(private readonly sheltersService: SheltersService) {}

  // Lista com vagas/ocupação — todos os perfis (usado no app e dashboard).
  @Get()
  findAll() {
    return this.sheltersService.findAll();
  }

  // Casas elegíveis para um perfil/período (tela de encaminhamento).
  @Get('eligible')
  findEligible(@Query() dto: EligibleSheltersDto) {
    return this.sheltersService.findEligible(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sheltersService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateShelterDto) {
    return this.sheltersService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTAO)
  update(@Param('id') id: string, @Body() dto: UpdateShelterDto) {
    return this.sheltersService.update(id, dto);
  }
}
