import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DestinationType, ReferralStatus } from '../../../common/enums';

export class CreateReferralDto {
  @ApiProperty()
  @IsUUID()
  approachId: string;

  @ApiProperty({ enum: DestinationType })
  @IsEnum(DestinationType)
  destinationType: DestinationType;

  @ApiPropertyOptional({ description: 'Obrigatório quando destino é CP1/CP2/CP3' })
  @IsOptional()
  @IsUUID()
  shelterId?: string;

  @ApiPropertyOptional({ description: 'Forçar mesmo sem vagas (ADMIN/GESTAO) — RN-006' })
  @IsOptional()
  @IsBoolean()
  force?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateReferralStatusDto {
  @ApiProperty({ enum: ReferralStatus })
  @IsEnum(ReferralStatus)
  status: ReferralStatus;

  @ApiPropertyOptional({ description: 'Obrigatório quando status = RECUSADO' })
  @IsOptional()
  @IsString()
  notes?: string;
}
