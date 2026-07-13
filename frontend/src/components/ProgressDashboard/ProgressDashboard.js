import React, { useState } from 'react';
import { useProfile } from '../../context/ProfileContext';
import './ProgressDashboard.css';

/* ── Dummy Data ─────────────────────────────────────────────────────────── */
const DUMMY_DATA = {
  learner: {
    name:           'Arjun Sharma',
    goal:           'Frontend Developer',
    avatarInitials: 'AS',
    totalWeeks:     8,
  },

  overallProgress: 62, // %

  stats: [
    { id: 'progress', icon: '📈', label: 'Overall Progress',    value: 62,  total: 100, unit: '%',          color: 'indigo' },
    { id: 'skills',   icon: '✅', label: 'Completed Skills',    value: 9,   total: 15,  unit: 'skills',      color: 'teal'   },
    { id: 'week',     icon: '📅', label: 'Weekly Goal',         value: 3,   total: 6,   unit: 'tasks done',  color: 'violet' },
    { id: 'streak',   icon: '🔥', label: 'Learning Streak',     value: 14,  total: null, unit: 'day streak', color: 'orange' },
  ],

  weeklyGoals: [
    { id: 1, text: 'Complete React Hooks module',           done: true  },
    { id: 2, text: 'Solve 5 LeetCode problems',             done: true  },
    { id: 3, text: 'Build To-Do app with local storage',    done: true  },
    { id: 4, text: 'Read MDN article on CSS Grid',          done: false },
    { id: 5, text: 'Push project to GitHub with README',    done: false },
    { id: 6, text: 'Watch Flexbox crash course on YouTube', done: false },
  ],

  completedSkills: [
    { id: 1,  name: 'HTML5 & Semantics',     category: 'Foundation', pct: 100 },
    { id: 2,  name: 'CSS3 & Flexbox',        category: 'Styling',    pct: 100 },
    { id: 3,  name: 'JavaScript (ES6+)',     category: 'Language',   pct: 92  },
    { id: 4,  name: 'Responsive Design',     category: 'Styling',    pct: 88  },
    { id: 5,  name: 'Git & GitHub',          category: 'Tooling',    pct: 85  },
    { id: 6,  name: 'React Fundamentals',    category: 'Framework',  pct: 78  },
    { id: 7,  name: 'DOM Manipulation',      category: 'Language',   pct: 95  },
    { id: 8,  name: 'CSS Grid',              category: 'Styling',    pct: 82  },
    { id: 9,  name: 'Fetch API & Async/Await', category: 'Language', pct: 74  },
    { id: 10, name: 'TypeScript Basics',     category: 'Language',   pct: 45  },
    { id: 11, name: 'React Hooks',           category: 'Framework',  pct: 65  },
    { id: 12, name: 'REST APIs',             category: 'Backend',    pct: 50  },
  ],

  weeklyProgress: [
    { week: 'W1', pct: 95  },
    { week: 'W2', pct: 80  },
    { week: 'W3', pct: 100 },
    { week: 'W4', pct: 70  },
    { week: 'W5', pct: 62  },
    { week: 'W6', pct: 0   },
    { week: 'W7', pct: 0   },
    { week: 'W8', pct: 0   },
  ],

  recentActivity: [
    { id: 1, icon: '✅', text: 'Completed "React Hooks" lesson',           time: '2h ago'     },
    { id: 2, icon: '💻', text: 'Pushed "weather-app" to GitHub',           time: '5h ago'     },
    { id: 3, icon: '🧩', text: 'Solved 2 LeetCode Easy problems',          time: 'Yesterday'  },
    { id: 4, icon: '📚', text: 'Finished "CSS Grid" module on CSS-Tricks', time: 'Yesterday'  },
    { id: 5, icon: '🏆', text: 'Earned "7-Day Streak" badge',              time: '2 days ago' },
  ],

  streakDays: 14,
  bestStreak: 21,
  startDate:  'Oct 1, 2024',
};

/* ── Sub-components ─────────────────────────────────────────────────────── */

/** Circular SVG progress ring */
function CircleProgress({ pct, size = 88, stroke = 8, color = '#4f46e5' }) {
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="pd-circle" aria-label={`${pct}% overall progress`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e6f0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize="14" fontWeight="700" fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

/** Thin horizontal fill bar */
function ProgressBar({ pct, color = 'indigo', thin = false }) {
  return (
    <div
      className={`pd-bar__track${thin ? ' pd-bar__track--thin' : ''}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`pd-bar__fill pd-bar__fill--${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Top-row stat card */
function StatCard({ icon, label, value, total, unit, color }) {
  const pct = total ? Math.round((value / total) * 100) : null;
  return (
    <div className={`pd-stat pd-stat--${color}`}>
      <div className="pd-stat__top">
        <span className="pd-stat__icon" aria-hidden="true">{icon}</span>
        {pct !== null && <span className="pd-stat__pct">{pct}%</span>}
      </div>
      <p className="pd-stat__value">
        {value}<span className="pd-stat__unit"> {unit}</span>
      </p>
      <p className="pd-stat__label">{label}</p>
      {pct !== null && <ProgressBar pct={pct} color={color} thin />}
    </div>
  );
}

/** Category pill for skill cards */
const CAT_COLOR = {
  Foundation: 'indigo', Styling: 'violet', Language: 'blue',
  Framework: 'teal', Tooling: 'orange', Backend: 'green',
};

function CategoryPill({ category }) {
  const c = CAT_COLOR[category] || 'indigo';
  return <span className={`pd-pill pd-pill--${c}`}>{category}</span>;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function getInitials(name) {
  if (!name) return 'AS';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ── Main Component ─────────────────────────────────────────────────────── */
function ProgressDashboard() {
  const d = DUMMY_DATA;
  const { profile } = useProfile();

  const name = profile?.name || d.learner.name;
  const goal = profile?.careerGoal || d.learner.goal;
  const initials = profile?.name ? getInitials(profile.name) : d.learner.avatarInitials;

  const [goals, setGoals] = useState(d.weeklyGoals);

  const goalsCompleted = goals.filter((g) => g.done).length;
  const goalsPct       = Math.round((goalsCompleted / goals.length) * 100);
  const streakValue    = d.streakDays;

  const toggleGoal = (id) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));

  const activeWeek = d.weeklyProgress.filter((w) => w.pct > 0).length;

  return (
    <section className="pd-section" id="progress-dashboard">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="pd-page-header">
        <div className="pd-page-header__left">
          <div className="pd-avatar" aria-hidden="true">{initials}</div>
          <div>
            <span className="pd-page-header__eyebrow">Progress Dashboard</span>
            <h2 className="pd-page-header__title">{name}</h2>
            <p className="pd-page-header__sub">
              Goal: <strong>{goal}</strong>
            </p>
          </div>
        </div>
        <div className="pd-page-header__right">
          <CircleProgress pct={d.overallProgress} size={88} stroke={8} color="#4f46e5" />
          <p className="pd-page-header__overall-label">Overall Progress</p>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="pd-stats-grid">
        {d.stats.map((s) => <StatCard key={s.id} {...s} />)}
      </div>

      {/* ── Main Grid ─────────────────────────────────────────── */}
      <div className="pd-main-grid">

        {/* 1 — Weekly Goals */}
        <div className="pd-card pd-card--violet">
          <header className="pd-card__header">
            <span className="pd-card__icon" aria-hidden="true">🎯</span>
            <h3 className="pd-card__title">Weekly Goal</h3>
            <span className="pd-card__badge">{goalsCompleted}/{goals.length} done</span>
          </header>
          <div className="pd-card__body">
            <div className="pd-goals-meta">
              <span className="pd-goals-meta__label">{goalsPct}% complete this week</span>
              <ProgressBar pct={goalsPct} color="violet" />
            </div>
            <ul className="pd-goals-list" aria-label="Weekly goal checklist">
              {goals.map((g) => (
                <li
                  key={g.id}
                  className={`pd-goal${g.done ? ' pd-goal--done' : ''}`}
                  onClick={() => toggleGoal(g.id)}
                  role="checkbox"
                  aria-checked={g.done}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleGoal(g.id)}
                >
                  <span className="pd-goal__check" aria-hidden="true">{g.done ? '✓' : ''}</span>
                  <span className="pd-goal__text">{g.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2 — Weekly Progress Chart */}
        <div className="pd-card pd-card--blue">
          <header className="pd-card__header">
            <span className="pd-card__icon" aria-hidden="true">📊</span>
            <h3 className="pd-card__title">Weekly Progress</h3>
            <span className="pd-card__badge">Week {activeWeek} of {d.learner.totalWeeks}</span>
          </header>
          <div className="pd-card__body">
            <div className="pd-chart" aria-label="Weekly progress bar chart">
              {d.weeklyProgress.map((w) => {
                const isEmpty = w.pct === 0;
                const isFull  = w.pct === 100;
                return (
                  <div key={w.week} className="pd-chart__col">
                    <div className="pd-chart__bar-wrap">
                      <div
                        className={`pd-chart__bar${isEmpty ? ' pd-chart__bar--empty' : isFull ? ' pd-chart__bar--full' : ''}`}
                        style={{ height: `${isEmpty ? 4 : w.pct}%` }}
                        role="img"
                        aria-label={`${w.week}: ${w.pct}%`}
                      />
                    </div>
                    <span className="pd-chart__label">{w.week}</span>
                  </div>
                );
              })}
            </div>
            <div className="pd-chart__legend" aria-hidden="true">
              <span className="pd-chart__legend-item pd-chart__legend-item--done">Completed</span>
              <span className="pd-chart__legend-item pd-chart__legend-item--active">In Progress</span>
              <span className="pd-chart__legend-item pd-chart__legend-item--empty">Upcoming</span>
            </div>
          </div>
        </div>

        {/* 3 — Completed Skills (full width) */}
        <div className="pd-card pd-card--indigo pd-card--full">
          <header className="pd-card__header">
            <span className="pd-card__icon" aria-hidden="true">✅</span>
            <h3 className="pd-card__title">Completed Skills</h3>
            <span className="pd-card__badge">
              {d.completedSkills.filter((s) => s.pct >= 75).length} mastered · {d.completedSkills.length} tracked
            </span>
          </header>
          <div className="pd-card__body">
            <div className="pd-skills-grid">
              {d.completedSkills.map((sk) => (
                <div key={sk.id} className="pd-skill">
                  <div className="pd-skill__top">
                    <span className="pd-skill__name">{sk.name}</span>
                    <CategoryPill category={sk.category} />
                  </div>
                  <div className="pd-skill__bar-row">
                    <ProgressBar pct={sk.pct} color={CAT_COLOR[sk.category] || 'indigo'} thin />
                    <span className="pd-skill__pct">{sk.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 — Recent Activity */}
        <div className="pd-card pd-card--teal">
          <header className="pd-card__header">
            <span className="pd-card__icon" aria-hidden="true">⚡</span>
            <h3 className="pd-card__title">Recent Activity</h3>
          </header>
          <div className="pd-card__body">
            <ul className="pd-activity-list" aria-label="Recent activity">
              {d.recentActivity.map((a) => (
                <li key={a.id} className="pd-activity">
                  <span className="pd-activity__icon" aria-hidden="true">{a.icon}</span>
                  <span className="pd-activity__text">{a.text}</span>
                  <span className="pd-activity__time">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5 — Learning Streak */}
        <div className="pd-card pd-card--orange">
          <header className="pd-card__header">
            <span className="pd-card__icon" aria-hidden="true">🔥</span>
            <h3 className="pd-card__title">Learning Streak</h3>
            <span className="pd-card__badge">🏆 Best: {d.bestStreak} days</span>
          </header>
          <div className="pd-card__body pd-card__body--center">
            <div className="pd-streak">
              <span className="pd-streak__flame" aria-hidden="true">🔥</span>
              <p className="pd-streak__count">{streakValue}</p>
              <p className="pd-streak__unit">day streak</p>
            </div>
            <div className="pd-streak-dots" aria-label={`Last ${streakValue} days active`}>
              {Array.from({ length: 14 }, (_, i) => (
                <span
                  key={i}
                  className={`pd-streak-dot${i < streakValue ? ' pd-streak-dot--active' : ' pd-streak-dot--empty'}`}
                  title={`Day ${i + 1}${i < streakValue ? ' ✓' : ''}`}
                />
              ))}
            </div>
            <div className="pd-streak__meta">
              <p className="pd-streak__sub">📅 Started: <strong>{d.startDate}</strong></p>
              <ProgressBar pct={Math.round((streakValue / d.bestStreak) * 100)} color="orange" thin />
              <p className="pd-streak__hint">{d.bestStreak - streakValue} days to beat your best streak</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default ProgressDashboard;
