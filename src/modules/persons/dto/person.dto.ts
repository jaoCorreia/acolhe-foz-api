import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Education, Ethnicity, Gender, IncomeType, Region } from '../../../common/enums';

export class CreatePersonDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: '1989-03-27' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({ example: '000.000.000-00' })
  @IsOptional()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'CPF deve estar no formato 000.000.000-00' })
  cpf?: string;

  @ApiPropertyOptional({ enum: Region })
  @IsOptional()
  @IsEnum(Region)
  region?: Region;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  nationality?: string;

  @ApiPropertyOptional({ enum: Ethnicity })
  @IsOptional()
  @IsEnum(Ethnicity)
  ethnicity?: Ethnicity;

  @ApiPropertyOptional({ enum: Education })
  @IsOptional()
  @IsEnum(Education)
  education?: Education;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPregnant?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasPcd?: boolean;

  @ApiPropertyOptional({ description: 'Campo sensível (GESTAO/ADMIN)' })
  @IsOptional()
  @IsBoolean()
  hasMentalDisorder?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  mentalDisorderDesc?: string;

  @ApiPropertyOptional({ description: 'TABACO|ALCOOL|DROGAS|NAO_INF', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  substanceDependency?: string[];

  @ApiPropertyOptional({ enum: IncomeType })
  @IsOptional()
  @IsEnum(IncomeType)
  incomeType?: IncomeType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBegging?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLostOrDisplaced?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  receivedSocialTicket?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ticketOriginCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePersonDto extends PartialType(CreatePersonDto) {}

export class SearchPersonDto {
  @ApiPropertyOptional({ description: 'Nome, fragmento ou CPF' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: '000.000.000-00' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;
}
