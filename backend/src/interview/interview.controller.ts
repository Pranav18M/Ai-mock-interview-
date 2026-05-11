import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewService } from './interview.service';
import { InterviewSetupDto, AnswerSubmitDto, GreetingRequestDto, IntroRequestDto } from './dto/interview.dto';
import { Resume } from '../resume/schemas/resume.schema';

@Controller('interview')
@UseGuards(JwtAuthGuard)
export class InterviewController {
  constructor(
    private readonly interviewService: InterviewService,
    @InjectModel(Resume.name) private resumeModel: Model<any>,
  ) {}

  // POST /interview/generate-questions
  @Post('generate-questions')
  async generateQuestions(@Body() setup: InterviewSetupDto, @Request() req: any) {
    return this.interviewService.generateQuestions(setup, req.user.user_id, this.resumeModel);
  }

  // POST /interview/submit-answer
  @Post('submit-answer')
  async submitAnswer(@Body() data: AnswerSubmitDto, @Request() req: any) {
    return this.interviewService.submitAnswer(data, req.user.user_id);
  }

  // POST /interview/complete/:id
  @Post('complete/:interview_id')
  async completeInterview(@Param('interview_id') interviewId: string, @Request() req: any) {
    return this.interviewService.completeInterview(interviewId, req.user.user_id);
  }

  // GET /interview/report/:id
  @Get('report/:interview_id')
  async getReport(@Param('interview_id') interviewId: string, @Request() req: any) {
    return this.interviewService.getReport(interviewId, req.user.user_id);
  }

  // GET /interview/history
  @Get('history')
  async getHistory(@Request() req: any) {
    return this.interviewService.getHistory(req.user.user_id);
  }

  // POST /interview/greeting
  @Post('greeting')
  async getGreeting(@Body() dto: GreetingRequestDto) {
    return this.interviewService.getGreeting(dto.user_name, dto.role, dto.difficulty);
  }

  // POST /interview/intro-response
  @Post('intro-response')
  async getIntroResponse(@Body() dto: IntroRequestDto) {
    return this.interviewService.getIntroResponse(dto.user_intro, dto.user_name, dto.role);
  }
}