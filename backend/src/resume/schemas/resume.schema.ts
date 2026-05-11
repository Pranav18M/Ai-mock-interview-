import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResumeDocument = Resume & Document;

@Schema({ collection: 'resumes' })
export class Resume {
  @Prop({ required: true })
  user_id: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], default: [] })
  projects: string[];

  @Prop({ type: [String], default: [] })
  experience: string[];

  @Prop({ default: null })
  raw_text: string;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);