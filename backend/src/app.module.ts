import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { databaseConfig } from './config/database.config';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { ResumeModule } from './resume/resume.module';
import { InterviewModule } from './interview/interview.module';
import { AtsModule } from './ats/ats.module';
import { ResumeGeneratorModule } from './resume-generator/resume-generator.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      ignoreEnvFile: false,
    }),
    MongooseModule.forRootAsync(databaseConfig),
    AiModule,
    AuthModule,
    ResumeModule,
    InterviewModule,
    AtsModule,
    ResumeGeneratorModule,
  ],
  controllers: [AppController],
})
export class AppModule {}