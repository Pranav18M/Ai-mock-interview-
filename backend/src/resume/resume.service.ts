import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { ResumeParserService } from './resume-parser.service';

@Injectable()
export class ResumeService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    private parserService: ResumeParserService,
  ) {}

  // Mirrors: POST /resume/upload
  async uploadResume(file: Express.Multer.File, userId: string) {
    if (!file.originalname.endsWith('.pdf')) {
      throw new BadRequestException('Only PDF files are accepted');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be under 5MB');
    }

    const [skills, projects, experience, rawText] = await this.parserService.parseResume(file.buffer);

    const resumeDoc = {
      user_id: userId,
      skills,
      projects,
      experience,
      raw_text: rawText.slice(0, 5000), // mirrors Python: raw_text[:5000]
    };

    await this.resumeModel.updateOne(
      { user_id: userId },
      { $set: resumeDoc },
      { upsert: true },
    );

    return {
      user_id: userId,
      skills,
      projects,
      experience,
      message: 'Resume parsed successfully',
    };
  }

  // Mirrors: GET /resume/
  async getResume(userId: string) {
    const resume = await this.resumeModel.findOne({ user_id: userId });
    if (!resume) {
      throw new NotFoundException('No resume found. Please upload a resume first.');
    }
    return {
      user_id: resume.user_id,
      skills: resume.skills || [],
      projects: resume.projects || [],
      experience: resume.experience || [],
      message: 'Resume parsed successfully',
    };
  }
}