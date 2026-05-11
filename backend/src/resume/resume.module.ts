import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ResumeParserService } from './resume-parser.service';
import { Resume, ResumeSchema } from './schemas/resume.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }]),
    AuthModule,
  ],
  controllers: [ResumeController],
  providers: [ResumeService, ResumeParserService],
  exports: [ResumeParserService, ResumeService],
})
export class ResumeModule {}