/**
 * AI ENGINE — OpenRouter Integration
 * Precision-engineered ATS optimization prompts
 * Zero data retention: API calls are ephemeral, browser-side only
 */

const AIEngine = (() => {

  const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
  const DEFAULT_MODEL = 'google/gemini-flash-1.5';

  // ── ATS MASTER SYSTEM PROMPT ──────────────────────────────────────────────
  const ATS_SYSTEM_PROMPT = `You are an elite Resume Architect and ATS Optimization Specialist with 15+ years of experience in HR technology and talent acquisition systems.

CORE DIRECTIVES — STRICTLY ENFORCED:
1. NEVER HALLUCINATE: Only use information explicitly provided by the user. Do not invent companies, degrees, titles, dates, metrics, or achievements.
2. ATS COMPLIANCE: All output must use standard section names (Experience, Education, Skills, Summary). No tables, columns, graphics, or special characters that break parsers.
3. FACTUAL PRECISION: Rewrite content to be more impactful using stronger action verbs and quantification WHERE the user has provided numbers. Never fabricate metrics.
4. KEYWORD OPTIMIZATION: Naturally weave keywords from the target job description into the user's existing content without changing facts.
5. FORMAT: Return only the requested content, no preamble, no explanations, no markdown unless specifically asked.`;

  // ── PROMPT TEMPLATES ─────────────────────────────────────────────────────

  const PROMPTS = {

    generateSummary: (data) => `
${ATS_SYSTEM_PROMPT}

USER DATA:
Name: ${data.name}
Current/Target Title: ${data.targetRole || data.title}
Years of Experience: ${data.yearsExp || 'Not specified'}
Top Skills: ${(data.skills || []).join(', ')}
Target Job Description: ${data.jobDescription || 'General job seeker'}
Industry: ${data.industry || 'Technology'}

TASK: Write a compelling 3-sentence professional summary for this person's resume.
- Sentence 1: Who they are + years of experience + field
- Sentence 2: Core technical/professional strengths (use their actual skills)
- Sentence 3: Value proposition aligned to the target role
- Do NOT use "I" or first person
- Keep it under 60 words total
- Return ONLY the summary text, no labels`,

    enhanceBullet: (bullet, role, company, jobDesc) => `
${ATS_SYSTEM_PROMPT}

CONTEXT:
Role: ${role}
Company: ${company}
Target Job Description: ${jobDesc || 'Not provided'}

ORIGINAL BULLET POINT: "${bullet}"

TASK: Rewrite this single bullet point to be more impactful for ATS and human readers.
Rules:
- Start with a powerful action verb (Engineered, Architected, Spearheaded, Optimized, etc.)
- If a metric/number exists in the original, preserve and highlight it
- If no metric exists, strengthen the impact language without fabricating numbers
- Keep it to ONE line (under 20 words)
- Return ONLY the rewritten bullet, nothing else`,

    enhanceAllBullets: (bullets, role, company, jobDesc) => `
${ATS_SYSTEM_PROMPT}

CONTEXT:
Role: ${role}
Company: ${company}
Target Job Description: ${jobDesc || 'Not provided'}

ORIGINAL BULLETS:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

TASK: Rewrite ALL these bullet points for maximum ATS impact and human readability.
Rules:
- Each bullet starts with a strong action verb
- Preserve any existing metrics/numbers exactly
- Strengthen impact language without fabricating data
- Keep each bullet under 20 words
- Return ONLY a numbered list (1. 2. 3. etc.), nothing else`,

    makeATSFriendly: (sectionContent, sectionType, jobDesc) => `
${ATS_SYSTEM_PROMPT}

TARGET JOB DESCRIPTION:
${jobDesc || 'General professional role'}

SECTION TYPE: ${sectionType}
CURRENT CONTENT:
${sectionContent}

TASK: Optimize this resume section for ATS systems.
- Inject relevant keywords from the job description naturally
- Ensure no special characters that break parsers
- Maintain factual accuracy — do not add or invent information
- Use standard section formatting
- Return ONLY the optimized section content`,

    rewriteForRole: (content, targetRole, jobDesc) => `
${ATS_SYSTEM_PROMPT}

TARGET ROLE: ${targetRole}
JOB DESCRIPTION:
${jobDesc || 'Not provided'}

CURRENT RESUME SECTION:
${content}

TASK: Rewrite this section to be maximally relevant for the target role.
- Highlight experiences and skills most relevant to the target role
- Use terminology from the job description naturally
- Maintain complete factual accuracy
- Return ONLY the rewritten content`,

    generateSkillsSuggestion: (data) => `
${ATS_SYSTEM_PROMPT}

USER PROFILE:
Target Role: ${data.targetRole}
Current Skills: ${(data.skills || []).join(', ')}
Experience: ${data.experienceSummary || 'Not provided'}
Job Description: ${data.jobDescription || 'Not provided'}

TASK: Suggest 8-12 additional relevant skills this person should consider adding IF THEY HAVE THEM.
- Only suggest skills that are realistic for their profile
- Focus on skills mentioned in the job description
- Include a mix of technical and soft skills
- Return as a simple comma-separated list, nothing else`,

    analyzeATS: (resumeData, jobDesc) => `
${ATS_SYSTEM_PROMPT}

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDesc || 'Not provided'}

TASK: Analyze this resume for ATS compatibility and return a JSON object with:
{
  "score": <number 0-100>,
  "keywordsMatched": [<list of matched keywords>],
  "keywordsMissing": [<top 5 missing keywords from job desc>],
  "improvements": [<3 specific, actionable improvements>],
  "strengths": [<3 specific strengths>]
}
Return ONLY valid JSON, nothing else.`
  };

  // ── CORE API CALL ─────────────────────────────────────────────────────────

  async function callAPI(prompt, opts = {}) {
    const apiKey = AppState.getApiKey();
    if (!apiKey) throw new Error('No API key configured. Please enter your OpenRouter API key.');

    const model = opts.model || AppState.getSelectedModel() || DEFAULT_MODEL;

    const payload = {
      model,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 800,
      stream: false
    };

    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'AI Resume Infrastructure'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err?.error?.message || `API error ${response.status}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty response from AI model');
    return content;
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────

  async function generateFullResume(formData) {
    const summaryPrompt = PROMPTS.generateSummary(formData);
    const summary = await callAPI(summaryPrompt, { temperature: 0.4, maxTokens: 200 });

    // Enhance all experience bullets in parallel
    const enhancedExperiences = await Promise.all(
      (formData.experiences || []).map(async (exp) => {
        if (!exp.bullets || exp.bullets.length === 0) return exp;
        const bulletPrompt = PROMPTS.enhanceAllBullets(
          exp.bullets, exp.role, exp.company, formData.jobDescription
        );
        try {
          const result = await callAPI(bulletPrompt, { temperature: 0.3, maxTokens: 600 });
          const lines = result.split('\n')
            .map(l => l.replace(/^\d+\.\s*/, '').trim())
            .filter(l => l.length > 0);
          return { ...exp, bullets: lines.slice(0, exp.bullets.length) };
        } catch {
          return exp; // fallback to original on error
        }
      })
    );

    return {
      ...formData,
      aiSummary: summary,
      experiences: enhancedExperiences
    };
  }

  async function enhanceBullet(bullet, role, company) {
    const jobDesc = AppState.get('jobDescription') || '';
    const prompt = PROMPTS.enhanceBullet(bullet, role, company, jobDesc);
    return await callAPI(prompt, { temperature: 0.35, maxTokens: 100 });
  }

  async function makeATSFriendly(sectionContent, sectionType) {
    const jobDesc = AppState.get('jobDescription') || '';
    const prompt = PROMPTS.makeATSFriendly(sectionContent, sectionType, jobDesc);
    return await callAPI(prompt, { temperature: 0.2, maxTokens: 600 });
  }

  async function rewriteForRole(content, sectionType) {
    const targetRole = AppState.get('targetRole') || '';
    const jobDesc = AppState.get('jobDescription') || '';
    const prompt = PROMPTS.rewriteForRole(content, targetRole, jobDesc);
    return await callAPI(prompt, { temperature: 0.35, maxTokens: 600 });
  }

  async function analyzeATSScore() {
    const state = AppState.getCurrentResume();
    const jobDesc = AppState.get('jobDescription') || '';
    const prompt = PROMPTS.analyzeATS(state, jobDesc);
    const result = await callAPI(prompt, { temperature: 0.1, maxTokens: 400 });
    try {
      const jsonStr = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch {
      return { score: 75, keywordsMatched: [], keywordsMissing: [], improvements: [], strengths: [] };
    }
  }

  async function suggestSkills() {
    const state = AppState.getCurrentResume();
    const prompt = PROMPTS.generateSkillsSuggestion({
      targetRole: state.targetRole,
      skills: state.skills,
      jobDescription: state.jobDescription,
      experienceSummary: (state.experiences || []).map(e => `${e.role} at ${e.company}`).join(', ')
    });
    const result = await callAPI(prompt, { temperature: 0.4, maxTokens: 200 });
    return result.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  async function testApiKey(key, model) {
    const payload = {
      model: model || DEFAULT_MODEL,
      messages: [{ role: 'user', content: 'Say "OK" and nothing else.' }],
      max_tokens: 5
    };
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'AI Resume Infrastructure'
      },
      body: JSON.stringify(payload)
    });
    return response.ok;
  }

  async function fetchAvailableModels(key) {
    try {
      const response = await fetch(`${OPENROUTER_BASE}/models`, {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      if (!response.ok) return getDefaultModels();
      const data = await response.json();
      return (data.data || [])
        .filter(m => m.id && (
          m.id.includes('gemini') || m.id.includes('gpt') ||
          m.id.includes('claude') || m.id.includes('llama') ||
          m.id.includes('mistral')
        ))
        .slice(0, 30)
        .map(m => ({ id: m.id, name: m.name || m.id }));
    } catch {
      return getDefaultModels();
    }
  }

  function getDefaultModels() {
    return [
      { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash (Fast & Free)' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro (Best Quality)' },
      { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
      { id: 'anthropic/claude-3-5-haiku', name: 'Claude 3.5 Haiku' },
      { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)' },
    ];
  }

  return {
    generateFullResume,
    enhanceBullet,
    makeATSFriendly,
    rewriteForRole,
    analyzeATSScore,
    suggestSkills,
    testApiKey,
    fetchAvailableModels,
    getDefaultModels
  };
})();
