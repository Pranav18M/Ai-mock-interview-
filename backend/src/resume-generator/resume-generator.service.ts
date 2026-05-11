import { Injectable } from '@nestjs/common';
import { ResumeGeneratorDataDto } from './dto/resume-generator.dto';

@Injectable()
export class ResumeGeneratorService {
  // Mirrors: build_resume_html — preserves exact HTML/CSS output
  buildResumeHtml(d: ResumeGeneratorDataDto): string {
    const skillRow = (label: string, value: string): string => {
      if (!value || !value.trim()) return '';
      return `
        <tr>
          <td style="padding:1px 0;vertical-align:top;white-space:nowrap;">
            <span style="font-weight:700;color:#1a1a2e;font-size:10.5pt;">${label}:</span>
          </td>
          <td style="padding:1px 0 1px 8px;color:#2c2c2c;font-size:10.5pt;">
            ${value.trim()}
          </td>
        </tr>`;
    };

    let skillsRows = '';
    if (d.frontend_skills) skillsRows += skillRow('Frontend Technologies', d.frontend_skills);
    if (d.backend_skills) skillsRows += skillRow('Backend Technologies', d.backend_skills);
    if (d.database_skills) skillsRows += skillRow('Databases', d.database_skills);
    if (d.tools_skills) skillsRows += skillRow('Developer Tools', d.tools_skills);
    if (d.other_skills) skillsRows += skillRow('Other', d.other_skills);

    const skillsSection = skillsRows
      ? `<div class="section">
      <div class="section-title">TECHNICAL SKILLS</div>
      <div class="divider"></div>
      <table style="width:100%;border-collapse:collapse;">
        ${skillsRows}
      </table>
    </div>`
      : '';

    let eduItems = '';
    for (const e of d.education) {
      const courseworkLine = e.coursework?.trim()
        ? `<div style="font-size:10pt;color:#444;margin-top:2px;">Relevant Coursework: ${e.coursework.trim()}</div>`
        : '';
      const cgpaLine = e.cgpa ? ` &nbsp;CGPA: ${e.cgpa}` : '';
      eduItems += `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${e.degree}</span>
            <span class="entry-date">${e.duration}</span>
          </div>
          <div class="entry-sub">${e.college}${cgpaLine}</div>
          ${courseworkLine}
        </div>`;
    }
    const educationSection = eduItems
      ? `<div class="section">
      <div class="section-title">EDUCATION</div>
      <div class="divider"></div>
      ${eduItems}
    </div>`
      : '';

    let projectItems = '';
    for (const p of d.projects) {
      const linkLine =
        p.link?.trim()
          ? ` | <a href="${p.link.trim()}" style="color:#1a1a2e;text-decoration:none;">${p.link.trim().replace(/https?:\/\//, '')}</a>`
          : '';
      let bullets = '';
      if (p.point1?.trim()) bullets += `<li>${p.point1.trim()}</li>`;
      if (p.point2?.trim()) bullets += `<li>${p.point2.trim()}</li>`;
      projectItems += `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${p.name}</span>
          </div>
          <div class="entry-sub">Technologies: ${p.technologies}${linkLine}</div>
          <ul class="bullets">${bullets}</ul>
        </div>`;
    }
    const projectsSection = projectItems
      ? `<div class="section">
      <div class="section-title">PROJECTS</div>
      <div class="divider"></div>
      ${projectItems}
    </div>`
      : '';

    let expItems = '';
    for (const ex of d.experience) {
      if (!ex.company?.trim()) continue;
      expItems += `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${ex.role} – ${ex.company}</span>
            <span class="entry-date">${ex.duration}</span>
          </div>
          <ul class="bullets"><li>${ex.description.trim()}</li></ul>
        </div>`;
    }
    const experienceSection = expItems
      ? `<div class="section">
      <div class="section-title">EXPERIENCE</div>
      <div class="divider"></div>
      ${expItems}
    </div>`
      : '';

    let certItems = '';
    for (const c of d.certifications) {
      if (!c.name?.trim()) continue;
      const dateStr = c.date ? ` &nbsp;${c.date}` : '';
      certItems += `
        <li>
          <strong>${c.name}</strong>${dateStr}
          <br/><span style="color:#444;font-size:10pt;">${c.issuer}</span>
        </li>`;
    }
    const certificationsSection = certItems
      ? `<div class="section">
      <div class="section-title">CERTIFICATIONS</div>
      <div class="divider"></div>
      <ul class="bullets">${certItems}</ul>
    </div>`
      : '';

    const contactParts: string[] = [];
    if (d.phone) contactParts.push(d.phone);
    if (d.email) contactParts.push(`<a href="mailto:${d.email}" style="color:#1a1a2e;text-decoration:none;">${d.email}</a>`);
    if (d.location) contactParts.push(d.location);
    const contactLine = contactParts.join(' | ');

    const linkParts: string[] = [];
    if (d.linkedin) linkParts.push(`LinkedIn- <a href="${d.linkedin}" style="color:#1a1a2e;text-decoration:none;">${d.linkedin.replace(/https?:\/\//, '')}</a>`);
    if (d.github) linkParts.push(`Github- <a href="${d.github}" style="color:#1a1a2e;text-decoration:none;">${d.github.replace(/https?:\/\//, '')}</a>`);
    if (d.portfolio) linkParts.push(`Portfolio- <a href="${d.portfolio}" style="color:#1a1a2e;text-decoration:none;">${d.portfolio.replace(/https?:\/\//, '')}</a>`);
    const linksLine = linkParts.join(' | ');

    const summarySection =
      d.summary?.trim()
        ? `<div class="section">
      <div class="section-title">PROFESSIONAL SUMMARY</div>
      <div class="divider"></div>
      <p style="font-size:10.5pt;color:#2c2c2c;line-height:1.5;margin:4px 0 0 0;">${d.summary.trim()}</p>
    </div>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${d.full_name} – Resume</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      color: #1a1a2e;
      background: #fff;
      padding: 28px 36px 24px 36px;
      max-width: 850px;
      margin: 0 auto;
      line-height: 1.4;
    }
    .header-name {
      font-size: 22pt;
      font-weight: 700;
      text-align: center;
      letter-spacing: 1px;
      color: #1a1a2e;
      text-transform: uppercase;
    }
    .header-contact {
      text-align: center;
      font-size: 10pt;
      color: #2c2c2c;
      margin-top: 3px;
      line-height: 1.6;
    }
    .section { margin-top: 10px; }
    .section-title {
      font-size: 11.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1a1a2e;
      margin-bottom: 1px;
    }
    .divider {
      border: none;
      border-top: 1.5px solid #1a1a2e;
      margin: 2px 0 6px 0;
    }
    .entry { margin-bottom: 7px; }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .entry-title {
      font-weight: 700;
      font-size: 11pt;
      color: #1a1a2e;
    }
    .entry-date {
      font-size: 10.5pt;
      color: #1a1a2e;
      white-space: nowrap;
      margin-left: 8px;
    }
    .entry-sub {
      font-size: 10.5pt;
      color: #2c2c2c;
      margin-top: 1px;
      font-style: italic;
    }
    .bullets {
      margin: 3px 0 0 18px;
      padding: 0;
    }
    .bullets li {
      font-size: 10.5pt;
      color: #2c2c2c;
      margin-bottom: 2px;
      line-height: 1.45;
    }
    a { color: #1a1a2e; }
  </style>
</head>
<body>
  <div class="header-name">${d.full_name.toUpperCase()}</div>
  <div class="header-contact">
    ${contactLine}
    ${linksLine ? `<br/>${linksLine}` : ''}
  </div>
  ${summarySection}
  ${skillsSection}
  ${educationSection}
  ${projectsSection}
  ${experienceSection}
  ${certificationsSection}
</body>
</html>`;
  }
}