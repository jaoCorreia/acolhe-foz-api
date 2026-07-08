import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Gender, Period } from '../../../common/enums';

export class CreateShelterDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ type: [String], description: 'MULHERES|CRIANCAS|FAMILIAS|IDOSOS|HOMENS_ADULTOS|PCD' })
  @IsArray()
  @IsString({ each: true })
  targetProfile: string[];

  @ApiProperty()
  @IsInt()
  @Min(0)
  totalCapacity: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  acceptsSelfReferral?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateShelterDto extends PartialType(CreateShelterDto) {
  @ApiPropertyOptional({ description: 'Ajuste manual da ocupação (ADMIN)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentOccupancy?: number;
}

// Filtro de elegibilidade para encaminhamento (tela 04 do app).
export class EligibleSheltersDto {
  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ enum: Period })
  @IsEnum(Period)
  period: Period;

  @ApiPropertyOptional({ description: 'Idade (anos). Usada para mapear o perfil.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  age?: number;
}
