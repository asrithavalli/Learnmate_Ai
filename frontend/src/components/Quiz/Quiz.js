import React, { useState, useEffect, useCallback } from 'react';
import { generateQuiz } from '../../api/quizApi';
import './Quiz.css';

/* ── States the quiz can be in ──────────────────────────────── */
// idle → loading → active → submitted

/* ── Score label helper ─────────────────────────────────────── */
function scoreLabel(score, total) {
  const pct = (score / total) * 100;
  if (pct === 100) return { text: 'Perfect Score! 🏆', color: 'gold'   };
  if (pct >= 80)   return { text: 'Excellent! 🎉',      color: 'green'  };
  if (pct >= 60)   return { text: 'Good Work! 👍',       color: 'blue'   };
  if (pct >= 40)   return { text: 'Keep Practising 📚',  color: 'orange' };
  return              { text: 'More Study Needed 💪',    color: 'red'    };
}

/* ── Sub-components ─────────────────────────────────────────── */

function LoadingScreen({ careerGoal }) {
  return (
    <div className="qz-loading" aria-live="polite">
      <span className="qz-loading__spinner" aria-hidden="true" />
      <p className="qz-loading__text">
        Generating your <strong>{careerGoal}</strong> quiz with IBM Granite…
      </p>
      <p className="qz-loading__sub">This usually takes 5–10 seconds.</p>
    </div>
  );
}

function QuestionCard({ question, index, total, selected, submitted, onSelect }) {
  return (
    <div className="qz-question">
      <div className="qz-question__meta">
        <span className="qz-question__num">Question {index + 1} of {total}</span>
        {submitted && selected !== null && (
          <span
            className={`qz-question__verdict ${
              selected === question.answer ? 'qz-question__verdict--correct' : 'qz-question__verdict--wrong'
            }`}
            aria-label={selected === question.answer ? 'Correct' : 'Incorrect'}
          >
            {selected === question.answer ? '✓ Correct' : '✗ Incorrect'}
          </span>
        )}
      </div>

      <p className="qz-question__text">{question.question}</p>

      <ul className="qz-options" role="radiogroup" aria-label={`Options for question ${index + 1}`}>
        {question.options.map((opt, i) => {
          let state = '';
          if (submitted) {
            if (opt === question.answer)             state = 'correct';
            else if (opt === selected && opt !== question.answer) state = 'wrong';
          } else if (opt === selected) {
            state = 'selected';
          }

          return (
            <li key={i}>
              <button
                className={`qz-option ${state ? `qz-option--${state}` : ''}`}
                onClick={() => !submitted && onSelect(question.id, opt)}
                disabled={submitted}
                role="radio"
                aria-checked={opt === selected}
                aria-disabled={submitted}
              >
                <span className="qz-option__letter" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="qz-option__text">{opt}</span>
                {submitted && opt === question.answer && (
                  <span className="qz-option__tick" aria-hidden="true">✓</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {submitted && selected !== question.answer && (
        <p className="qz-question__explanation" role="note">
          <strong>Correct answer:</strong> {question.answer}
        </p>
      )}
    </div>
  );
}

function ScorePanel({ score, total, answers, questions, onRetry, onNew }) {
  const { text, color } = scoreLabel(score, total);
  const pct = Math.round((score / total) * 100);

  return (
    <div className="qz-score" aria-live="polite">
      <div className={`qz-score__ring qz-score__ring--${color}`}>
        <svg viewBox="0 0 100 100" className="qz-score__svg" aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e6f0" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
            className={`qz-score__arc qz-score__arc--${color}`}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
          <text x="50" y="44" textAnchor="middle" className="qz-score__pct-text">{pct}%</text>
          <text x="50" y="60" textAnchor="middle" className="qz-score__fraction">{score}/{total}</text>
        </svg>
      </div>

      <h3 className="qz-score__label">{text}</h3>
      <p className="qz-score__desc">
        You answered <strong>{score}</strong> out of <strong>{total}</strong> questions correctly.
      </p>

      {/* Per-question summary */}
      <ol className="qz-score__list" aria-label="Question results">
        {questions.map((q, i) => {
          const userAns = answers[q.id];
          const correct = userAns === q.answer;
          return (
            <li key={q.id} className={`qz-score__row qz-score__row--${correct ? 'correct' : 'wrong'}`}>
              <span className="qz-score__row-icon" aria-hidden="true">{correct ? '✓' : '✗'}</span>
              <span className="qz-score__row-q">Q{i + 1}. {q.question}</span>
              {!correct && (
                <span className="qz-score__row-ans">
                  Correct: {q.answer}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="qz-score__actions">
        <button className="qz-btn qz-btn--outline" onClick={onRetry}>
          🔁 Retry Same Quiz
        </button>
        <button className="qz-btn qz-btn--primary" onClick={onNew}>
          ✨ Generate New Quiz
        </button>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
function Quiz({ roadmap }) {
  const [phase,     setPhase]     = useState('idle');      // idle | loading | active | submitted
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState({});          // { [questionId]: selectedOption }
  const [error,     setError]     = useState(null);
  const [quizMeta,  setQuizMeta]  = useState(null);        // { careerGoal, generatedBy }

  const fetchQuiz = useCallback(async () => {
    setPhase('loading');
    setError(null);
    setAnswers({});
    try {
      const data = await generateQuiz(roadmap);
      setQuizMeta({ careerGoal: data.careerGoal, generatedBy: data.generatedBy });
      setQuestions(data.questions);
      setPhase('active');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Failed to generate quiz. Please try again.';
      setError(msg);
      setPhase('idle');
    }
  }, [roadmap]);

  /* Auto-fetch once on mount — intentionally empty dep array */
  useEffect(() => {
    if (roadmap && phase === 'idle') {
      fetchQuiz();
    }
  }, []); // eslint-disable-line

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) return;
    setPhase('submitted');
  };

  const score = questions.filter((q) => answers[q.id] === q.answer).length;
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  /* ── Idle (error state) ── */
  if (phase === 'idle') {
    return (
      <div className="qz-section">
        <div className="qz-wrapper">
          <div className="qz-empty">
            <span className="qz-empty__icon" aria-hidden="true">⚠️</span>
            <p className="qz-empty__text">{error || 'Something went wrong.'}</p>
            <button className="qz-btn qz-btn--primary" onClick={fetchQuiz}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (phase === 'loading') {
    return (
      <div className="qz-section">
        <div className="qz-wrapper">
          <LoadingScreen careerGoal={roadmap.careerGoal} />
        </div>
      </div>
    );
  }

  /* ── Results ── */
  if (phase === 'submitted') {
    return (
      <div className="qz-section">
        <div className="qz-wrapper">
          <header className="qz-header">
            <span className="qz-header__eyebrow">Quiz Complete</span>
            <h2 className="qz-header__title">Your Results</h2>
            <p className="qz-header__sub">
              {quizMeta?.careerGoal} · Generated by IBM Granite
            </p>
          </header>
          <ScorePanel
            score={score}
            total={questions.length}
            answers={answers}
            questions={questions}
            onRetry={() => { setAnswers({}); setPhase('active'); }}
            onNew={fetchQuiz}
          />
        </div>
      </div>
    );
  }

  /* ── Active quiz ── */
  return (
    <div className="qz-section">
      <div className="qz-wrapper">
        {/* Header */}
        <header className="qz-header">
          <span className="qz-header__eyebrow">
            IBM Granite · {quizMeta?.generatedBy === 'granite' ? 'AI Generated' : 'Curated'}
          </span>
          <h2 className="qz-header__title">
            {roadmap.careerGoal} Quiz
          </h2>
          <p className="qz-header__sub">
            Answer all {questions.length} questions, then click Submit.
          </p>
        </header>

        {/* Progress bar */}
        <div className="qz-progress" aria-label="Quiz progress">
          <div className="qz-progress__track">
            <div
              className="qz-progress__fill"
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
          </div>
          <span className="qz-progress__label">
            {Object.keys(answers).length} / {questions.length} answered
          </span>
        </div>

        {/* Question cards */}
        <div className="qz-questions-list">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              total={questions.length}
              selected={answers[q.id] ?? null}
              submitted={false}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Submit */}
        <div className="qz-footer">
          {!allAnswered && (
            <p className="qz-footer__hint" role="status">
              Please answer all {questions.length - Object.keys(answers).length} remaining question(s) to submit.
            </p>
          )}
          <button
            className="qz-btn qz-btn--primary qz-btn--lg"
            onClick={handleSubmit}
            disabled={!allAnswered}
            aria-disabled={!allAnswered}
          >
            Submit Quiz →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
