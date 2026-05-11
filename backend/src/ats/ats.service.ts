import { Injectable, BadRequestException } from '@nestjs/common';
import { GeminiService } from '../ai/gemini.service';
import { ResumeParserService } from '../resume/resume-parser.service';

const ROLE_KEYWORDS: Record<string, { must_have: string[]; good_to_have: string[]; never_suggest: string[] }> = {
  'frontend developer': {
    must_have: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Responsive'],
    good_to_have: ['TypeScript', 'Redux', 'Next.js', 'Tailwind', 'Webpack', 'Figma', 'REST API', 'Vue', 'Angular'],
    never_suggest: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'server', 'database admin', 'Linux infra'],
  },
  'backend developer': {
    must_have: ['API', 'REST', 'Database', 'SQL', 'Server', 'Git'],
    good_to_have: ['Node.js', 'Python', 'Java', 'Docker', 'PostgreSQL', 'MongoDB', 'Redis', 'Microservices', 'Authentication'],
    never_suggest: ['CSS animations', 'Figma', 'UI design', 'mobile layouts'],
  },
  'full stack developer': {
    must_have: ['Frontend', 'Backend', 'API', 'Database', 'JavaScript', 'Git'],
    good_to_have: ['React', 'Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'TypeScript', 'REST', 'Deployment'],
    never_suggest: ['highly specialized infra only'],
  },
  'java developer': {
    must_have: ['Java', 'Spring', 'OOP', 'Maven', 'SQL', 'Git'],
    good_to_have: ['Spring Boot', 'Hibernate', 'JPA', 'Microservices', 'JUnit', 'REST API', 'Docker'],
    never_suggest: ['JavaScript frameworks', 'CSS', 'React', 'mobile-only tools'],
  },
  'python developer': {
    must_have: ['Python', 'Git', 'API', 'SQL', 'OOP'],
    good_to_have: ['Django', 'FastAPI', 'Flask', 'Pandas', 'NumPy', 'REST', 'PostgreSQL', 'pytest'],
    never_suggest: ['Java Spring', '.NET', 'iOS development', 'Kubernetes at scale'],
  },
  'data scientist': {
    must_have: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Analysis'],
    good_to_have: ['TensorFlow', 'PyTorch', 'Pandas', 'Scikit-learn', 'Jupyter', 'NumPy', 'NLP', 'Visualization'],
    never_suggest: ['Docker infrastructure', 'CSS', 'Web UI', 'mobile development'],
  },
  'devops engineer': {
    must_have: ['Docker', 'CI/CD', 'Linux', 'Git', 'Cloud'],
    good_to_have: ['Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'Ansible', 'Monitoring', 'Bash', 'GitHub Actions'],
    never_suggest: ['CSS animations', 'React UI', 'mobile app development'],
  },
  'mobile developer': {
    must_have: ['Mobile', 'Git', 'API', 'UI'],
    good_to_have: ['React Native', 'Flutter', 'Firebase', 'Swift', 'Kotlin', 'REST API', 'App Store', 'Push Notifications'],
    never_suggest: ['Kubernetes', 'heavy backend infra', 'data science', 'server management'],
  },
  'web developer': {
    must_have: ['HTML', 'CSS', 'JavaScript', 'Git', 'Responsive'],
    good_to_have: ['React', 'WordPress', 'PHP', 'REST API', 'MySQL', 'SEO', 'TypeScript'],
    never_suggest: ['Docker orchestration', 'ML models', 'Kubernetes', 'deep backend infra'],
  },
};

@Injectable()
export class AtsService {
  constructor(
    private geminiService: GeminiService,
    private parserService: ResumeParserService,
  ) {}

  // Mirrors: get_role_keywords
  private getRoleKeywords(role: string) {
    const roleLower = role.toLowerCase().trim();
    for (const key of Object.keys(ROLE_KEYWORDS)) {
      if (key.includes(roleLower) || roleLower.includes(key)) {
        return ROLE_KEYWORDS[key];
      }
    }
    return {
      must_have: ['Git', 'API', 'Communication', 'Problem Solving'],
      good_to_have: ['Agile', 'REST', 'SQL', 'Documentation'],
      never_suggest: [],
    };
  }

  // Mirrors: check_formatting
  private checkFormatting(rawText: string) {
    const issues: string[] = [];
    let score = 10;
    const words = rawText.split(/\s+/);

    if (words.length < 150) {
      issues.push('Resume too short — aim for 400–600 words');
      score -= 2;
    } else if (words.length > 1000) {
      issues.push('Resume may be too long — keep it to 1–2 pages');
      score -= 1;
    }

    const sections = ['experience', 'education', 'skills', 'project'];
    const missingSections = sections.filter((s) => !rawText.toLowerCase().includes(s));
    if (missingSections.length) {
      issues.push(`Missing sections: ${missingSections.join(', ')}`);
      score -= missingSections.length;
    }

    const hasEmail = /[\w.+-]+@[\w-]+\.\w+/.test(rawText);
    const hasPhone = /[\+\d][\d\s\-\(\)]{8,}/.test(rawText);
    if (!hasEmail) { issues.push('No email address found'); score -= 1; }
    if (!hasPhone) { issues.push('No phone number found'); score -= 1; }

    const actionVerbs = ['developed', 'built', 'implemented', 'designed', 'led', 'managed', 'created', 'improved', 'optimized', 'achieved'];
    const foundVerbs = actionVerbs.filter((v) => rawText.toLowerCase().includes(v));
    if (foundVerbs.length < 3) {
      issues.push('Use more action verbs: Developed, Built, Led, Implemented, Optimized');
      score -= 1;
    }

    const hasNumbers = /\d+%|\d+\+|\d+x|\$\d+/.test(rawText);
    if (!hasNumbers) {
      issues.push("No quantified achievements — add metrics like '40% faster', '10K users'");
      score -= 1;
    }

    return {
      score: Math.max(score, 0),
      issues,
      word_count: words.length,
      has_email: hasEmail,
      has_phone: hasPhone,
      action_verbs_found: foundVerbs,
    };
  }

  // Mirrors: check_grammar_basic
  private checkGrammarBasic(rawText: string) {
    const issues: string[] = [];
    let score = 10;

    const firstPerson = (rawText.match(/\bI\b|\bme\b|\bmy\b|\bmine\b|\bmyself\b/gi) || []).length;
    if (firstPerson > 3) {
      issues.push(`Avoid first-person pronouns (I, me, my) — found ${firstPerson} times. Resumes should use implied subject.`);
      score -= 2;
    }

    const commonTypos: Record<string, string> = {
      recieve: 'receive', accomodate: 'accommodate', seperate: 'separate',
      occured: 'occurred', sucessful: 'successful', managment: 'management',
      expereince: 'experience', developement: 'development', programing: 'programming',
      algorthm: 'algorithm', databse: 'database', languege: 'language',
      implimentation: 'implementation', knowlege: 'knowledge', enviroment: 'environment',
    };
    const foundTypos: Record<string, string> = {};
    for (const [typo, correction] of Object.entries(commonTypos)) {
      if (rawText.toLowerCase().includes(typo)) {
        foundTypos[typo] = correction;
      }
    }
    if (Object.keys(foundTypos).length) {
      score -= Object.keys(foundTypos).length;
      issues.push(`Spelling errors found: ${Object.entries(foundTypos).map(([t, c]) => `'${t}' → '${c}'`).join(', ')}`);
    }

    const presentTense = (rawText.match(/\b(manage|develop|build|create|lead|work|implement|maintain)\b/gi) || []).length;
    if (presentTense > 4) {
      issues.push("Use past tense for previous roles — 'Developed' not 'Develop', 'Managed' not 'Manage'");
      score -= 1;
    }

    return {
      score: Math.max(score, 0),
      issues,
      first_person_count: firstPerson,
      typos_found: foundTypos,
    };
  }

  // Mirrors: check_role_keywords
  private checkRoleKeywords(rawText: string, role: string) {
    const kw = this.getRoleKeywords(role);
    const textLower = rawText.toLowerCase();

    const foundMust = kw.must_have.filter((k) => textLower.includes(k.toLowerCase()));
    const missingMust = kw.must_have.filter((k) => !textLower.includes(k.toLowerCase()));
    const foundGood = kw.good_to_have.filter((k) => textLower.includes(k.toLowerCase()));
    const missingGood = kw.good_to_have.filter((k) => !textLower.includes(k.toLowerCase()));

    const score = 10 - missingMust.length * 1.5 - missingGood.length * 0.3;

    return {
      score: Math.round(Math.min(Math.max(score, 0), 10) * 10) / 10,
      must_have_found: foundMust,
      must_have_missing: missingMust,
      good_to_have_found: foundGood,
      good_to_have_missing: missingGood.slice(0, 5),
    };
  }

  // Mirrors: POST /ats/analyze
  async analyzeResume(file: Express.Multer.File, role: string) {
    if (!file.originalname.endsWith('.pdf')) {
      throw new BadRequestException('Only PDF files accepted');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File too large. Max 5MB');
    }

    const [skills, projects, experience, rawText] = await this.parserService.parseResume(file.buffer);

    if (!rawText || rawText.trim().length < 50) {
      throw new BadRequestException('Could not extract text from PDF');
    }

    const effectiveRole = role || 'software developer';

    const formatting = this.checkFormatting(rawText);
    const grammar = this.checkGrammarBasic(rawText);
    const roleKw = this.checkRoleKeywords(rawText, effectiveRole);

    const aiResult = await this.geminiService.analyzeAtsScore(rawText, effectiveRole);

    // Filter irrelevant keywords from AI result — mirrors Python logic
    const kwConfig = this.getRoleKeywords(effectiveRole);
    const neverSuggest = kwConfig.never_suggest.map((n) => n.toLowerCase());

    if (aiResult.keywords_missing) {
      aiResult.keywords_missing = aiResult.keywords_missing.filter(
        (k: string) => !neverSuggest.some((bad) => k.toLowerCase().includes(bad)),
      );
    }

    if (aiResult.improvements) {
      aiResult.improvements = aiResult.improvements.filter((imp: any) => {
        const fixLower = (imp.fix || '').toLowerCase();
        const issueLower = (imp.issue || '').toLowerCase();
        return !neverSuggest.some((bad) => fixLower.includes(bad) || issueLower.includes(bad));
      });
    }

    aiResult.formatting_check = formatting;
    aiResult.grammar_check = grammar;
    aiResult.role_keywords = roleKw;
    aiResult.role = effectiveRole;

    // Recalculate combined score — mirrors Python formula
    const aiScore = parseFloat(aiResult.overall_score ?? 5);
    const fmtScore = formatting.score;
    const gramScore = grammar.score;
    const kwScore = roleKw.score;
    const combined = Math.round((aiScore * 0.5 + fmtScore * 0.2 + gramScore * 0.15 + kwScore * 0.15) * 10) / 10;
    aiResult.overall_score = Math.min(combined, 10);

    // Append local issues as extra improvements
    const extra: any[] = [];
    for (const issue of formatting.issues.slice(0, 2)) {
      extra.push({ section: 'Formatting', issue, fix: 'Fix this to improve ATS readability and recruiter first impression' });
    }
    for (const issue of grammar.issues.slice(0, 2)) {
      extra.push({ section: 'Grammar', issue, fix: 'Fix this to appear more professional to recruiters' });
    }
    aiResult.improvements = [...(aiResult.improvements || []), ...extra];

    return aiResult;
  }
}