import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero__container">
        {/* Badge */}
        <span className="hero__badge">✨ AI-Powered Learning</span>

        {/* Headline */}
        <h1 className="hero__title">
          LearnMate AI –{' '}
          <span className="hero__title-highlight">Personalized Learning</span>{' '}
          Pathway Assistant
        </h1>

        {/* Description */}
        <p className="hero__description">
          LearnMate AI analyzes your current skills, identifies gaps, and builds
          a custom learning roadmap tailored to your goals — pairing you with the
          best courses and tracking your growth every step of the way.
        </p>

        {/* CTA buttons */}
        <div className="hero__actions">
          <a href="#features" className="hero__btn hero__btn--primary">
            Get Started
          </a>
          <a href="#about" className="hero__btn hero__btn--secondary">
            Learn More
          </a>
        </div>

        {/* Stats row */}
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-number">10K+</span>
            <span className="hero__stat-label">Learners</span>
          </div>
          <div className="hero__stat-divider" aria-hidden="true" />
          <div className="hero__stat">
            <span className="hero__stat-number">500+</span>
            <span className="hero__stat-label">Courses</span>
          </div>
          <div className="hero__stat-divider" aria-hidden="true" />
          <div className="hero__stat">
            <span className="hero__stat-number">95%</span>
            <span className="hero__stat-label">Satisfaction</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
