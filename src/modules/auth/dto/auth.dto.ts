import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsJWT, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'fabiane.s@foz.pr.gov.br' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'acolhe123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsJWT()
  refreshToken: string;
}
