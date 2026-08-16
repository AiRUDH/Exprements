/**
 * STATE MANAGEMENT
 * Resume versioning, localStorage persistence, and reactive state
 */

const AppState = (() => {

  const STORAGE_KEY = 'airesu_state';
  const VERSIONS_KEY = 'airesu_versions';
  const API_KEY_SESSION = 'airesu_apikey';
  const MODEL_KEY = 'airesu_model';

  const MAX_VERSIONS = 10;

  let _state = {
    // API config
    apiKey: '',
    selectedModel: 'google/gemini-flash-1.5',

    // Personal info
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    title: '',

    // Target
    targetRole: '',
    industry: '',
    jobDescription: '',

    // AI-generated
    aiSummary: '',

    // Experience
    experiences: [
      {
        id: 'exp_0',
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        current: false,
        bullets: ['']
      }
    ],

    // Education
    education: [
      {
        id: 'edu_0',
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
        honors: ''
      }
    ],

    // Skills
    skills: [],
    skillCategories: {
      technical: [],
      soft: [],
      tools: [],
      languages: []
    },

    // Certifications
    certifications: [],

    // Projects
    projects: [],

    // ATS Analysis cache
    atsScore: null,

    // UI state
    currentStep: 0,
    generationComplete: false
  };

  let _versions = [];
  let _listeners = {};

  // ── INIT ──────────────────────────────────────────────────────────────────

  function init() {
    // Load API key from sessionStorage (not persisted across browser closes)
    const savedKey = sessionStorage.getItem(API_KEY_SESSION);
    if (savedKey) _state.apiKey = savedKey;

    const savedModel = localStorage.getItem(MODEL_KEY);
    if (savedModel) _state.selectedModel = savedModel;

    // Load last state from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge saved state (exclude apiKey for security)
        _state = { ..._state, ...parsed, apiKey: _state.apiKey };
      }
    } catch (e) {
      console.warn('State restore failed:', e);
    }

    // Load versions
    try {
      const savedVersions = localStorage.getItem(VERSIONS_KEY);
      if (savedVersions) _versions = JSON.parse(savedVersions);
    } catch (e) {
      _versions = [];
    }
  }

  // ── GETTERS ──────────────────────────────────────────────────────────────

  function get(key) { return _state[key]; }
  function getAll() { return { ..._state }; }
  function getCurrentResume() { return { ..._state }; }
  function getApiKey() { return _state.apiKey || sessionStorage.getItem(API_KEY_SESSION) || ''; }
  function getSelectedModel() { return _state.selectedModel; }
  function getVersions() { return [..._versions]; }

  // ── SETTERS ──────────────────────────────────────────────────────────────

  function set(key, value) {
    _state[key] = value;
    _persist();
    _notify(key, value);
  }

  function setMany(updates) {
    Object.assign(_state, updates);
    _persist();
    Object.keys(updates).forEach(k => _notify(k, updates[k]));
  }

  function setApiKey(key) {
    _state.apiKey = key;
    sessionStorage.setItem(API_KEY_SESSION, key); // Only sessionStorage for security
  }

  function setModel(model) {
    _state.selectedModel = model;
    localStorage.setItem(MODEL_KEY, model);
  }

  // ── EXPERIENCE ────────────────────────────────────────────────────────────

  function addExperience() {
    const id = `exp_${Date.now()}`;
    _state.experiences.push({
      id, company: '', role: '', startDate: '', endDate: '', current: false, bullets: ['']
    });
    _persist();
    _notify('experiences', _state.experiences);
    return id;
  }

  function updateExperience(id, field, value) {
    const exp = _state.experiences.find(e => e.id === id);
    if (exp) {
      exp[field] = value;
      _persist();
      _notify('experiences', _state.experiences);
    }
  }

  function removeExperience(id) {
    _state.experiences = _state.experiences.filter(e => e.id !== id);
    _persist();
    _notify('experiences', _state.experiences);
  }

  function updateExpBullet(expId, bulletIdx, value) {
    const exp = _state.experiences.find(e => e.id === expId);
    if (exp) {
      exp.bullets[bulletIdx] = value;
      _persist();
    }
  }

  function addExpBullet(expId) {
    const exp = _state.experiences.find(e => e.id === expId);
    if (exp) {
      exp.bullets.push('');
      _persist();
      _notify('experiences', _state.experiences);
    }
  }

  function removeExpBullet(expId, idx) {
    const exp = _state.experiences.find(e => e.id === expId);
    if (exp && exp.bullets.length > 1) {
      exp.bullets.splice(idx, 1);
      _persist();
      _notify('experiences', _state.experiences);
    }
  }

  // ── EDUCATION ─────────────────────────────────────────────────────────────

  function addEducation() {
    const id = `edu_${Date.now()}`;
    _state.education.push({
      id, institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', honors: ''
    });
    _persist();
    _notify('education', _state.education);
    return id;
  }

  function updateEducation(id, field, value) {
    const edu = _state.education.find(e => e.id === id);
    if (edu) {
      edu[field] = value;
      _persist();
    }
  }

  function removeEducation(id) {
    _state.education = _state.education.filter(e => e.id !== id);
    _persist();
    _notify('education', _state.education);
  }

  // ── SKILLS ────────────────────────────────────────────────────────────────

  function addSkill(skill) {
    const trimmed = skill.trim();
    if (trimmed && !_state.skills.includes(trimmed)) {
      _state.skills.push(trimmed);
      _persist();
      _notify('skills', _state.skills);
    }
  }

  function removeSkill(skill) {
    _state.skills = _state.skills.filter(s => s !== skill);
    _persist();
    _notify('skills', _state.skills);
  }

  // ── VERSIONS ─────────────────────────────────────────────────────────────

  function saveVersion(label) {
    const version = {
      id: `v${Date.now()}`,
      label: label || `Version ${_versions.length + 1} — ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(_state)) // Deep clone
    };
    _versions.unshift(version);
    if (_versions.length > MAX_VERSIONS) _versions = _versions.slice(0, MAX_VERSIONS);
    _persistVersions();
    return version.id;
  }

  function loadVersion(id) {
    const version = _versions.find(v => v.id === id);
    if (!version) return false;
    const savedKey = _state.apiKey; // Preserve API key
    _state = { ...version.state, apiKey: savedKey };
    _persist();
    _notify('_all', null);
    return true;
  }

  function deleteVersion(id) {
    _versions = _versions.filter(v => v.id !== id);
    _persistVersions();
  }

  // ── PERSISTENCE ──────────────────────────────────────────────────────────

  function _persist() {
    try {
      const toSave = { ..._state };
      delete toSave.apiKey; // NEVER persist API key to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Persist failed:', e);
    }
  }

  function _persistVersions() {
    try {
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(_versions));
    } catch (e) {
      console.warn('Version persist failed:', e);
    }
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSIONS_KEY);
    sessionStorage.removeItem(API_KEY_SESSION);
    location.reload();
  }

  // ── REACTIVE LISTENERS ───────────────────────────────────────────────────

  function on(key, callback) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(callback);
    return () => {
      _listeners[key] = _listeners[key].filter(cb => cb !== callback);
    };
  }

  function _notify(key, value) {
    (_listeners[key] || []).forEach(cb => cb(value));
    (_listeners['*'] || []).forEach(cb => cb(key, value));
  }

  return {
    init, get, getAll, getCurrentResume, getApiKey, getSelectedModel, getVersions,
    set, setMany, setApiKey, setModel,
    addExperience, updateExperience, removeExperience,
    updateExpBullet, addExpBullet, removeExpBullet,
    addEducation, updateEducation, removeEducation,
    addSkill, removeSkill,
    saveVersion, loadVersion, deleteVersion,
    clearAll, on
  };

})();
