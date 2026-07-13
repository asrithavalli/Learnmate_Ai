'use strict';

/* ── roadmapService.js ─────────────────────────────────────────
   Primary path: delegates to graniteService (IBM watsonx.ai).
   Fallback path: returns a deterministic static roadmap when
   Granite is unavailable (missing credentials, API error, etc.)
   so the app always responds — never 500s in production.
─────────────────────────────────────────────────────────────── */

const { generateWithGranite } = require('./graniteService');

/* ── Static fallback tables (unchanged from original) ───────── */

const SKILL_GAPS_BY_GOAL = {
  'Frontend Developer':        [{ label: 'React / Vue Frameworks', level: 85 }, { label: 'CSS Architecture', level: 70 }, { label: 'Web Accessibility (WCAG)', level: 60 }, { label: 'Browser DevTools', level: 40 }, { label: 'Performance Optimisation', level: 55 }],
  'Backend Developer':         [{ label: 'Node.js / Django / Spring', level: 85 }, { label: 'Database Design (SQL + NoSQL)', level: 70 }, { label: 'REST & GraphQL APIs', level: 65 }, { label: 'Authentication & Security', level: 50 }, { label: 'Server Deployment', level: 55 }],
  'Full-Stack Developer':      [{ label: 'React + Node.js Integration', level: 80 }, { label: 'Database Modelling', level: 70 }, { label: 'REST API Design', level: 65 }, { label: 'CI/CD Pipelines', level: 50 }, { label: 'Cloud Deployment', level: 45 }],
  'AI Engineer':               [{ label: 'Python & NumPy / Pandas', level: 80 }, { label: 'Machine Learning Fundamentals', level: 75 }, { label: 'Deep Learning (TensorFlow / PyTorch)', level: 70 }, { label: 'Model Deployment (FastAPI)', level: 60 }, { label: 'MLOps & Monitoring', level: 50 }],
  'Data Scientist':            [{ label: 'Statistical Analysis', level: 80 }, { label: 'Python Data Stack', level: 70 }, { label: 'Data Visualisation', level: 60 }, { label: 'Machine Learning (Scikit-learn)', level: 65 }, { label: 'SQL for Analytics', level: 50 }],
  'Machine Learning Engineer': [{ label: 'ML Algorithms & Mathematics', level: 85 }, { label: 'Feature Engineering', level: 70 }, { label: 'Model Training & Evaluation', level: 65 }, { label: 'Distributed Training (Spark)', level: 55 }, { label: 'ML Pipeline Orchestration', level: 50 }],
  'DevOps Engineer':           [{ label: 'Linux & Shell Scripting', level: 80 }, { label: 'Docker & Kubernetes', level: 75 }, { label: 'CI/CD Tools (GitHub Actions)', level: 65 }, { label: 'Infrastructure as Code (Terraform)', level: 60 }, { label: 'Cloud Platforms (AWS / GCP)', level: 55 }],
  'Cybersecurity Analyst':     [{ label: 'Networking Fundamentals (TCP/IP)', level: 80 }, { label: 'Ethical Hacking & Penetration Testing', level: 75 }, { label: 'SIEM & Log Analysis', level: 60 }, { label: 'Cryptography Basics', level: 55 }, { label: 'Incident Response Procedures', level: 50 }],
  'Mobile App Developer':      [{ label: 'React Native / Flutter', level: 80 }, { label: 'State Management (Redux / Riverpod)', level: 70 }, { label: 'App Store Submission Process', level: 55 }, { label: 'Mobile UI/UX Principles', level: 60 }, { label: 'Push Notifications & APIs', level: 50 }],
  'Cloud Architect':           [{ label: 'Cloud Provider Core Services', level: 80 }, { label: 'Serverless Architecture', level: 70 }, { label: 'Cost Optimisation Strategies', level: 60 }, { label: 'High Availability & Fault Tolerance', level: 65 }, { label: 'Security & Compliance in the Cloud', level: 55 }],
};

const RECOMMENDED_SKILLS_BY_GOAL = {
  'Frontend Developer':        [{ name: 'HTML5 & CSS3', tag: 'Foundation', priority: 'High' }, { name: 'JavaScript (ES6+)', tag: 'Language', priority: 'High' }, { name: 'React.js', tag: 'Framework', priority: 'High' }, { name: 'Tailwind CSS', tag: 'Styling', priority: 'Medium' }, { name: 'TypeScript', tag: 'Language', priority: 'Medium' }, { name: 'Webpack / Vite', tag: 'Tooling', priority: 'Low' }],
  'Backend Developer':         [{ name: 'Node.js / Express', tag: 'Runtime', priority: 'High' }, { name: 'PostgreSQL / MongoDB', tag: 'Database', priority: 'High' }, { name: 'REST API Design', tag: 'API', priority: 'High' }, { name: 'JWT Authentication', tag: 'Security', priority: 'Medium' }, { name: 'Docker', tag: 'DevOps', priority: 'Medium' }, { name: 'GraphQL', tag: 'API', priority: 'Low' }],
  'Full-Stack Developer':      [{ name: 'React.js + Node.js', tag: 'Stack', priority: 'High' }, { name: 'PostgreSQL', tag: 'Database', priority: 'High' }, { name: 'REST APIs', tag: 'API', priority: 'High' }, { name: 'Docker & CI/CD', tag: 'DevOps', priority: 'Medium' }, { name: 'TypeScript', tag: 'Language', priority: 'Medium' }, { name: 'Cloud Hosting', tag: 'Cloud', priority: 'Low' }],
  'AI Engineer':               [{ name: 'Python', tag: 'Language', priority: 'High' }, { name: 'TensorFlow / PyTorch', tag: 'Framework', priority: 'High' }, { name: 'Mathematics for ML', tag: 'Foundation', priority: 'High' }, { name: 'FastAPI', tag: 'Deployment', priority: 'Medium' }, { name: 'Docker', tag: 'DevOps', priority: 'Medium' }, { name: 'Kubernetes for ML', tag: 'MLOps', priority: 'Low' }],
  'Data Scientist':            [{ name: 'Python (Pandas, NumPy)', tag: 'Language', priority: 'High' }, { name: 'Scikit-learn', tag: 'ML Library', priority: 'High' }, { name: 'SQL', tag: 'Database', priority: 'High' }, { name: 'Tableau / Power BI', tag: 'Viz', priority: 'Medium' }, { name: 'Statistics & Probability', tag: 'Foundation', priority: 'Medium' }, { name: 'Apache Spark', tag: 'Big Data', priority: 'Low' }],
  'Machine Learning Engineer': [{ name: 'Python', tag: 'Language', priority: 'High' }, { name: 'Scikit-learn / PyTorch', tag: 'Framework', priority: 'High' }, { name: 'Feature Engineering', tag: 'ML', priority: 'High' }, { name: 'MLflow', tag: 'MLOps', priority: 'Medium' }, { name: 'Docker', tag: 'DevOps', priority: 'Medium' }, { name: 'Kubeflow', tag: 'MLOps', priority: 'Low' }],
  'DevOps Engineer':           [{ name: 'Linux & Bash', tag: 'OS', priority: 'High' }, { name: 'Docker & Kubernetes', tag: 'Containers', priority: 'High' }, { name: 'GitHub Actions', tag: 'CI/CD', priority: 'High' }, { name: 'Terraform', tag: 'IaC', priority: 'Medium' }, { name: 'Prometheus & Grafana', tag: 'Monitoring', priority: 'Medium' }, { name: 'AWS / GCP Core Services', tag: 'Cloud', priority: 'Low' }],
  'Cybersecurity Analyst':     [{ name: 'Networking Fundamentals', tag: 'Foundation', priority: 'High' }, { name: 'Kali Linux Tools', tag: 'Tooling', priority: 'High' }, { name: 'OWASP Top 10', tag: 'Security', priority: 'High' }, { name: 'Wireshark / Nmap', tag: 'Tools', priority: 'Medium' }, { name: 'SIEM Platforms', tag: 'Monitoring', priority: 'Medium' }, { name: 'CompTIA Security+', tag: 'Cert', priority: 'Low' }],
  'Mobile App Developer':      [{ name: 'React Native / Flutter', tag: 'Framework', priority: 'High' }, { name: 'JavaScript / Dart', tag: 'Language', priority: 'High' }, { name: 'REST APIs & Firebase', tag: 'Backend', priority: 'High' }, { name: 'State Management', tag: 'Pattern', priority: 'Medium' }, { name: 'App Store Guidelines', tag: 'Deployment', priority: 'Medium' }, { name: 'Native Device APIs', tag: 'Platform', priority: 'Low' }],
  'Cloud Architect':           [{ name: 'AWS / Azure Core', tag: 'Cloud', priority: 'High' }, { name: 'Terraform / Pulumi', tag: 'IaC', priority: 'High' }, { name: 'Microservices Design', tag: 'Architecture', priority: 'High' }, { name: 'Serverless (Lambda)', tag: 'Cloud', priority: 'Medium' }, { name: 'Cost & FinOps', tag: 'Business', priority: 'Medium' }, { name: 'Zero Trust Security', tag: 'Security', priority: 'Low' }],
};

const RESOURCES = [
  { title: 'freeCodeCamp',     url: 'https://www.freecodecamp.org',   tag: 'Interactive', icon: '💻' },
  { title: 'CS50 by Harvard',  url: 'https://cs50.harvard.edu',       tag: 'Course',      icon: '🎓' },
  { title: 'The Odin Project', url: 'https://www.theodinproject.com', tag: 'Curriculum',  icon: '⚙️' },
  { title: 'MDN Web Docs',     url: 'https://developer.mozilla.org',  tag: 'Reference',   icon: '📄' },
  { title: 'LeetCode',         url: 'https://leetcode.com',           tag: 'Practice',    icon: '🧩' },
  { title: 'Roadmap.sh',       url: 'https://roadmap.sh',             tag: 'Roadmap',     icon: '🗺️' },
];

const DAILY_TIPS = [
  { icon: '🍅', tip: 'Use the Pomodoro Technique — 25 min focus, 5 min break. Repeat 4×, then take a longer break.' },
  { icon: '📓', tip: 'Keep a daily learning log. Write 3 things you learned today in plain English.' },
  { icon: '🔁', tip: "Practice spaced repetition. Revisit yesterday's material for 10 minutes before starting new content." },
  { icon: '🤝', tip: 'Join a study group or Discord server — teaching others is the fastest way to learn.' },
  { icon: '🚫', tip: 'Avoid tutorial hell. After one tutorial, build something without following along.' },
  { icon: '🌙', tip: "Sleep 7–8 hours. Memory consolidation happens during sleep — it's non-negotiable for retention." },
];

function buildWeeklyPlan(goal, dailyHours) {
  const h = `${dailyHours} hr${dailyHours > 1 ? 's' : ''}/day`;
  return [
    { week: 1, theme: 'Foundations',      color: 'indigo', tasks: ['Review core programming concepts & syntax', 'Complete a beginner crash course (freeCodeCamp / CS50)', `Set up your local dev environment for ${goal}`, 'Push your first repo to GitHub'] },
    { week: 2, theme: 'Core Skills',       color: 'violet', tasks: [`Build your first ${goal} mini-project (${h})`, 'Study data structures: arrays, objects, stacks, queues', 'Complete 10 LeetCode Easy problems', 'Read 2 articles from dev.to / Medium on your stack'] },
    { week: 3, theme: 'Applied Learning',  color: 'blue',   tasks: ['Build a full CRUD project using your primary framework', 'Add user authentication to your project', 'Write unit tests for at least 3 components / functions', 'Study system design basics (YouTube: Gaurav Sen)'] },
    { week: 4, theme: 'Portfolio & Review',color: 'teal',   tasks: ['Polish & deploy your project (Vercel / Netlify / Render)', 'Write a README with screenshots & live link', 'Record a 2-min walkthrough for LinkedIn', 'Apply to 3 internships or open-source projects'] },
  ];
}

function buildProjects(goal) {
  const base = [
    { title: 'Personal Portfolio Site', stack: 'HTML · CSS · JS',          difficulty: 'Beginner',     desc: 'Showcase your skills with a clean, responsive website.' },
    { title: 'To-Do List App',          stack: 'React / Vue',               difficulty: 'Beginner',     desc: 'CRUD operations, local storage persistence, component architecture.' },
    { title: 'Weather Dashboard',       stack: 'JS · REST API · CSS Grid',  difficulty: 'Intermediate', desc: 'Fetch live weather data, display forecasts, practice async JS.' },
    { title: 'Blog / Notes App',        stack: 'Node · Express · MongoDB',  difficulty: 'Intermediate', desc: 'Full-stack project: authentication, CRUD, database.' },
  ];
  const extras = {
    'AI Engineer':               { title: 'Sentiment Analyser',  stack: 'Python · NLTK · Flask',       difficulty: 'Intermediate', desc: 'Classify tweet sentiment using a trained ML model.' },
    'Data Scientist':            { title: 'EDA Dashboard',       stack: 'Python · Pandas · Streamlit', difficulty: 'Intermediate', desc: 'Explore a public dataset and surface key insights visually.' },
    'Machine Learning Engineer': { title: 'Image Classifier',    stack: 'Python · PyTorch · FastAPI',  difficulty: 'Intermediate', desc: 'Train a CNN on CIFAR-10 and serve predictions via API.' },
    'DevOps Engineer':           { title: 'CI/CD Pipeline Demo', stack: 'Docker · GitHub Actions',     difficulty: 'Intermediate', desc: 'Automate build, test, and deploy for a Node.js app.' },
    'Cybersecurity Analyst':     { title: 'Port Scanner',        stack: 'Python · Socket',             difficulty: 'Beginner',     desc: 'Build a lightweight tool to scan open ports on a host.' },
    'Mobile App Developer':      { title: 'Habit Tracker App',   stack: 'React Native · AsyncStorage', difficulty: 'Intermediate', desc: 'Track daily habits with streaks, notifications, and local storage.' },
    'Cloud Architect':           { title: 'Serverless API',      stack: 'AWS Lambda · API Gateway',    difficulty: 'Intermediate', desc: 'Deploy a cost-optimised serverless REST API on AWS.' },
  };
  if (extras[goal]) base.push(extras[goal]);
  return base;
}

function buildStaticResumeAnalysis(careerGoal, knownSkills) {
  return {
    summary: `Your profile highlights an interest in ${careerGoal}. You have configured skills like: ${knownSkills.length > 0 ? knownSkills.join(', ') : 'none listed yet'}. This analysis suggests areas to consolidate key engineering capabilities to improve overall employability.`,
    techSkills: knownSkills.length > 0 ? knownSkills : ['Basic Programming', 'Git'],
    softSkills: ['Analytical Thinking', 'Problem Solving', 'Effective Communication'],
    missingSkills: (SKILL_GAPS_BY_GOAL[careerGoal] ?? SKILL_GAPS_BY_GOAL['Full-Stack Developer']).slice(0, 3).map(g => g.label),
    areasToImprove: [
      'Focus on practical, hands-on programming projects to build portfolio evidence.',
      'Enhance familiarity with professional developer tools like command-line git and unit testing libraries.',
      'Study industry-level software architecture design principles.'
    ],
    certifications: [
      `AWS / Google Cloud Certified Associate Developer (highly recommended for ${careerGoal})`,
      `Advanced Certificate in Data Structures & Algorithms`
    ],
    projects: [
      { title: `Full-Stack Personal Portfolio`, stack: 'React · Node.js · MongoDB', difficulty: 'Intermediate', desc: 'Build and deploy a comprehensive showcase of your skills, resume, and live projects.' },
      { title: `Target API Integration Client`, stack: 'Python · REST API', difficulty: 'Beginner', desc: 'Interact with a third-party API service (e.g. GitHub or Weather API) to practice data fetch operations.' }
    ],
    readinessScore: knownSkills.length > 3 ? 75 : 55
  };
}

function buildStaticRoadmap({ name, skills, careerGoal, learningHours, resumeText }) {
  const knownSkills = String(skills).split(',').map((s) => s.trim()).filter(Boolean);
  const hours       = Number(learningHours);
  const base = {
    name,
    careerGoal,
    learningHours:     hours,
    knownSkills,
    generatedAt:       new Date().toISOString(),
    generatedBy:       'static',
    skillGaps:         SKILL_GAPS_BY_GOAL[careerGoal]         ?? SKILL_GAPS_BY_GOAL['Full-Stack Developer'],
    recommendedSkills: RECOMMENDED_SKILLS_BY_GOAL[careerGoal] ?? RECOMMENDED_SKILLS_BY_GOAL['Full-Stack Developer'],
    weeklyPlan:        buildWeeklyPlan(careerGoal, hours),
    resources:         RESOURCES,
    projects:          buildProjects(careerGoal),
    dailyTips:         DAILY_TIPS,
  };

  if (resumeText) {
    base.resumeAnalysis = buildStaticResumeAnalysis(careerGoal, knownSkills);
  }

  return base;
}

/* ── Public API ────────────────────────────────────────────── */

/**
 * buildRoadmap — tries Granite first, falls back to static data.
 * @returns {Promise<object>}
 */
async function buildRoadmap(input) {
  const hasCredentials =
    process.env.WATSONX_API_KEY &&
    process.env.WATSONX_API_KEY !== 'your_ibm_cloud_api_key_here' &&
    process.env.WATSONX_PROJECT_ID &&
    process.env.WATSONX_PROJECT_ID !== 'your_watsonx_project_id_here';

  if (hasCredentials) {
    try {
      console.log('[Granite] Generating roadmap for:', input.careerGoal);
      const result = await generateWithGranite(input);
      console.log('[Granite] Roadmap generated successfully.');
      return result;
    } catch (err) {
      console.warn('[Granite] API call failed — using static fallback.', err.message);
    }
  } else {
    console.log('[Roadmap] watsonx credentials not configured — using static fallback.');
  }

  return buildStaticRoadmap(input);
}

module.exports = { buildRoadmap };
