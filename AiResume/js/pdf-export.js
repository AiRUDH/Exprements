/**
 * PDF EXPORT ENGINE
 * ATS-safe PDF generation using html2pdf.js
 * Single-column, semantic, parser-proof layout
 */

const PDFExport = (() => {

  // ── BUILD ATS-SAFE HTML ───────────────────────────────────────────────────

  function buildResumeHTML(state) {
    const {
      name, email, phone, location, linkedin, portfolio, title,
      aiSummary, experiences, education, skills, certifications, projects
    } = state;

    const contactParts = [email, phone, location, linkedin, portfolio]
      .filter(Boolean)
      .map(c => `<span>${escHtml(c)}</span>`)
      .join('<span style="color:#999;margin:0 6px">|</span>');

    const summaryHTML = aiSummary ? `
      <div class="rv-section">
        <div class="rv-section-title">Professional Summary</div>
        <div class="rv-summary">${escHtml(aiSummary)}</div>
      </div>` : '';

    const expHTML = (experiences || []).filter(e => e.company || e.role).length > 0 ? `
      <div class="rv-section">
        <div class="rv-section-title">Experience</div>
        ${(experiences || []).filter(e => e.company || e.role).map(exp => `
          <div class="rv-entry">
            <div class="rv-entry-header">
              <span class="rv-entry-org">${escHtml(exp.company)}</span>
              <span class="rv-entry-date">${escHtml(exp.startDate)}${exp.endDate || exp.current ? ' – ' + (exp.current ? 'Present' : escHtml(exp.endDate)) : ''}</span>
            </div>
            <div class="rv-entry-role">${escHtml(exp.role)}</div>
            ${(exp.bullets || []).filter(b => b.trim()).length > 0 ? `
            <ul class="rv-bullet-list">
              ${(exp.bullets || []).filter(b => b.trim()).map(b => `<li>${escHtml(b)}</li>`).join('')}
            </ul>` : ''}
          </div>`).join('')}
      </div>` : '';

    const eduHTML = (education || []).filter(e => e.institution || e.degree).length > 0 ? `
      <div class="rv-section">
        <div class="rv-section-title">Education</div>
        ${(education || []).filter(e => e.institution || e.degree).map(edu => `
          <div class="rv-entry">
            <div class="rv-entry-header">
              <span class="rv-entry-org">${escHtml(edu.institution)}</span>
              <span class="rv-entry-date">${escHtml(edu.startDate)}${edu.endDate ? ' – ' + escHtml(edu.endDate) : ''}</span>
            </div>
            <div class="rv-entry-role">${[edu.degree, edu.field].filter(Boolean).map(escHtml).join(', ')}${edu.gpa ? ` | GPA: ${escHtml(edu.gpa)}` : ''}${edu.honors ? ` | ${escHtml(edu.honors)}` : ''}</div>
          </div>`).join('')}
      </div>` : '';

    const skillsHTML = (skills || []).length > 0 ? `
      <div class="rv-section">
        <div class="rv-section-title">Skills</div>
        <div class="rv-skills-row">
          <span>${(skills || []).map(escHtml).join(' • ')}</span>
        </div>
      </div>` : '';

    const certsHTML = (certifications || []).filter(c => c.name).length > 0 ? `
      <div class="rv-section">
        <div class="rv-section-title">Certifications</div>
        ${(certifications || []).filter(c => c.name).map(c => `
          <div class="rv-entry">
            <div class="rv-entry-header">
              <span class="rv-entry-org">${escHtml(c.name)}</span>
              <span class="rv-entry-date">${escHtml(c.date || '')}</span>
            </div>
            ${c.issuer ? `<div class="rv-entry-role">${escHtml(c.issuer)}</div>` : ''}
          </div>`).join('')}
      </div>` : '';

    const projHTML = (projects || []).filter(p => p.name).length > 0 ? `
      <div class="rv-section">
        <div class="rv-section-title">Projects</div>
        ${(projects || []).filter(p => p.name).map(p => `
          <div class="rv-entry">
            <div class="rv-entry-header">
              <span class="rv-entry-org">${escHtml(p.name)}</span>
              ${p.url ? `<span class="rv-entry-date">${escHtml(p.url)}</span>` : ''}
            </div>
            ${p.description ? `<div class="rv-summary">${escHtml(p.description)}</div>` : ''}
          </div>`).join('')}
      </div>` : '';

    return `
      <div class="rv-name">${escHtml(name || 'Your Name')}</div>
      ${title ? `<div class="rv-title">${escHtml(title)}</div>` : ''}
      <div class="rv-contact">${contactParts}</div>
      ${summaryHTML}
      ${expHTML}
      ${eduHTML}
      ${skillsHTML}
      ${certsHTML}
      ${projHTML}`;
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── RENDER LIVE PREVIEW ───────────────────────────────────────────────────

  function renderPreview() {
    const state = AppState.getAll();
    const previewEl = document.getElementById('resume-preview');
    if (!previewEl) return;
    previewEl.innerHTML = buildResumeHTML(state);
    scalePreview();
  }

  function scalePreview() {
    const wrapper = document.querySelector('.preview-scale-wrapper');
    const preview = document.getElementById('resume-preview');
    if (!wrapper || !preview) return;
    const wrapperWidth = wrapper.clientWidth - 48;
    const previewWidth = 794; // A4 at 96dpi ≈ 794px
    const scale = Math.min(1, wrapperWidth / previewWidth);
    preview.style.transform = `scale(${scale})`;
    preview.style.marginBottom = `${-(previewWidth * (1 - scale) * 1.414)}px`;
  }

  // ── PDF DOWNLOAD ──────────────────────────────────────────────────────────

  async function downloadPDF() {
    const state = AppState.getAll();
    const name = state.name || 'Resume';

    // Build a standalone ATS-clean HTML for PDF
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, 'Liberation Sans', Helvetica, sans-serif;
    font-size: 10.5pt;
    color: #1a1a1a;
    line-height: 1.45;
    padding: 18mm 20mm;
    width: 210mm;
  }
  .rv-name { font-size: 22pt; font-weight: 700; margin-bottom: 3pt; }
  .rv-title { font-size: 11pt; color: #444; margin-bottom: 5pt; }
  .rv-contact { font-size: 9pt; color: #555; margin-bottom: 14pt; }
  .rv-contact span { margin-right: 12pt; }
  .rv-section { margin-bottom: 12pt; }
  .rv-section-title {
    font-size: 11pt; font-weight: 700; color: #1a1a1a;
    text-transform: uppercase; letter-spacing: 0.08em;
    border-bottom: 1.5pt solid #333; padding-bottom: 2pt;
    margin-bottom: 7pt;
  }
  .rv-entry { margin-bottom: 9pt; }
  .rv-entry-header { display: flex; justify-content: space-between; margin-bottom: 1pt; }
  .rv-entry-org { font-weight: 700; font-size: 10.5pt; }
  .rv-entry-date { font-size: 9.5pt; color: #555; }
  .rv-entry-role { font-style: italic; font-size: 10pt; color: #333; margin-bottom: 3pt; }
  .rv-bullet-list { margin: 0; padding-left: 14pt; }
  .rv-bullet-list li { font-size: 10pt; margin-bottom: 2pt; line-height: 1.4; }
  .rv-skills-row { font-size: 10pt; }
  .rv-summary { font-size: 10pt; color: #333; line-height: 1.55; }
</style>
</head>
<body>
${buildResumeHTML(state)}
</body>
</html>`;

    // Use html2pdf
    if (typeof html2pdf === 'undefined') {
      Toast.show('PDF library not loaded. Please check your connection.', 'error');
      return;
    }

    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.cssText = 'position:absolute;left:-9999px;top:0;';
    document.body.appendChild(container);

    const opt = {
      margin: 0,
      filename: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(container.firstElementChild).save();
      Toast.show('PDF downloaded successfully! ✓', 'success');
    } catch (e) {
      Toast.show('PDF export failed: ' + e.message, 'error');
    } finally {
      document.body.removeChild(container);
    }
  }

  // ── PLAIN TEXT EXPORT ─────────────────────────────────────────────────────

  function copyPlainText() {
    const state = AppState.getAll();
    const lines = [];

    lines.push(state.name || 'Your Name');
    if (state.title) lines.push(state.title);
    const contact = [state.email, state.phone, state.location, state.linkedin, state.portfolio].filter(Boolean);
    if (contact.length) lines.push(contact.join(' | '));
    lines.push('');

    if (state.aiSummary) {
      lines.push('PROFESSIONAL SUMMARY');
      lines.push(state.aiSummary);
      lines.push('');
    }

    const experiences = (state.experiences || []).filter(e => e.company || e.role);
    if (experiences.length) {
      lines.push('EXPERIENCE');
      experiences.forEach(exp => {
        lines.push(`${exp.company}${exp.role ? ' | ' + exp.role : ''}`);
        const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
        if (dates) lines.push(dates);
        (exp.bullets || []).filter(b => b.trim()).forEach(b => lines.push(`• ${b}`));
        lines.push('');
      });
    }

    const education = (state.education || []).filter(e => e.institution || e.degree);
    if (education.length) {
      lines.push('EDUCATION');
      education.forEach(edu => {
        lines.push(`${edu.institution}`);
        const deg = [edu.degree, edu.field].filter(Boolean).join(', ');
        if (deg) lines.push(deg);
        const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
        if (dates) lines.push(dates);
        lines.push('');
      });
    }

    if ((state.skills || []).length) {
      lines.push('SKILLS');
      lines.push(state.skills.join(', '));
      lines.push('');
    }

    const text = lines.join('\n');
    navigator.clipboard.writeText(text)
      .then(() => Toast.show('Plain text copied to clipboard!', 'success'))
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        Toast.show('Plain text copied!', 'success');
      });
  }

  return { renderPreview, scalePreview, downloadPDF, copyPlainText };
})();
