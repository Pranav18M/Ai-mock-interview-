import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interview, InterviewDocument } from './schemas/interview.schema';
import { GeminiService } from '../ai/gemini.service';
import { InterviewSetupDto, AnswerSubmitDto } from './dto/interview.dto';

@Injectable()
export class InterviewService {
  constructor(
    @InjectModel(Interview.name) private interviewModel: Model<InterviewDocument>,
    private geminiService: GeminiService,
  ) {}

  // Mirrors: serialize_doc
  private serializeDoc(doc: any): any {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    if (obj._id) {
      obj.id = obj._id.toString();
      delete obj._id;
    }
    return obj;
  }

  // Mirrors: POST /interview/generate-questions
  async generateQuestions(setup: InterviewSetupDto, userId: string, resumeModel: Model<any>) {
    console.log(`[generate-questions] user=${userId} role=${setup.role} diff=${setup.difficulty}`);

    const resume = await resumeModel.findOne({ user_id: userId });
    const skills = resume?.skills || [];
    const projects = resume?.projects || [];
    const experience = resume?.experience || [];
    console.log(`[generate-questions] resume_found=${!!resume} skills=${skills.slice(0, 3)}`);

    const questions = await this.geminiService.generateQuestions(setup.role, setup.difficulty, skills, projects, experience);
    console.log(`[generate-questions] generated ${questions.length} questions`);

    const session = await this.interviewModel.create({
      user_id: userId,
      role: setup.role,
      difficulty: setup.difficulty,
      questions,
      answers: [],
      scores: [],
      feedback: null,
      status: 'in_progress',
      date: new Date(),
    });

    const interview_id = (session._id as any).toString();
    console.log(`[generate-questions] saved interview_id=${interview_id}`);

    return {
      interview_id,
      questions,
      role: setup.role,
      difficulty: setup.difficulty,
      total_questions: questions.length,
    };
  }

  // Mirrors: POST /interview/submit-answer
  async submitAnswer(data: AnswerSubmitDto, userId: string) {
    const interview = await this.interviewModel.findOne({
      _id: new Types.ObjectId(data.interview_id),
      user_id: userId,
    });
    if (!interview) throw new NotFoundException('Interview session not found');
    if (interview.status === 'completed') throw new BadRequestException('Interview already completed');

    const score = await this.geminiService.evaluateAnswer(data.question, data.answer, interview.role);
    const answerRecord = {
      question_index: data.question_index,
      question: data.question,
      answer: data.answer,
      score,
    };

    await this.interviewModel.updateOne(
      { _id: new Types.ObjectId(data.interview_id) },
      { $push: { answers: answerRecord, scores: score } },
    );

    return { question_index: data.question_index, score, message: 'Answer evaluated successfully' };
  }

  // Mirrors: POST /interview/complete/:id
  async completeInterview(interviewId: string, userId: string) {
    const interview = await this.interviewModel.findOne({
      _id: new Types.ObjectId(interviewId),
      user_id: userId,
    });
    if (!interview) throw new NotFoundException('Interview session not found');

    if (interview.status === 'completed') {
      return this.serializeDoc(interview);
    }

    const questions = interview.questions || [];
    const answersRecords = interview.answers || [];
    const scores = interview.scores || [];
    const answersText = answersRecords.map((r: any) => r.answer || '');

    const feedback = await this.geminiService.generateFinalFeedback(interview.role, questions, answersText, scores);

    await this.interviewModel.updateOne(
      { _id: new Types.ObjectId(interviewId) },
      { $set: { status: 'completed', feedback } },
    );

    return {
      interview_id: interviewId,
      role: interview.role,
      difficulty: interview.difficulty,
      questions,
      answers: answersRecords,
      scores,
      feedback,
      status: 'completed',
      date: interview.date ? interview.date.toISOString() : null,
    };
  }

  // Mirrors: GET /interview/report/:id
  async getReport(interviewId: string, userId: string) {
    const interview = await this.interviewModel.findOne({
      _id: new Types.ObjectId(interviewId),
      user_id: userId,
    });
    if (!interview) throw new NotFoundException('Interview report not found');

    const doc = this.serializeDoc(interview);
    if (doc.date) doc.date = new Date(doc.date).toISOString();
    return doc;
  }

  // Mirrors: GET /interview/history
  async getHistory(userId: string) {
    const docs = await this.interviewModel.find({ user_id: userId }).sort({ date: -1 });
    return docs.map((doc) => {
      const scores = doc.scores || [];
      let overall: number | null = null;
      if (scores.length && doc.feedback) {
        overall = (doc.feedback as any).overall_score ?? null;
      } else if (scores.length) {
        overall = Math.round((scores.reduce((sum: number, s: any) => sum + (s.overall || 0), 0) / scores.length) * 10) / 10;
      }
      return {
        id: (doc._id as any).toString(),
        role: doc.role || '',
        difficulty: doc.difficulty || '',
        overall_score: overall,
        status: doc.status || 'in_progress',
        date: doc.date ? doc.date.toISOString() : null,
      };
    });
  }

  // Mirrors: POST /interview/greeting
  async getGreeting(userName: string, role: string, difficulty: string) {
    try {
      const greeting = await this.geminiService.generateGreeting(userName, role, difficulty);
      return { greeting };
    } catch (e: any) {
      console.log('Greeting error:', e.message);
      return { greeting: `Good morning ${userName}! Welcome to your ${role} mock interview. Please introduce yourself and tell me about your background.` };
    }
  }

  // Mirrors: POST /interview/intro-response
  async getIntroResponse(userIntro: string, userName: string, role: string) {
    try {
      const response = await this.geminiService.generateIntroResponse(userIntro, userName, role);
      return { response };
    } catch (e: any) {
      console.log('Intro response error:', e.message);
      return { response: `Thank you ${userName}! Great background. Now let's move on to the 5 technical questions for your ${role} interview.` };
    }
  }
}