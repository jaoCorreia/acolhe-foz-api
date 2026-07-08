import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Period } from '../../../common/enums';

export class DashboardFilterDto {
  @ApiPropertyOptional({ description: 'Data inicial (ISO)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Data final (ISO)' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: Period })
  @IsOptional()
  @IsEnum(Period)
  period?: Period;

  @ApiPropertyOptional({ description: 'Filtrar por violação (ex: SITUACAO_RUA)' })
  @IsOptional()
  @IsString()
  violation?: string;

  @ApiPropertyOptional({ description: 'Casa de acolhimento' })
  @IsOptional()
  @IsString()
  shelterId?: string;
}

export class TimeseriesDto extends DashboardFilterDto {
  @ApiPropertyOptional({ enum: ['day', 'week', 'month'], default: 'day' })
  @IsOptional()
  @IsString()
  granularity?: 'day' | 'week' | 'month' = 'day';
}

export class RecurrenceDto extends DashboardFilterDto {
  @ApiPropertyOptional({ default: 3, description: 'Mínimo de abordagens (N)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minApproaches?: number = 3;
}
