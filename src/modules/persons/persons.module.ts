import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Approach, Person, Referral, ShelterStay } from '../../database/entities';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Approach, Referral, ShelterStay])],
  providers: [PersonsService],
  controllers: [PersonsController],
  exports: [PersonsService],
})
export class PersonsModule {}
