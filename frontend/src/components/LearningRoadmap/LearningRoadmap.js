import React from 'react';
import './LearningRoadmap.css';

/* ── Mock AI response generator ────────────────────────────────────────────
   In production, replace `buildRoadmapData` with a real API/AI call that
   receives the profile and returns the same shape.
────────────────────────────────────────────────────────────────────────── */
function buildRoadmapData(profile) {
  const goal        = profile?.careerGoal  || 'Software Developer';
  const skills      = profile?.skills      || '';
  const dailyHours  = profile?.dailyTime   || 2;
  const name        = profile?.fullName    || 'Learner';

  const knownSkills = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    goal,
    name,
    dailyHours,
    knownSkills,

    skillGaps: [
      { label: 'Data Structures & Algorithms',   level: 85 },
      { label: `Core ${goal} Frameworks`,         level: 70 },
      { label: 'System Design Fundamentals',      level: 60 },
      { label: 'Version Control (Git & GitHub)',  level: 40 },
      { label: 'Testing & Debugging Best Practices', level: 55 },
    ],

    recommendedSkills: [
      { name: 'Python / JavaScript',   tag: 'Language',   priority: 'High' },
      { name: 'React / Node.js',        tag: 'Framework',  priority: 'High' },
      { name: 'SQL & NoSQL Databases',  tag: 'Database',   priority: 'Medium' },
      { name: 'REST API Design',        tag: 'Backend',    priority: 'Medium' },
      { name: 'Docker & CI/CD',         tag: 'DevOps',     priority: 'Low' },
      { name: 'Cloud Basics (AWS/GCP)', tag: 'Cloud',      priority: 'Low' },
    ],

    weeklyPlan: [
      {
        week: 1,
        theme: 'Foundations',
        color: 'indigo',
        tasks: [
          'Review core programming concepts & syntax',
          'Complete a beginner crash course (freeCodeCamp / CS50)',
          'Set up local dev environment & VS Code',
          'Push your first repo to GitHub',
        ],
      },
      {
        week: 2,
        theme: 'Core Skills',
        color: 'violet',
        tasks: [
          `Build your first ${goal} mini-project`,
          'Study data structures: arrays, objects, stacks, queues',
          'Complete 10 LeetCode Easy problems',
          'Read 2 articles from dev.to or Medium on the topic',
        ],
      },
      {
        week: 3,
        theme: 'Applied Learning',
        color: 'blue',
        tasks: [
          'Build a CRUD project using a framework (React/Node/etc.)',
          'Add user authentication to your project',
          'Write unit tests for at least 3 components/functions',
          'Study system design basics (YouTube: Gaurav Sen)',
        ],
      },
      {
        week: 4,
        theme: 'Portfolio & Review',
        color: 'teal',
        tasks: [
          'Polish & deploy your project to Vercel / Netlify / Render',
          'Write a README with screenshots & live link',
          'Record a 2-min walkthrough video for LinkedIn',
          'Apply to 3 internships or open-source projects',
        ],
      },
    ],

    resources: [
      { title: 'freeCodeCamp',     url: 'https://www.freecodecamp.org',  tag: 'Interactive', icon: '💻' },
      { title: 'CS50 by Harvard',  url: 'https://cs50.harvard.edu',      tag: 'Course',      icon: '🎓' },
      { title: 'The Odin Project', url: 'https://www.theodinproject.com',tag: 'Curriculum',  icon: '⚙️' },
      { title: 'MDN Web Docs',     url: 'https://developer.mozilla.org', tag: 'Reference',   icon: '📄' },
      { title: 'LeetCode',         url: 'https://leetcode.com',          tag: 'Practice',    icon: '🧩' },
      { title: 'Roadmap.sh',       url: 'https://roadmap.sh',            tag: 'Roadmap',     icon: '🗺️' },
    ],

    projects: [
      { title: 'Personal Portfolio Site', stack: 'HTML · CSS · JS',          difficulty: 'Beginner',      desc: 'Showcase your skills and projects with a clean, responsive website.' },
      { title: 'To-Do List App',          stack: 'React / Vue',              difficulty: 'Beginner',      desc: 'CRUD operations, local storage persistence, and component-based architecture.' },
      { title: 'Weather Dashboard',       stack: 'JS · REST API · CSS Grid', difficulty: 'Intermediate',  desc: 'Fetch live weather data, display forecasts, and practice async JavaScript.' },
      { title: 'Blog / Notes App',        stack: 'Node · Express · MongoDB', difficulty: 'Intermediate',  desc: 'Full-stack project with authentication, CRUD, and a database connection.' },
    ],

    dailyTips: [
      { icon: '🍅', tip: 'Use the Pomodoro Technique — 25 min focus, 5 min break. Repeat 4×, then take a longer break.' },
      { icon: '📓', tip: 'Keep a daily learning log. Write 3 things you learned today in plain English.' },
      { icon: '🔁', tip: 'Practice spaced repetition. Revisit yesterday\'s material for 10 minutes before starting new content.' },
      { icon: '🤝', tip: 'Join a study group or Discord server for your tech stack — teaching others is the fastest way to learn.' },
      { icon: '🚫', tip: 'Avoid tutorial hell. After one tutorial, immediately build something *without* following along.' },
      { icon: '🌙', tip: 'Sleep 7–8 hours. Memory consolidation happens during sleep — it\'s non-negotiable for retention.' },
    ],
  };
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function SectionCard({ icon, title, accent, children }) {
  return (
    <div className={`lr-card lr-card--${accent}`}>
      <header className="lr-card__header">
        <span className="lr-card__icon" aria-hidden="true">{icon}</span>
        <h3 className="lr-card__title">{title}</h3>
      </header>
      <div className="lr-card__body">{children}</div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const map = { High: 'high', Medium: 'medium', Low: 'low' };
  return <span className={`lr-badge lr-badge--${map[priority]}`}>{priority}</span>;
}

function ProgressBar({ label, level }) {
  return (
    <div className="lr-gap-row">
      <div className="lr-gap-row__meta">
        <span className="lr-gap-row__label">{label}</span>
        <span className="lr-gap-row__pct">{level}%</span>
      </div>
      <div className="lr-gap-row__track" role="progressbar" aria-valuenow={level} aria-valuemin={0} aria-valuemax={100}>
        <div className="lr-gap-row__fill" style={{ width: `${level}%` }} />
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */

function LearningRoadmap({ profile, roadmap }) {
  // Use live API data when available; fall back to local mock for dev/preview
  const raw  = roadmap ?? buildRoadmapData(profile);

  // Normalise field names: backend uses `name`/`careerGoal`/`learningHours`/`knownSkills`
  // while the local mock already uses `name`/`goal`/`dailyHours`/`knownSkills`
  const data = roadmap
    ? {
        ...raw,
        goal:       raw.careerGoal,
        dailyHours: raw.learningHours,
      }
    : raw;

  return (
    <section className="lr-section" id="roadmap">
      {/* ── Page header ── */}
      <div className="lr-page-header">
        <span className="lr-page-header__eyebrow">AI-Generated for {data.name}</span>
        <h2 className="lr-page-header__title">
          Your <span className="lr-page-header__highlight">{data.goal}</span> Roadmap
        </h2>
        <p className="lr-page-header__meta">
          Based on your profile · {data.dailyHours} hr{Number(data.dailyHours) > 1 ? 's' : ''}/day · 4-week plan
        </p>
      </div>

      {/* ── Grid of cards ── */}
      <div className="lr-grid">

        {data.resumeAnalysis && (
          <div className="lr-card lr-card--indigo" style={{ gridColumn: '1 / -1', marginBottom: '1.5rem' }}>
            <header className="lr-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span className="lr-card__icon" aria-hidden="true">📄</span>
                <h3 className="lr-card__title">AI Resume Feedback & Career Readiness</h3>
              </div>
              <div className="lr-readiness-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eef2ff', padding: '0.4rem 0.95rem', borderRadius: '999px', border: '1px solid #c7d2fe' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#4f46e5' }}>Readiness Score:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#4f46e5' }}>{data.resumeAnalysis.readinessScore}/100</span>
              </div>
            </header>
            <div className="lr-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem 2.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Resume Summary</h4>
                <p className="lr-card__intro" style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{data.resumeAnalysis.summary}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--color-text)' }}>🛠️ Technical Skills Detected</h4>
                  <div className="lr-chip-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {data.resumeAnalysis.techSkills && data.resumeAnalysis.techSkills.map(s => (
                      <span key={s} className="lr-chip lr-chip--blue" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: '600' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--color-text)' }}>🤝 Soft Skills Detected</h4>
                  <div className="lr-chip-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {data.resumeAnalysis.softSkills && data.resumeAnalysis.softSkills.map(s => (
                      <span key={s} className="lr-chip lr-chip--purple" style={{ background: '#faf5ff', color: '#6b21a8', border: '1px solid #e9d5ff', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: '600' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--color-text)' }}>🚨 Missing Skills for {data.goal}</h4>
                  <div className="lr-chip-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {data.resumeAnalysis.missingSkills && data.resumeAnalysis.missingSkills.map(s => (
                      <span key={s} className="lr-chip lr-chip--orange" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: '600' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--color-text)' }}>🎓 Recommended Certifications</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--color-muted)', lineHeight: '1.5' }}>
                    {data.resumeAnalysis.certifications && data.resumeAnalysis.certifications.map(c => (
                      <li key={c} style={{ marginBottom: '0.25rem' }}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--color-text)' }}>📈 Areas to Improve</h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--color-muted)', lineHeight: '1.6' }}>
                  {data.resumeAnalysis.areasToImprove && data.resumeAnalysis.areasToImprove.map(a => (
                    <li key={a} style={{ marginBottom: '0.35rem' }}>{a}</li>
                  ))}
                </ul>
              </div>

              {data.resumeAnalysis.projects && data.resumeAnalysis.projects.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--color-text)' }}>💡 Suggested Projects (Resume-Aligned)</h4>
                  <div className="lr-projects-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                    {data.resumeAnalysis.projects.map((p) => (
                      <div key={p.title} className="lr-project" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fafbff' }}>
                        <div className="lr-project__top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span className="lr-project__title" style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-text)' }}>{p.title}</span>
                          <span className={`lr-badge lr-badge--diff-${p.difficulty.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>{p.difficulty}</span>
                        </div>
                        <p className="lr-project__desc" style={{ margin: '0 0 0.5rem 0', fontSize: '0.82rem', color: 'var(--color-muted)' }}>{p.desc}</p>
                        <p className="lr-project__stack" style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                          <span className="lr-project__stack-label" style={{ fontWeight: '700' }}>Stack:</span> {p.stack}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1 ── Skill Gap Analysis */}
        <SectionCard icon="🔍" title="Skill Gap Analysis" accent="indigo">
          <p className="lr-card__intro">
            Areas where focused practice will unlock the fastest growth toward <strong>{data.goal}</strong>.
          </p>
          <div className="lr-gap-list">
            {data.skillGaps.map((g) => (
              <ProgressBar key={g.label} label={g.label} level={g.level} />
            ))}
          </div>
          {data.knownSkills.length > 0 && (
            <div className="lr-known-skills">
              <p className="lr-known-skills__label">✅ Skills you already have:</p>
              <ul className="lr-chip-list">
                {data.knownSkills.map((s) => (
                  <li key={s} className="lr-chip lr-chip--green">{s}</li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        {/* 2 ── Recommended Skills */}
        <SectionCard icon="🎯" title="Recommended Skills" accent="violet">
          <p className="lr-card__intro">
            Master these skills in order of priority to become a job-ready <strong>{data.goal}</strong>.
          </p>
          <ul className="lr-skills-list">
            {data.recommendedSkills.map((sk) => (
              <li key={sk.name} className="lr-skills-list__item">
                <div className="lr-skills-list__left">
                  <span className="lr-skills-list__name">{sk.name}</span>
                  <span className="lr-chip lr-chip--purple">{sk.tag}</span>
                </div>
                <PriorityBadge priority={sk.priority} />
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* 3 ── 4-Week Learning Plan (full width) */}
        <SectionCard icon="📅" title="4-Week Learning Plan" accent="blue">
          <p className="lr-card__intro">
            A day-by-day structured plan built around your{' '}
            <strong>{data.dailyHours} hr{Number(data.dailyHours) > 1 ? 's' : ''}/day</strong> commitment.
          </p>
          <div className="lr-weeks-grid">
            {data.weeklyPlan.map((w) => (
              <div key={w.week} className={`lr-week lr-week--${w.color}`}>
                <div className="lr-week__header">
                  <span className="lr-week__label">Week {w.week}</span>
                  <span className="lr-week__theme">{w.theme}</span>
                </div>
                <ul className="lr-week__tasks">
                  {w.tasks.map((t) => (
                    <li key={t} className="lr-week__task">
                      <span className="lr-week__check" aria-hidden="true">›</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 4 ── Free Learning Resources */}
        <SectionCard icon="📚" title="Free Learning Resources" accent="teal">
          <p className="lr-card__intro">Hand-picked platforms to take you from zero to job-ready — 100% free.</p>
          <div className="lr-resources-grid">
            {data.resources.map((r) => (
              <a
                key={r.title}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="lr-resource-card"
              >
                <span className="lr-resource-card__icon" aria-hidden="true">{r.icon}</span>
                <span className="lr-resource-card__title">{r.title}</span>
                <span className="lr-chip lr-chip--gray">{r.tag}</span>
              </a>
            ))}
          </div>
        </SectionCard>

        {/* 5 ── Beginner Projects */}
        <SectionCard icon="🛠️" title="Beginner Projects" accent="orange">
          <p className="lr-card__intro">Build these projects to cement your skills and grow your portfolio.</p>
          <div className="lr-projects-list">
            {data.projects.map((p) => (
              <div key={p.title} className="lr-project">
                <div className="lr-project__top">
                  <span className="lr-project__title">{p.title}</span>
                  <span className={`lr-badge lr-badge--diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                </div>
                <p className="lr-project__desc">{p.desc}</p>
                <p className="lr-project__stack">
                  <span className="lr-project__stack-label">Stack:</span> {p.stack}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 6 ── Daily Learning Tips */}
        <SectionCard icon="💡" title="Daily Learning Tips" accent="green">
          <p className="lr-card__intro">Small daily habits that compound into enormous long-term results.</p>
          <ul className="lr-tips-list">
            {data.dailyTips.map((t) => (
              <li key={t.tip} className="lr-tip">
                <span className="lr-tip__icon" aria-hidden="true">{t.icon}</span>
                <p className="lr-tip__text">{t.tip}</p>
              </li>
            ))}
          </ul>
        </SectionCard>

      </div>
    </section>
  );
}

export default LearningRoadmap;
