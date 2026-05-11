import { Injectable } from '@nestjs/common';
const pdfParse = require('pdf-parse');
const SKILL_KEYWORDS = [
  'python', 'javascript', 'typescript', 'react', 'angular', 'vue', 'node.js', 'nodejs',
  'fastapi', 'django', 'flask', 'express', 'spring', 'java', 'c++', 'c#', 'go', 'rust',
  'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'gcp',
  'azure', 'git', 'linux', 'rest', 'graphql', 'machine learning', 'deep learning',
  'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'html', 'css', 'tailwind',
  'bootstrap', 'sass', 'webpack', 'vite', 'next.js', 'nextjs', 'flutter', 'react native',
  'swift', 'kotlin', 'android', 'ios', 'devops', 'ci/cd', 'jenkins', 'nginx', 'kafka',
  'rabbitmq', 'elasticsearch', 'firebase', 'supabase', 'php', 'laravel', 'ruby', 'rails',
];

@Injectable()
export class ResumeParserService {
  // Mirrors: extract_text_from_pdf
  async extractTextFromPdf(fileBytes: Buffer): Promise<string> {
    const data = await pdfParse(fileBytes);
    return data.text || '';
  }

  // Mirrors: extract_skills
  extractSkills(text: string): string[] {
    const textLower = text.toLowerCase();
    const found: string[] = [];
    for (const skill of SKILL_KEYWORDS) {
      const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (pattern.test(textLower)) {
        found.push(skill.length > 3 ? this.toTitleCase(skill) : skill.toUpperCase());
      }
    }
    return [...new Set(found)];
  }

  // Mirrors: extract_projects
  extractProjects(text: string): string[] {
    const projects: string[] = [];
    const lines = text.split('\n');
    let inProjects = false;
    const projectHeaders = ['project', 'projects', 'personal projects', 'academic projects', 'side projects'];
    const stopHeaders = ['experience', 'education', 'skills', 'certification', 'award', 'publication'];

    for (const line of lines) {
      const lineStripped = line.trim();
      const lineLower = lineStripped.toLowerCase();

      if (projectHeaders.some((h) => lineLower.includes(h)) && lineStripped.length < 40) {
        inProjects = true;
        continue;
      }

      if (inProjects && stopHeaders.some((h) => lineLower.includes(h)) && lineStripped.length < 40) {
        break;
      }

      if (inProjects && lineStripped && lineStripped.length > 10) {
        if (!['•', '-', '*', '·'].some((c) => lineStripped.startsWith(c)) && lineStripped.length < 80) {
          projects.push(lineStripped);
        } else if (['•', '-', '*', '·'].some((c) => lineStripped.startsWith(c))) {
          const clean = lineStripped.replace(/^[•\-*· ]+/, '').trim();
          if (clean && clean.length > 10) projects.push(clean);
        }
      }
    }

    // Fallback
    if (projects.length === 0) {
      for (const line of lines) {
        if (line.toLowerCase().includes('project') && line.trim().length > 15 && line.trim().length < 100) {
          projects.push(line.trim());
        }
      }
    }

    return projects.slice(0, 6);
  }

  // Mirrors: extract_experience
  extractExperience(text: string): string[] {
    const experience: string[] = [];
    const lines = text.split('\n');
    let inExperience = false;
    const expHeaders = ['experience', 'work experience', 'employment', 'professional experience', 'internship'];
    const stopHeaders = ['education', 'skills', 'projects', 'certification', 'award', 'publication', 'summary'];

    for (const line of lines) {
      const lineStripped = line.trim();
      const lineLower = lineStripped.toLowerCase();

      if (expHeaders.some((h) => lineLower.includes(h)) && lineStripped.length < 40) {
        inExperience = true;
        continue;
      }

      if (inExperience && stopHeaders.some((h) => lineLower.includes(h)) && lineStripped.length < 40) {
        break;
      }

      if (inExperience && lineStripped && lineStripped.length > 15) {
        experience.push(lineStripped);
      }
    }

    return experience.slice(0, 8);
  }

  // Mirrors: parse_resume — returns [skills, projects, experience, raw_text]
  async parseResume(fileBytes: Buffer): Promise<[string[], string[], string[], string]> {
    const rawText = await this.extractTextFromPdf(fileBytes);
    const skills = this.extractSkills(rawText);
    const projects = this.extractProjects(rawText);
    const experience = this.extractExperience(rawText);
    return [skills, projects, experience, rawText];
  }

  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
  }
}