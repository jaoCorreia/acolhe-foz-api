import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerCompany } from '../../database/entities';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerCompany])],
  providers: [PartnersService],
  controllers: [PartnersController],
})
export class PartnersModule {}
