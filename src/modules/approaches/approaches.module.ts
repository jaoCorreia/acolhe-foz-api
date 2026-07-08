import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Approach } from '../../database/entities';
import { ApproachesService } from './approaches.service';
import { ApproachesController } from './approaches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Approach])],
  providers: [ApproachesService],
  controllers: [ApproachesController],
  exports: [ApproachesService],
})
export class ApproachesModule {}
