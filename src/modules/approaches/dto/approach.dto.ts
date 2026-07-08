import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { DemandType, Period } from '../../../common/enums';

export class CreateApproachDto {
  @ApiProperty()
  @IsUUID()
  personId: string;

  @ApiPropertyOptional({ description: 'Default: agora' })
  @IsOptional()
  @IsDateString()
  approachDate?: string;

  @ApiProperty({ enum: DemandType })
  @IsEnum(DemandType)
  demandType: DemandType;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  locationName: string;

  @ApiPropertyOptional({ description: 'GPS capturado pelo app' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ enum: Period })
  @IsEnum(Period)
  period: Period;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  violations?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  procedures?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seasServices?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suppressedDemands?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  streetTimeFoz?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  streetTimeTotal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  recentService30d?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recentServiceDesc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateApproachDto extends PartialType(CreateApproachDto) {}

export class ListApproachesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: Period })
  @IsOptional()
  @IsEnum(Period)
  period?: Period;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Somente abordagens de hoje do usuário logado (app)' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  mineToday?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
