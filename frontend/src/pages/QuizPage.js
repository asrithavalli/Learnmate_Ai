import React from 'react';
import { Link } from 'react-router-dom';
import Quiz from '../components/Quiz/Quiz';
import { useProfile } from '../context/ProfileContext';

function QuizPage() {
  const { roadmap } = useProfile();

  if (!roadmap) {
    return (
      <div className="page-empty">
        <span className="page-empty__icon" aria-hidden="true">🧠</span>
        <h2 className="page-empty__title">No Quiz Available Yet</h2>
        <p className="page-empty__desc">
          Generate your personalised learning roadmap first — the quiz will be
          tailored to your career goal and skill gaps.
        </p>
        <Link to="/profile" className="page-empty__btn">
          Go to Profile →
        </Link>
      </div>
    );
  }

  return <Quiz roadmap={roadmap} />;
}

export default QuizPage;
