/**
 * APP CONTROLLER
 * Main application controller, form management, routing, and toast notifications
 */

// ── TOAST SYSTEM ──────────────────────────────────────────────────────────────

const Toast = (() => {
  let container;

  function init() {
    container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  }

  function show(message, type = 'info', duration = 4000) {
    const icons = { success: '✓', error: '⚠', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('exit');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  }

  return { init, show };
})();

// ── MODAL SYSTEM ──────────────────────────────────────────────────────────────

const Modal = (() => {
  let overlay, modal;

  function init() {
    overlay = document.getElementById('modal-overlay');
    modal = document.getElementById('modal-content');
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  function open(titleHTML, bodyHTML, footerHTML = '') {
    if (!overlay) return;
    modal.innerHTML = `
      <div class="modal-title">${titleHTML}</div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}`;
    overlay.classList.add('open');
  }

  function close() {
    overlay?.classList.remove('open');
  }

  return { init, open, close };
})();

// ── MAIN APP ──────────────────────────────────────────────────────────────────

const App = (() => {

  const SCREENS = ['screen-landing', 'screen-form', 'screen-editor'];
  let currentStep = 0; // 0=personal, 1=experience, 2=education, 3=skills, 4=target
  const FORM_STEPS = 5;

  // ── INIT ────────────────────────────────────────────────────────────────

  function init() {
    AppState.init();
    Toast.init();
    Modal.init();

    showScreen('screen-landing');
    initLanding();
    initForm();
    initEditor();
    initKeyboardShortcuts();

    // Restore session
    if (AppState.getApiKey() && AppState.get('generationComplete')) {
      showScreen('screen-editor');
      Editor.render();
    }
  }

  // ── SCREEN ROUTING ────────────────────────────────────────────────────────

  function showScreen(id) {
    SCREENS.forEach(s => {
      const el = document.getElementById(s);
      if (el) el.classList.remove('active');
    });
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
  }

  // ── LANDING SCREEN ────────────────────────────────────────────────────────

  function initLanding() {
    const keyInput = document.getElementById('api-key-input');
    const modelSelect = document.getElementById('model-select');
    const startBtn = document.getElementById('start-btn');
    const testBtn = document.getElementById('test-key-btn');

    // Populate models
    const models = AIEngine.getDefaultModels();
    if (modelSelect) {
      modelSelect.innerHTML = models.map(m =>
        `<option value="${m.id}" ${m.id === 'google/gemini-flash-1.5' ? 'selected' : ''}>${m.name}</option>`
      ).join('');

      // Restore last selected model
      const savedModel = AppState.getSelectedModel();
      if (savedModel) modelSelect.value = savedModel;

      modelSelect.onchange = () => AppState.setModel(modelSelect.value);
    }

    // Test API key
    testBtn?.addEventListener('click', async () => {
      const key = keyInput?.value.trim();
      if (!key) { Toast.show('Enter an API key first', 'info'); return; }

      testBtn.disabled = true;
      testBtn.textContent = 'Testing...';

      try {
        const ok = await AIEngine.testApiKey(key, modelSelect?.value);
        if (ok) {
          Toast.show('API key validated ✓ — Ready to go!', 'success');
          testBtn.textContent = '✓ Valid';
          testBtn.style.background = 'linear-gradient(135deg,#00e599,#00b4d8)';
          testBtn.style.color = '#000';
        } else {
          Toast.show('Invalid API key or model not available', 'error');
          testBtn.textContent = 'Test Key';
          testBtn.disabled = false;
        }
      } catch (e) {
        Toast.show('Connection error: ' + e.message, 'error');
        testBtn.textContent = 'Test Key';
        testBtn.disabled = false;
      }
    });

    // Start building
    startBtn?.addEventListener('click', () => {
      const key = keyInput?.value.trim();
      if (!key) { Toast.show('Please enter your OpenRouter API key', 'info'); keyInput?.focus(); return; }
      if (!key.startsWith('sk-or-')) {
        Toast.show('OpenRouter keys start with sk-or-...', 'info');
      }
      AppState.setApiKey(key);
      AppState.setModel(modelSelect?.value || 'google/gemini-flash-1.5');
      showScreen('screen-form');
      goToFormStep(0);
    });
  }

  // ── FORM SCREEN ─────────────────────────────────────────────────────────

  function initForm() {
    // Progress step clicks
    document.querySelectorAll('.progress-step[data-step]').forEach(el => {
      el.addEventListener('click', () => {
        const step = parseInt(el.dataset.step);
        if (step <= currentStep) goToFormStep(step);
      });
    });

    // Init experience entries
    renderFormExperiences();
    renderFormEducation();
    initFormSkills();
  }

  function goToFormStep(step) {
    currentStep = step;
    AppState.set('currentStep', step);

    // Update sections
    document.querySelectorAll('.form-section').forEach((el, i) => {
      el.classList.toggle('active', i === step);
    });

    // Update progress
    document.querySelectorAll('.progress-step[data-step]').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.toggle('active', s === step);
      el.classList.toggle('done', s < step);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    syncFormToState();
  }

  function syncFormToState() {
    // Personal info
    const fields = ['name', 'email', 'phone', 'location', 'linkedin', 'portfolio', 'title'];
    fields.forEach(f => {
      const el = document.getElementById(`f-${f}`);
      if (el) el.value = AppState.get(f) || '';
    });

    // Target
    const targetFields = ['targetRole', 'industry', 'jobDescription'];
    targetFields.forEach(f => {
      const el = document.getElementById(`f-${f}`);
      if (el) el.value = AppState.get(f) || '';
    });
  }

  function saveFormStep(step) {
    if (step === 0) {
      const fields = ['name', 'email', 'phone', 'location', 'linkedin', 'portfolio', 'title'];
      const updates = {};
      fields.forEach(f => {
        const el = document.getElementById(`f-${f}`);
        if (el) updates[f] = el.value.trim();
      });
      AppState.setMany(updates);

      if (!updates.name) { Toast.show('Name is required', 'info'); return false; }
    }
    if (step === 4) {
      const target = document.getElementById('f-targetRole');
      const industry = document.getElementById('f-industry');
      const jobDesc = document.getElementById('f-jobDescription');
      AppState.setMany({
        targetRole: target?.value.trim() || '',
        industry: industry?.value.trim() || '',
        jobDescription: jobDesc?.value.trim() || ''
      });
    }
    return true;
  }

  // Form next/back buttons (defined globally for inline onclick)
  window.formNext = (fromStep) => {
    if (!saveFormStep(fromStep)) return;
    if (fromStep + 1 < FORM_STEPS) goToFormStep(fromStep + 1);
  };

  window.formBack = (fromStep) => {
    if (fromStep > 0) goToFormStep(fromStep - 1);
  };

  window.formGenerate = async () => {
    saveFormStep(4);
    const state = AppState.getAll();
    if (!state.name) { Toast.show('Please fill in your name in Step 1', 'info'); goToFormStep(0); return; }

    showScreen('screen-editor');
    document.getElementById('editor-overlay')?.classList.remove('hidden');
    setGeneratingLabel('Initializing AI engine...');

    try {
      setGeneratingLabel('Crafting your professional summary...');
      const result = await AIEngine.generateFullResume(AppState.getAll());

      AppState.setMany({
        aiSummary: result.aiSummary,
        experiences: result.experiences,
        generationComplete: true
      });

      setGeneratingLabel('Rendering preview...');
      await sleep(400);
      document.getElementById('editor-overlay')?.classList.add('hidden');

      Editor.render();
      AppState.saveVersion('Initial AI Generation');
      Editor.renderVersionSelector();
      Toast.show('AI Resume generated successfully! 🚀', 'success');
    } catch (e) {
      document.getElementById('editor-overlay')?.classList.add('hidden');
      Toast.show('Generation failed: ' + e.message, 'error');
      // Still show editor with manual data
      Editor.render();
    }
  };

  function setGeneratingLabel(text) {
    const el = document.getElementById('gen-label');
    if (el) el.textContent = text;
  }

  // ── FORM: EXPERIENCE ─────────────────────────────────────────────────────

  function renderFormExperiences() {
    const container = document.getElementById('form-experiences');
    if (!container) return;
    container.innerHTML = '';

    (AppState.get('experiences') || []).forEach((exp, idx) => {
      const card = document.createElement('div');
      card.className = 'entry-card';
      card.innerHTML = `
        <div class="entry-card-header">
          <span class="entry-card-title">Experience ${idx + 1}</span>
          ${idx > 0 ? `<button class="btn btn-ghost btn-sm" style="color:var(--accent-tertiary);" onclick="App.removeFormExp('${exp.id}')">Remove</button>` : ''}
        </div>
        <div class="form-grid">
          <div class="input-group">
            <label>Company Name</label>
            <input type="text" data-exp-id="${exp.id}" data-field="company" value="${escForm(exp.company)}" placeholder="Google, Inc.">
          </div>
          <div class="input-group">
            <label>Job Title</label>
            <input type="text" data-exp-id="${exp.id}" data-field="role" value="${escForm(exp.role)}" placeholder="Senior Software Engineer">
          </div>
          <div class="input-group">
            <label>Start Date</label>
            <input type="text" data-exp-id="${exp.id}" data-field="startDate" value="${escForm(exp.startDate)}" placeholder="Jan 2022">
          </div>
          <div class="input-group">
            <label>End Date</label>
            <input type="text" data-exp-id="${exp.id}" data-field="endDate" value="${escForm(exp.endDate)}" placeholder="Dec 2024 or Present">
          </div>
          <div class="input-group full-width">
            <label>Key Accomplishments (one per line)</label>
            <textarea data-exp-id="${exp.id}" data-field="bullets-text" rows="4" placeholder="Increased system performance by 40%&#10;Led a team of 8 engineers&#10;Shipped 12 features on time and under budget">${escForm((exp.bullets || []).join('\n'))}</textarea>
          </div>
        </div>`;
      container.appendChild(card);

      // Bind
      card.querySelectorAll('[data-exp-id][data-field]').forEach(input => {
        input.addEventListener('change', () => {
          const field = input.dataset.field;
          const id = input.dataset.expId;
          if (field === 'bullets-text') {
            const bullets = input.value.split('\n').map(l => l.trim()).filter(l => l);
            AppState.updateExperience(id, 'bullets', bullets);
          } else {
            AppState.updateExperience(id, field, input.value.trim());
          }
        });
      });
    });

    // Add button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-entry-btn';
    addBtn.innerHTML = '+ Add Another Experience';
    addBtn.onclick = () => { AppState.addExperience(); renderFormExperiences(); };
    container.appendChild(addBtn);
  }

  window.App = { removeFormExp, removeFormEdu };

  function removeFormExp(id) {
    AppState.removeExperience(id);
    renderFormExperiences();
  }

  // ── FORM: EDUCATION ──────────────────────────────────────────────────────

  function renderFormEducation() {
    const container = document.getElementById('form-education');
    if (!container) return;
    container.innerHTML = '';

    (AppState.get('education') || []).forEach((edu, idx) => {
      const card = document.createElement('div');
      card.className = 'entry-card';
      card.innerHTML = `
        <div class="entry-card-header">
          <span class="entry-card-title">Education ${idx + 1}</span>
          ${idx > 0 ? `<button class="btn btn-ghost btn-sm" style="color:var(--accent-tertiary);" onclick="App.removeFormEdu('${edu.id}')">Remove</button>` : ''}
        </div>
        <div class="form-grid">
          <div class="input-group full-width">
            <label>Institution Name</label>
            <input type="text" data-edu-id="${edu.id}" data-field="institution" value="${escForm(edu.institution)}" placeholder="Massachusetts Institute of Technology">
          </div>
          <div class="input-group">
            <label>Degree</label>
            <input type="text" data-edu-id="${edu.id}" data-field="degree" value="${escForm(edu.degree)}" placeholder="Bachelor of Science">
          </div>
          <div class="input-group">
            <label>Field of Study</label>
            <input type="text" data-edu-id="${edu.id}" data-field="field" value="${escForm(edu.field)}" placeholder="Computer Science">
          </div>
          <div class="input-group">
            <label>Start Year</label>
            <input type="text" data-edu-id="${edu.id}" data-field="startDate" value="${escForm(edu.startDate)}" placeholder="2018">
          </div>
          <div class="input-group">
            <label>End Year</label>
            <input type="text" data-edu-id="${edu.id}" data-field="endDate" value="${escForm(edu.endDate)}" placeholder="2022">
          </div>
          <div class="input-group">
            <label>GPA (Optional)</label>
            <input type="text" data-edu-id="${edu.id}" data-field="gpa" value="${escForm(edu.gpa)}" placeholder="3.9/4.0">
          </div>
          <div class="input-group">
            <label>Honors (Optional)</label>
            <input type="text" data-edu-id="${edu.id}" data-field="honors" value="${escForm(edu.honors)}" placeholder="Summa Cum Laude">
          </div>
        </div>`;
      container.appendChild(card);

      card.querySelectorAll('[data-edu-id][data-field]').forEach(input => {
        input.addEventListener('change', () => {
          AppState.updateEducation(edu.id, input.dataset.field, input.value.trim());
        });
      });
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'add-entry-btn';
    addBtn.innerHTML = '+ Add Another Degree';
    addBtn.onclick = () => { AppState.addEducation(); renderFormEducation(); };
    container.appendChild(addBtn);
  }

  function removeFormEdu(id) {
    AppState.removeEducation(id);
    renderFormEducation();
  }

  // ── FORM: SKILLS ─────────────────────────────────────────────────────────

  function initFormSkills() {
    const input = document.getElementById('fs-skill-input');
    const addBtn = document.getElementById('fs-add-skill-btn');

    const addSkill = () => {
      const val = input?.value.replace(/,/g, '').trim();
      if (val) {
        AppState.addSkill(val);
        if (input) input.value = '';
        renderFormSkills();
      }
    };

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
    });
    addBtn?.addEventListener('click', addSkill);

    renderFormSkills();
  }

  function renderFormSkills() {
    const display = document.getElementById('fs-skills-display');
    if (!display) return;
    const skills = AppState.get('skills') || [];
    display.innerHTML = skills.map(s => `
      <span class="skill-chip">
        ${escForm(s)}
        <span class="remove-skill" onclick="AppState.removeSkill('${s.replace(/'/g, "\\'")}');renderFormSkillsGlobal()">✕</span>
      </span>`).join('');
  }

  window.renderFormSkillsGlobal = renderFormSkills;

  // ── EDITOR SCREEN ─────────────────────────────────────────────────────────

  function initEditor() {
    // Save version
    document.getElementById('save-version-btn')?.addEventListener('click', () => {
      const label = prompt('Version name:', `Version — ${new Date().toLocaleTimeString()}`);
      if (label !== null) {
        AppState.saveVersion(label || undefined);
        Editor.renderVersionSelector();
        Toast.show('Version saved ✓', 'success');
      }
    });

    // Export PDF
    document.getElementById('export-pdf-btn')?.addEventListener('click', PDFExport.downloadPDF);

    // Export plain text
    document.getElementById('export-text-btn')?.addEventListener('click', PDFExport.copyPlainText);

    // Export modal
    document.getElementById('export-btn')?.addEventListener('click', () => {
      Modal.open(
        '📄 Export Resume',
        `<div class="export-options">
          <div class="export-option" onclick="PDFExport.downloadPDF();Modal.close()">
            <div class="export-icon" style="background:rgba(108,99,255,0.15);">📄</div>
            <div class="export-info">
              <div class="export-name">Download PDF</div>
              <div class="export-desc">ATS-optimized single-column PDF — best for job portals</div>
            </div>
          </div>
          <div class="export-option" onclick="PDFExport.copyPlainText();Modal.close()">
            <div class="export-icon" style="background:rgba(0,212,255,0.15);">📋</div>
            <div class="export-info">
              <div class="export-name">Copy Plain Text</div>
              <div class="export-desc">Paste directly into job application forms</div>
            </div>
          </div>
        </div>`,
        `<button class="btn btn-ghost" onclick="Modal.close()">Close</button>`
      );
    });

    // ATS Analyze
    document.getElementById('ats-analyze-btn')?.addEventListener('click', Editor.runATSAnalysis);

    // Back to form
    document.getElementById('back-to-form-btn')?.addEventListener('click', () => {
      showScreen('screen-form');
      goToFormStep(currentStep);
    });

    // Regenerate
    document.getElementById('regenerate-btn')?.addEventListener('click', async () => {
      if (!confirm('Regenerate with AI? Your current content will be replaced. Save a version first!')) return;
      document.getElementById('editor-overlay')?.classList.remove('hidden');
      setGeneratingLabel('Regenerating with AI...');
      try {
        const result = await AIEngine.generateFullResume(AppState.getAll());
        AppState.setMany({ aiSummary: result.aiSummary, experiences: result.experiences });
        document.getElementById('editor-overlay')?.classList.add('hidden');
        Editor.render();
        Toast.show('Resume regenerated ✓', 'success');
      } catch (e) {
        document.getElementById('editor-overlay')?.classList.add('hidden');
        Toast.show('Regeneration failed: ' + e.message, 'error');
      }
    });

    // Summary AI buttons
    document.getElementById('summary-ats-btn')?.addEventListener('click', Editor.enhanceSummary);
    document.getElementById('summary-rewrite-btn')?.addEventListener('click', Editor.rewriteSummaryForRole);
  }

  // ── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') { e.preventDefault(); AppState.saveVersion(); Toast.show('Version auto-saved ✓', 'success'); }
        if (e.key === 'p') { e.preventDefault(); PDFExport.downloadPDF(); }
      }
    });
  }

  // ── UTILITIES ─────────────────────────────────────────────────────────────

  function escForm(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  return { init, showScreen, goToFormStep };
})();

// ── BOOT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
