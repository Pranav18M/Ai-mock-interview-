import { Module } from '@nestjs/common';
import { ResumeGeneratorController } from './resume-generator.controller';
import { ResumeGeneratorService } from './resume-generator.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ResumeGeneratorController],
  providers: [ResumeGeneratorService],
})
export class ResumeGeneratorModule {}