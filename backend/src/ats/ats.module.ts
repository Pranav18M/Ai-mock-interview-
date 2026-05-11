import { Module } from '@nestjs/common';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';
import { ResumeModule } from '../resume/resume.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ResumeModule, AuthModule],
  controllers: [AtsController],
  providers: [AtsService],
})
export class AtsModule {}