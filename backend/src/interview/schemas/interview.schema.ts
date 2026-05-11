import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InterviewDocument = Interview & Document;

@Schema({ collection: 'interviews' })
export class Interview {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  difficulty: string;

  @Prop({ type: [String], default: [] })
  questions: string[];

  @Prop({ type: [Object], default: [] })
  answers: Record<string, any>[];

  @Prop({ type: [Object], default: [] })
  scores: Record<string, any>[];

  @Prop({ type: Object, default: null })
  feedback: Record<string, any>;

  @Prop({ default: 'in_progress' })
  status: string;

  @Prop({ default: () => new Date() })
  date: Date;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);