import { Controller, Post, Body, UseGuards, Res, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResumeGeneratorService } from './resume-generator.service';
import { ResumeGeneratorDataDto } from './dto/resume-generator.dto';

@Controller('resume-gen')
@UseGuards(JwtAuthGuard)
export class ResumeGeneratorController {
  constructor(private readonly resumeGeneratorService: ResumeGeneratorService) {}

  // POST /resume-gen/preview
  // Mirrors: preview_resume — returns HTML string for frontend live preview
  @Post('preview')
  async preview(@Body() data: ResumeGeneratorDataDto) {
    try {
      const html = this.resumeGeneratorService.buildResumeHtml(data);
      return { html };
    } catch (e: any) {
      throw new InternalServerErrorException(`Preview error: ${e.message}`);
    }
  }

  // POST /resume-gen/download
  // Mirrors: download_resume
  // NOTE: weasyprint (Python HTML→PDF) has no direct Node.js equivalent.
  // Returns HTML with fallback:true for client-side browser print-to-PDF,
  // which is identical to the Python fallback when weasyprint is unavailable.
  // To enable server-side PDF: install puppeteer and use page.pdf().
  @Post('download')
  async download(@Body() data: ResumeGeneratorDataDto, @Res() res: Response) {
    try {
      const html = this.resumeGeneratorService.buildResumeHtml(data);

      // Attempt puppeteer PDF generation if available
      try {
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' } });
        await browser.close();
        const filename = `${data.full_name.replace(/ /g, '_')}_Resume.pdf`;
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        });
        return res.send(pdfBuffer);
      } catch {
        // puppeteer not installed — mirrors Python weasyprint ImportError fallback
        return res.json({
          html,
          fallback: true,
          message: 'PDF generation not available on server. Use browser print to save as PDF.',
        });
      }
    } catch (e: any) {
      throw new InternalServerErrorException(`Download error: ${e.message}`);
    }
  }
}