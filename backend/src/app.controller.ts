import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return { message: 'AI Mock Interview API', version: '1.0.0', status: 'running' };
  }

  @Get('health')
  health() {
    return { status: 'healthy' };
  }
}