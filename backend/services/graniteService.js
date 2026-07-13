'use strict';

/* ── graniteService.js ─────────────────────────────────────────
   Calls IBM watsonx.ai (ibm/granite-3-8b-instruct) to generate
   a personalised learning roadmap JSON.

   Exported:  generateWithGranite({ name, skills, careerGoal, learningHours })
              → Promise<RoadmapObject>

   If the API call fails or the response cannot be parsed, throws
   so the caller can fall back to the static service.
─────────────────────────────────────────────────────────────── */

const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');

/* ── Singleton client ──────────────────────────────────────── */
let _client = null;

function getClient() {
  if (_client) return _client;

  const apiKey     = process.env.WATSONX_API_KEY;
  const serviceUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

  if (!apiKey) throw new Error('WATSONX_API_KEY is not set in environment variables.');

  _client = WatsonXAI.newInstance({
    version:    '2024-05-31',
    serviceUrl,
  });

  return _client;
}

/* ── Prompt builder ────────────────────────────────────────── */
function buildPrompt({ name, skills, careerGoal, learningHours, resumeText }) {
  let prompt = `You are an expert learning-path advisor. Given a student's profile, produce a personalised learning roadmap as a single valid JSON object — no markdown fences, no prose before or after, just the raw JSON.

Student profile:
- Name: ${name}
- Known skills: ${skills || 'none listed'}
- Career goal: ${careerGoal}
- Daily learning time: ${learningHours} hour(s)
`;

  if (resumeText) {
    prompt += `- Uploaded resume content: ${resumeText}\n`;
  }

  prompt += `
Return exactly this JSON shape (fill every field with real, specific content for the career goal above):

{
  "skillGaps": [
    { "label": "<topic>", "level": <integer 10-90> }
  ],
  "recommendedSkills": [
    { "name": "<skill>", "tag": "<category>", "priority": "High"|"Medium"|"Low" }
  ],
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "<theme>",
      "color": "indigo"|"violet"|"blue"|"teal",
      "tasks": ["<task>", "<task>", "<task>", "<task>"]
    }
  ],
  "resources": [
    { "title": "<name>", "url": "<https url>", "tag": "<type>", "icon": "<single emoji>" }
  ],
  "projects": [
    { "title": "<name>", "stack": "<tech stack>", "difficulty": "Beginner"|"Intermediate"|"Advanced", "desc": "<one sentence>" }
  ],
  "dailyTips": [
    { "icon": "<emoji>", "tip": "<actionable tip>" }
  ]`;

  if (resumeText) {
    prompt += `,
  "resumeAnalysis": {
    "summary": "<summary of resume>",
    "techSkills": ["<detected technical skill 1>", "<detected technical skill 2>"],
    "softSkills": ["<detected soft skill 1>", "<detected soft skill 2>"],
    "missingSkills": ["<missing skill 1 required for career goal>", "<missing skill 2 required for career goal>"],
    "areasToImprove": ["<actionable improvements to resume/skills>", "<another improvement>"],
    "certifications": ["<recommended industry certification 1>", "<recommended industry certification 2>"],
    "projects": [
      { "title": "<suggested project name>", "stack": "<tech stack>", "difficulty": "Beginner"|"Intermediate", "desc": "<one sentence project description>" }
    ],
    "readinessScore": <integer score 0-100 indicating career readiness for this goal>
  }`;
  }

  prompt += `
}

Rules:
- skillGaps: exactly 5 items, levels reflect how much still needs to be learned (higher = bigger gap)
- recommendedSkills: exactly 6 items, ordered High → Medium → Low priority
- weeklyPlan: exactly 4 weeks (week 1-4), each with exactly 4 tasks tailored to ${learningHours} hr/day
- resources: exactly 6 items with real, working URLs
- projects: exactly 4-5 items relevant to ${careerGoal}
- dailyTips: exactly 6 items`;

  if (resumeText) {
    prompt += `
- resumeAnalysis: Extract summary, skills, missing skills, improvements, and certifications.
- resumeAnalysis.projects: Provide exactly 2 beginner/intermediate projects that align with the user's resume and fill their gaps.
- resumeAnalysis.readinessScore: A realistic score from 0 to 100 based on their experience and skills compared to target career goal.`;
  }

  prompt += `
- Output ONLY the JSON object. No explanation, no markdown.`;

  return prompt;
}

/* ── JSON extractor — handles models that wrap output in prose ─ */
function extractJSON(raw) {
  // Fast path: the whole response is already valid JSON
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) { /* fall through */ }

  // Try to find the outermost {...} block
  const start = trimmed.indexOf('{');
  const end   = trimmed.lastIndexOf('}');
  if (start !== -1 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  throw new SyntaxError('No JSON object found in Granite response');
}

/* ── Shape validator — ensures required keys are present ───── */
function validateShape(obj) {
  const required = ['skillGaps', 'recommendedSkills', 'weeklyPlan', 'resources', 'projects', 'dailyTips'];
  for (const key of required) {
    if (!Array.isArray(obj[key]) || obj[key].length === 0) {
      throw new Error(`Granite response missing or empty field: "${key}"`);
    }
  }
}

/* ── Main export ───────────────────────────────────────────── */
async function generateWithGranite({ name, skills, careerGoal, learningHours, resumeText }) {
  const client    = getClient();
  const projectId = process.env.WATSONX_PROJECT_ID;

  if (!projectId) throw new Error('WATSONX_PROJECT_ID is not set in environment variables.');

  const prompt = buildPrompt({ name, skills, careerGoal, learningHours, resumeText });

  const response = await client.generateText({
    modelId:   'ibm/granite-3-8b-instruct',
    projectId,
    input:     prompt,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens:  2048,
      min_new_tokens:  200,
      stop_sequences:  [],
      repetition_penalty: 1.05,
    },
  });

  const raw = response?.result?.results?.[0]?.generated_text;
  if (!raw) throw new Error('Granite returned an empty response body.');

  const parsed = extractJSON(raw);
  validateShape(parsed);

  /* Attach meta fields the frontend expects */
  return {
    name,
    careerGoal,
    learningHours,
    knownSkills: String(skills).split(',').map((s) => s.trim()).filter(Boolean),
    generatedAt: new Date().toISOString(),
    generatedBy: 'granite',
    ...parsed,
  };
}

module.exports = { generateWithGranite };
