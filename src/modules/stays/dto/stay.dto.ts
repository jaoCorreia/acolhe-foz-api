import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ExitReason } from '../../../common/enums';

export class CheckInDto {
  @ApiProperty()
  @IsUUID()
  personId: string;

  @ApiProperty()
  @IsUUID()
  shelterId: string;

  @ApiPropertyOptional({ description: 'Encaminhamento que originou (NULL = chegada espontânea — CP3)' })
  @IsOptional()
  @IsUUID()
  referralId?: string;

  @ApiPropertyOptional({ description: 'Default: agora' })
  @IsOptional()
  @IsDateString()
  checkInAt?: string;
}

export class CheckOutDto {
  @ApiProperty({ enum: ExitReason })
  @IsEnum(ExitReason)
  exitReason: ExitReason;

  @ApiPropertyOptional({ description: 'Default: agora' })
  @IsOptional()
  @IsDateString()
  checkOutAt?: string;
}
