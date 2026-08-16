/**
 * EDITOR MODULE
 * Inline editing, real-time preview sync, and AI action buttons
 */

const Editor = (() => {

  let _atsRefreshTimer = null;

  // ── RENDER EDITOR PANEL ───────────────────────────────────────────────────

  function render() {
    renderHeader();
    renderSummarySection();
    renderExperienceSection();
    renderEducationSection();
    renderSkillsSection();
    renderVersionSelector();
    PDFExport.renderPreview();
    scalePreviewOnResize();
  }

  function renderHeader() {
    const state = AppState.getAll();
    const headerEl = document.getElementById('editor-header-section');
    if (!headerEl) return;
    headerEl.innerHTML = `
      <div class="form-grid" style="grid-template-columns:1fr 1fr; gap:12px;">
        <div class="input-group">
          <label>Full Name</label>
          <input class="editable-field small" id="ed-name" type="text" value="${esc(state.name)}" placeholder="John Smith">
        </div>
        <div class="input-group">
          <label>Professional Title</label>
          <input class="editable-field small" id="ed-title" type="text" value="${esc(state.title)}" placeholder="Senior Software Engineer">
        </div>
        <div class="input-group">
          <label>Email</label>
          <input class="editable-field small" id="ed-email" type="text" value="${esc(state.email)}">
        </div>
        <div class="input-group">
          <label>Phone</label>
          <input class="editable-field small" id="ed-phone" type="text" value="${esc(state.phone)}">
        </div>
        <div class="input-group">
          <label>Location</label>
          <input class="editable-field small" id="ed-location" type="text" value="${esc(state.location)}">
        </div>
        <div class="input-group">
          <label>LinkedIn</label>
          <input class="editable-field small" id="ed-linkedin" type="text" value="${esc(state.linkedin)}">
        </div>
      </div>`;

    // Bind listeners
    bindInput('ed-name', 'name');
    bindInput('ed-title', 'title');
    bindInput('ed-email', 'email');
    bindInput('ed-phone', 'phone');
    bindInput('ed-location', 'location');
    bindInput('ed-linkedin', 'linkedin');
  }

  function renderSummarySection() {
    const state = AppState.getAll();
    const el = document.getElementById('editor-summary-section');
    if (!el) return;
    el.innerHTML = `
      <div class="field-label">AI-Generated Professional Summary</div>
      <textarea class="editable-field" id="ed-summary" rows="4" placeholder="Your summary will appear here after AI generation...">${esc(state.aiSummary)}</textarea>`;

    const ta = el.querySelector('#ed-summary');
    ta.addEventListener('input', debounce(() => {
      AppState.set('aiSummary', ta.value);
      PDFExport.renderPreview();
    }, 300));

    autoResize(ta);
  }

  function renderExperienceSection() {
    const state = AppState.getAll();
    const el = document.getElementById('editor-exp-section');
    if (!el) return;
    el.innerHTML = '';

    (state.experiences || []).forEach((exp, idx) => {
      const div = document.createElement('div');
      div.className = 'exp-entry';
      div.dataset.expId = exp.id;
      div.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Experience ${idx + 1}</span>
          <div style="display:flex;gap:6px;">
            <button class="ai-btn" onclick="Editor.enhanceExpBullets('${exp.id}')">
              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              Enhance All
            </button>
            ${idx > 0 ? `<button class="ai-btn" style="color:var(--accent-tertiary);border-color:rgba(255,107,157,0.3);" onclick="Editor.removeExp('${exp.id}')">✕ Remove</button>` : ''}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <div>
            <div class="field-label">Company</div>
            <input class="editable-field small" data-exp-id="${exp.id}" data-field="company" type="text" value="${esc(exp.company)}" placeholder="Google">
          </div>
          <div>
            <div class="field-label">Role</div>
            <input class="editable-field small" data-exp-id="${exp.id}" data-field="role" type="text" value="${esc(exp.role)}" placeholder="Software Engineer">
          </div>
          <div>
            <div class="field-label">Start Date</div>
            <input class="editable-field small" data-exp-id="${exp.id}" data-field="startDate" type="text" value="${esc(exp.startDate)}" placeholder="Jan 2022">
          </div>
          <div>
            <div class="field-label">End Date</div>
            <input class="editable-field small" data-exp-id="${exp.id}" data-field="endDate" type="text" value="${exp.current ? 'Present' : esc(exp.endDate)}" placeholder="Dec 2024 or Present">
          </div>
        </div>
        <div class="field-label">Accomplishments / Bullets</div>
        <div class="bullets-container" data-exp-id="${exp.id}">
          ${(exp.bullets || []).map((b, i) => `
            <div style="display:flex;gap:6px;align-items:flex-start;margin-bottom:6px;">
              <span style="color:var(--text-muted);margin-top:10px;font-size:0.85rem;">•</span>
              <textarea class="editable-field small" style="flex:1;min-height:36px;" data-exp-id="${exp.id}" data-bullet-idx="${i}" placeholder="Describe an accomplishment...">${esc(b)}</textarea>
              <button style="background:none;border:none;cursor:pointer;color:var(--text-muted);margin-top:8px;font-size:0.9rem;transition:color 0.15s;" onmouseenter="this.style.color='var(--accent-tertiary)'" onmouseleave="this.style.color='var(--text-muted)'" onclick="Editor.removeBullet('${exp.id}',${i})">✕</button>
              <button class="ai-btn" style="margin-top:6px;flex-shrink:0;" onclick="Editor.enhanceSingleBullet('${exp.id}',${i})">
                <svg width="9" height="9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </button>
            </div>`).join('')}
        </div>
        <button class="add-entry-btn" style="margin-top:6px;margin-bottom:0;padding:8px 14px;font-size:0.8rem;" onclick="Editor.addBullet('${exp.id}')">
          + Add Bullet
        </button>`;

      el.appendChild(div);

      // Bind inputs
      div.querySelectorAll('[data-exp-id][data-field]').forEach(input => {
        input.addEventListener('input', debounce(() => {
          AppState.updateExperience(exp.id, input.dataset.field, input.value);
          PDFExport.renderPreview();
        }, 300));
      });

      // Bind bullet textareas
      div.querySelectorAll('[data-bullet-idx]').forEach(ta => {
        ta.addEventListener('input', debounce(() => {
          AppState.updateExpBullet(exp.id, parseInt(ta.dataset.bulletIdx), ta.value);
          PDFExport.renderPreview();
        }, 300));
        autoResize(ta);
      });
    });

    // Add experience button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-entry-btn';
    addBtn.innerHTML = '+ Add Experience';
    addBtn.onclick = () => { AppState.addExperience(); renderExperienceSection(); };
    el.appendChild(addBtn);
  }

  function renderEducationSection() {
    const state = AppState.getAll();
    const el = document.getElementById('editor-edu-section');
    if (!el) return;
    el.innerHTML = '';

    (state.education || []).forEach((edu, idx) => {
      const div = document.createElement('div');
      div.className = 'edu-entry';
      div.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Education ${idx + 1}</span>
          ${idx > 0 ? `<button class="ai-btn" style="color:var(--accent-tertiary);border-color:rgba(255,107,157,0.3);" onclick="Editor.removeEdu('${edu.id}')">✕ Remove</button>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="full-width" style="grid-column:1/-1;">
            <div class="field-label">Institution</div>
            <input class="editable-field small" data-edu-id="${edu.id}" data-field="institution" type="text" value="${esc(edu.institution)}" placeholder="MIT">
          </div>
          <div>
            <div class="field-label">Degree</div>
            <input class="editable-field small" data-edu-id="${edu.id}" data-field="degree" type="text" value="${esc(edu.degree)}" placeholder="Bachelor of Science">
          </div>
          <div>
            <div class="field-label">Field of Study</div>
            <input class="editable-field small" data-edu-id="${edu.id}" data-field="field" type="text" value="${esc(edu.field)}" placeholder="Computer Science">
          </div>
          <div>
            <div class="field-label">Start Year</div>
            <input class="editable-field small" data-edu-id="${edu.id}" data-field="startDate" type="text" value="${esc(edu.startDate)}" placeholder="2018">
          </div>
          <div>
            <div class="field-label">End Year</div>
            <input class="editable-field small" data-edu-id="${edu.id}" data-field="endDate" type="text" value="${esc(edu.endDate)}" placeholder="2022">
          </div>
          <div>
            <div class="field-label">GPA (Optional)</div>
            <input class="editable-field small" data-edu-id="${edu.id}" data-field="gpa" type="text" value="${esc(edu.gpa)}" placeholder="3.9">
          </div>
          <div>
            <div class="field-label">Honors (Optional)</div>
            <input class="editable-field small" data-edu-id="${edu.id}" data-field="honors" type="text" value="${esc(edu.honors)}" placeholder="Cum Laude">
          </div>
        </div>`;

      el.appendChild(div);

      div.querySelectorAll('[data-edu-id][data-field]').forEach(input => {
        input.addEventListener('input', debounce(() => {
          AppState.updateEducation(edu.id, input.dataset.field, input.value);
          PDFExport.renderPreview();
        }, 300));
      });
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'add-entry-btn';
    addBtn.innerHTML = '+ Add Education';
    addBtn.onclick = () => { AppState.addEducation(); renderEducationSection(); };
    el.appendChild(addBtn);
  }

  function renderSkillsSection() {
    const state = AppState.getAll();
    const el = document.getElementById('editor-skills-section');
    if (!el) return;

    const skillsHTML = (state.skills || []).map(skill => `
      <span class="skill-chip">
        ${esc(skill)}
        <span class="remove-skill" onclick="Editor.removeSkill('${esc(skill)}')">✕</span>
      </span>`).join('');

    el.innerHTML = `
      <div class="skill-input-row">
        <input class="editable-field small" id="skill-input" type="text" placeholder="Add a skill and press Enter or comma..." style="flex:1;">
        <button class="btn btn-secondary btn-sm" onclick="Editor.addSkillFromInput()">Add</button>
      </div>
      <div class="skills-grid" id="skills-display">${skillsHTML}</div>
      <button class="ai-btn" style="margin-top:12px;" onclick="Editor.suggestSkills()">
        <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
        AI Suggest Skills
      </button>`;

    const input = el.querySelector('#skill-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        Editor.addSkillFromInput();
      }
    });
  }

  function renderVersionSelector() {
    const versions = AppState.getVersions();
    const sel = document.getElementById('version-select');
    if (!sel) return;
    sel.innerHTML = `<option value="">Current Draft</option>` +
      versions.map(v => `<option value="${v.id}">${esc(v.label)}</option>`).join('');
    sel.onchange = () => {
      if (sel.value) {
        if (confirm('Load this version? Unsaved changes to current draft will be lost.')) {
          AppState.loadVersion(sel.value);
          render();
          Toast.show('Version loaded', 'success');
        } else {
          sel.value = '';
        }
      }
    };
  }

  // ── AI ACTIONS ────────────────────────────────────────────────────────────

  async function enhanceExpBullets(expId) {
    const state = AppState.getAll();
    const exp = state.experiences.find(e => e.id === expId);
    if (!exp || !exp.bullets.some(b => b.trim())) {
      Toast.show('Add some bullet points first', 'info'); return;
    }

    const btns = document.querySelectorAll(`[onclick*="${expId}"]`);
    btns.forEach(b => b.classList.add('loading'));
    setAIStatus(true);

    try {
      const enhanced = await Promise.all(exp.bullets.map(async (b) => {
        if (!b.trim()) return b;
        return await AIEngine.enhanceBullet(b, exp.role, exp.company);
      }));

      AppState.updateExperience(expId, 'bullets', enhanced);
      renderExperienceSection();
      PDFExport.renderPreview();
      Toast.show('Bullets enhanced with AI ✓', 'success');
    } catch (e) {
      Toast.show('AI error: ' + e.message, 'error');
    } finally {
      btns.forEach(b => b.classList.remove('loading'));
      setAIStatus(false);
    }
  }

  async function enhanceSingleBullet(expId, bulletIdx) {
    const state = AppState.getAll();
    const exp = state.experiences.find(e => e.id === expId);
    if (!exp) return;
    const bullet = exp.bullets[bulletIdx];
    if (!bullet?.trim()) { Toast.show('Bullet is empty', 'info'); return; }

    setAIStatus(true);
    try {
      const enhanced = await AIEngine.enhanceBullet(bullet, exp.role, exp.company);
      AppState.updateExpBullet(expId, bulletIdx, enhanced);
      renderExperienceSection();
      PDFExport.renderPreview();
      Toast.show('Bullet enhanced ✓', 'success');
    } catch (e) {
      Toast.show('AI error: ' + e.message, 'error');
    } finally {
      setAIStatus(false);
    }
  }

  async function enhanceSummary() {
    const state = AppState.getAll();
    const summary = state.aiSummary;
    if (!summary?.trim()) { Toast.show('Generate a summary first', 'info'); return; }

    setAIStatus(true);
    try {
      const enhanced = await AIEngine.makeATSFriendly(summary, 'Professional Summary');
      AppState.set('aiSummary', enhanced);
      renderSummarySection();
      PDFExport.renderPreview();
      Toast.show('Summary ATS-optimized ✓', 'success');
    } catch (e) {
      Toast.show('AI error: ' + e.message, 'error');
    } finally {
      setAIStatus(false);
    }
  }

  async function rewriteSummaryForRole() {
    const state = AppState.getAll();
    const summary = state.aiSummary;
    if (!summary?.trim()) { Toast.show('Generate a summary first', 'info'); return; }

    setAIStatus(true);
    try {
      const rewritten = await AIEngine.rewriteForRole(summary, 'Professional Summary');
      AppState.set('aiSummary', rewritten);
      renderSummarySection();
      PDFExport.renderPreview();
      Toast.show('Summary rewritten for target role ✓', 'success');
    } catch (e) {
      Toast.show('AI error: ' + e.message, 'error');
    } finally {
      setAIStatus(false);
    }
  }

  async function suggestSkills() {
    setAIStatus(true);
    try {
      const suggestions = await AIEngine.suggestSkills();
      // Show suggestions as clickable chips
      const skillsEl = document.getElementById('editor-skills-section');
      const existing = document.getElementById('skill-suggestions');
      if (existing) existing.remove();

      const suggestDiv = document.createElement('div');
      suggestDiv.id = 'skill-suggestions';
      suggestDiv.style.cssText = 'margin-top:16px;';
      suggestDiv.innerHTML = `
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em;">AI Suggestions — click to add</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${suggestions.map(s => `
            <span class="chip-option" onclick="Editor.addSuggestedSkill(this,'${esc(s)}')">${esc(s)}</span>
          `).join('')}
        </div>`;
      skillsEl.appendChild(suggestDiv);
      Toast.show('AI skill suggestions ready ✓', 'success');
    } catch (e) {
      Toast.show('AI error: ' + e.message, 'error');
    } finally {
      setAIStatus(false);
    }
  }

  async function runATSAnalysis() {
    const btn = document.getElementById('ats-analyze-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Analyzing...'; }
    setAIStatus(true);

    try {
      const analysis = await AIEngine.analyzeATSScore();
      AppState.set('atsScore', analysis);
      renderATSBadge(analysis);
      Toast.show(`ATS Score: ${analysis.score}/100`, analysis.score >= 70 ? 'success' : 'info');
    } catch (e) {
      Toast.show('ATS analysis failed: ' + e.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Analyze ATS'; }
      setAIStatus(false);
    }
  }

  function renderATSBadge(analysis) {
    const container = document.getElementById('ats-badge-container');
    if (!container) return;
    const score = analysis.score || 0;
    const color = score >= 80 ? '#00e599' : score >= 60 ? '#ffb347' : '#ff6b9d';
    const pct = `${score}%`;

    container.innerHTML = `
      <div style="background:var(--bg-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:16px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="width:52px;height:52px;border-radius:50%;background:conic-gradient(${color} ${pct},var(--bg-surface) 0);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;">
            <div style="position:absolute;width:38px;height:38px;background:var(--bg-card);border-radius:50%;"></div>
            <span style="font-size:0.75rem;font-weight:700;color:${color};position:relative;z-index:1;">${score}</span>
          </div>
          <div>
            <div style="font-weight:700;color:${color};font-size:1.1rem;">ATS Score: ${score}/100</div>
            <div style="font-size:0.78rem;color:var(--text-muted);">${score >= 80 ? 'Excellent' : score >= 60 ? 'Good — some improvements needed' : 'Needs work'}</div>
          </div>
        </div>
        ${analysis.keywordsMissing?.length ? `
        <div style="margin-bottom:8px;">
          <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Missing Keywords</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${analysis.keywordsMissing.slice(0,5).map(k => `<span style="background:rgba(255,107,157,0.1);border:1px solid rgba(255,107,157,0.3);border-radius:50px;padding:2px 10px;font-size:0.75rem;color:#ff9eb5;">${esc(k)}</span>`).join('')}
          </div>
        </div>` : ''}
        ${analysis.improvements?.length ? `
        <div>
          <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Quick Wins</div>
          ${analysis.improvements.slice(0,3).map(i => `<div style="font-size:0.8rem;color:var(--text-secondary);padding:4px 0;border-bottom:1px solid var(--border-default);">→ ${esc(i)}</div>`).join('')}
        </div>` : ''}
      </div>`;
  }

  // ── SKILL HELPERS ─────────────────────────────────────────────────────────

  function addSkillFromInput() {
    const input = document.getElementById('skill-input');
    if (!input) return;
    const val = input.value.replace(/,/g, '').trim();
    if (val) {
      AppState.addSkill(val);
      input.value = '';
      renderSkillsSection();
      PDFExport.renderPreview();
    }
  }

  function addSuggestedSkill(el, skill) {
    AppState.addSkill(skill);
    el.classList.add('selected');
    el.onclick = null;
    renderSkillsSection();
    PDFExport.renderPreview();
  }

  function removeSkill(skill) {
    AppState.removeSkill(skill);
    renderSkillsSection();
    PDFExport.renderPreview();
  }

  function addBullet(expId) {
    AppState.addExpBullet(expId);
    renderExperienceSection();
  }

  function removeBullet(expId, idx) {
    AppState.removeExpBullet(expId, idx);
    renderExperienceSection();
    PDFExport.renderPreview();
  }

  function removeExp(expId) {
    AppState.removeExperience(expId);
    renderExperienceSection();
    PDFExport.renderPreview();
  }

  function removeEdu(eduId) {
    AppState.removeEducation(eduId);
    renderEducationSection();
    PDFExport.renderPreview();
  }

  // ── UTILITIES ─────────────────────────────────────────────────────────────

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function bindInput(id, stateKey) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', debounce(() => {
      AppState.set(stateKey, el.value);
      PDFExport.renderPreview();
    }, 300));
  }

  function autoResize(el) {
    const resize = () => {
      el.style.height = 'auto';
      el.style.height = Math.max(36, el.scrollHeight) + 'px';
    };
    el.addEventListener('input', resize);
    resize();
  }

  function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  function setAIStatus(isThinking) {
    const badge = document.getElementById('ai-status-badge');
    if (!badge) return;
    if (isThinking) {
      badge.className = 'ai-status thinking';
      badge.innerHTML = `<span class="status-dot"></span> Thinking...`;
    } else {
      badge.className = 'ai-status';
      badge.innerHTML = `<span class="status-dot"></span> AI Ready`;
    }
  }

  function scalePreviewOnResize() {
    PDFExport.scalePreview();
    window.addEventListener('resize', debounce(PDFExport.scalePreview, 100));
  }

  return {
    render,
    enhanceExpBullets, enhanceSingleBullet,
    enhanceSummary, rewriteSummaryForRole,
    suggestSkills, addSuggestedSkill,
    addSkillFromInput, removeSkill,
    addBullet, removeBullet,
    removeExp, removeEdu,
    runATSAnalysis,
    renderVersionSelector
  };
})();
