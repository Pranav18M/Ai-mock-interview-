import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectItemDto {
  @IsString() name: string;
  @IsString() technologies: string;
  @IsString() point1: string;
  @IsString() point2: string;
  @IsOptional() @IsString() link?: string;
}

export class ExperienceItemDto {
  @IsString() company: string;
  @IsString() role: string;
  @IsString() duration: string;
  @IsString() description: string;
}

export class CertificationItemDto {
  @IsString() name: string;
  @IsString() issuer: string;
  @IsOptional() @IsString() date?: string;
}

export class EducationItemDto {
  @IsString() degree: string;
  @IsString() college: string;
  @IsString() duration: string;
  @IsOptional() @IsString() cgpa?: string;
  @IsOptional() @IsString() coursework?: string;
}

export class ResumeGeneratorDataDto {
  @IsString() full_name: string;
  @IsString() phone: string;
  @IsString() email: string;
  @IsString() location: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() github?: string;
  @IsOptional() @IsString() portfolio?: string;
  @IsString() job_role: string;
  @IsString() summary: string;
  @IsOptional() @IsString() frontend_skills?: string;
  @IsOptional() @IsString() backend_skills?: string;
  @IsOptional() @IsString() database_skills?: string;
  @IsOptional() @IsString() tools_skills?: string;
  @IsOptional() @IsString() other_skills?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => EducationItemDto) education: EducationItemDto[] = [];
  @IsArray() @ValidateNested({ each: true }) @Type(() => ProjectItemDto) projects: ProjectItemDto[] = [];
  @IsArray() @ValidateNested({ each: true }) @Type(() => ExperienceItemDto) experience: ExperienceItemDto[] = [];
  @IsArray() @ValidateNested({ each: true }) @Type(() => CertificationItemDto) certifications: CertificationItemDto[] = [];
}