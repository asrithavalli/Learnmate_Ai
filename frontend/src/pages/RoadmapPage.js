import React from 'react';
import { Link } from 'react-router-dom';
import LearningRoadmap from '../components/LearningRoadmap/LearningRoadmap';
import { useProfile } from '../context/ProfileContext';

function RoadmapPage() {
  const { profile, roadmap } = useProfile();

  if (!profile || !roadmap) {
    return (
      <div className="page-empty">
        <span className="page-empty__icon" aria-hidden="true">🗺️</span>
        <h2 className="page-empty__title">No Roadmap Yet</h2>
        <p className="page-empty__desc">
          Complete your student profile first so LearnMate AI can generate a
          personalised learning path for you.
        </p>
        <Link to="/profile" className="page-empty__btn">
          Go to Profile →
        </Link>
      </div>
    );
  }

  return <LearningRoadmap profile={profile} roadmap={roadmap} />;
}

export default RoadmapPage;
