import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RefreshDto } from './dto/auth.dto';
import { ChangePasswordDto } from '../users/dto/user.dto';
import { CurrentUser, AuthUser, Public } from '../../common/decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // RNF-013: login limitado a 10 tentativas/min.
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.authService.login(dto.email, dto.password, req.ip);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  logout(@CurrentUser() user: AuthUser, @Body() dto: Partial<RefreshDto>, @Req() req: any) {
    return this.authService.logout(user.sub, dto?.refreshToken, req.ip);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @ApiBearerAuth()
  @Post('change-password')
  async changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(user.sub, dto.currentPassword, dto.newPassword);
    return { success: true };
  }
}
