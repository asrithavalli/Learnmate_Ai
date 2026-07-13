import React from 'react';
import { Link } from 'react-router-dom';
import './Features.css';

function FeatureCard({ icon, title, description, tag, to = '/profile' }) {
  return (
    <article className="feature-card">
      <div className="feature-card__icon-wrap" aria-hidden="true">
        <span className="feature-card__icon">{icon}</span>
      </div>
      <span className="feature-card__tag">{tag}</span>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>
      <Link to={to} className="feature-card__link">
        Explore feature →
      </Link>
    </article>
  );
}

export default FeatureCard;
