import { IsString, IsNumber, IsIn } from 'class-validator';

export class InterviewSetupDto {
  @IsString()
  role: string;

  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficulty: string;
}

export class AnswerSubmitDto {
  @IsString()
  interview_id: string;

  @IsNumber()
  question_index: number;

  @IsString()
  question: string;

  @IsString()
  answer: string;
}

export class GreetingRequestDto {
  @IsString()
  user_name: string;

  @IsString()
  role: string;

  @IsString()
  difficulty: string;
}

export class IntroRequestDto {
  @IsString()
  user_intro: string;

  @IsString()
  user_name: string;

  @IsString()
  role: string;
}