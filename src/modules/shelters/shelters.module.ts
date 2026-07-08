import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shelter } from '../../database/entities';
import { SheltersService } from './shelters.service';
import { SheltersController } from './shelters.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Shelter])],
  providers: [SheltersService],
  controllers: [SheltersController],
  exports: [SheltersService],
})
export class SheltersModule {}
