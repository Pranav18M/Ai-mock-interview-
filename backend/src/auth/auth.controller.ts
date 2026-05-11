import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserCreateDto, UserLoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/signup
  @Post('signup')
  async signup(@Body() dto: UserCreateDto) {
    return this.authService.register(dto);
  }

  // POST /auth/login
  @Post('login')
  async login(@Body() dto: UserLoginDto) {
    return this.authService.login(dto);
  }
}