import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashIntro.css';

function SplashIntro() {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show the "Get Started" button after a short animated delay
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    navigate('/profile');
  };

  return (
    <div className="si-container">
      {/* Dynamic Background Gradients */}
      <div className="si-glow-1" />
      <div className="si-glow-2" />

      <div className="si-content">
        {/* Animated Pulsing Logo */}
        <div className="si-logo-wrap">
          <span className="si-logo" role="img" aria-label="Graduate Cap">🎓</span>
        </div>

        {/* Animated App Name */}
        <h1 className="si-title">
          LearnMate <span className="si-title-accent">AI</span>
        </h1>

        {/* Animated Subtitle Tagline */}
        <p className="si-tagline">
          Empowering your custom career journey through personalized AI roadmaps & feedback.
        </p>

        {/* Pulsing "Get Started" CTA */}
        <div className={`si-action-wrap ${showButton ? 'si-action-wrap--visible' : ''}`}>
          <button onClick={handleGetStarted} className="si-btn-cta">
            Get Started <span className="si-btn-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SplashIntro;
