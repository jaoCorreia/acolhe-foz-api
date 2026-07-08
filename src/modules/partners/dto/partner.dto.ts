import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { PartnerStatus } from '../../../common/enums';

export class CreatePartnerDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  legalName: string;

  @ApiProperty({ example: '12.345.678/0001-90' })
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ inválido (00.000.000/0000-00)' })
  cnpj: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  sector: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  openPositions?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  hiredCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  contactPhone?: string;

  @ApiPropertyOptional({ type: [String], description: 'CLT|DIARIA|TEMPORARIO' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceTypes?: string[];

  @ApiPropertyOptional({ enum: PartnerStatus })
  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;
}

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {}
