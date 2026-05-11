import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AtsService } from './ats.service';

@Controller('ats')
@UseGuards(JwtAuthGuard)
export class AtsController {
  constructor(private readonly atsService: AtsService) {}

  // POST /ats/analyze
  @Post('analyze')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async analyzeResume(
    @UploadedFile() file: Express.Multer.File,
    @Body('role') role: string,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.atsService.analyzeResume(file, role || 'software developer');
  }
}