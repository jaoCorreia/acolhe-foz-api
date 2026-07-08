import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ExitReason } from '../../../common/enums';
import { IsUuidLike } from '../../../common/validators';

export class CheckInDto {
  @ApiProperty()
  @IsUuidLike('personId')
  personId: string;

  @ApiProperty()
  @IsUuidLike('shelterId')
  shelterId: string;

  @ApiPropertyOptional({ description: 'Encaminhamento que originou (NULL = chegada espontânea — CP3)' })
  @IsOptional()
  @IsUuidLike('referralId')
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
