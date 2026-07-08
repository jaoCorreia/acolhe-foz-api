import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shelter, ShelterStay } from '../../database/entities';
import { StaysService } from './stays.service';
import { StaysController } from './stays.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShelterStay, Shelter])],
  providers: [StaysService],
  controllers: [StaysController],
  exports: [StaysService],
})
export class StaysModule {}
