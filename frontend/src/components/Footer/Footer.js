import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const currentYear = new Date().getFullYear();

const footerLinks = [
  { label: 'Home',      to: '/'          },
  { label: 'Profile',   to: '/profile'   },
  { label: 'Roadmap',   to: '/roadmap'   },
  { label: 'Quiz',      to: '/quiz'      },
  { label: 'Dashboard', to: '/dashboard' },
];

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer__container">
        {/* Brand block */}
        <div className="footer__brand">
          <span className="footer__brand-logo">🎓</span>
          <div>
            <p className="footer__brand-name">
              LearnMate <span className="footer__brand-ai">AI</span>
            </p>
            <p className="footer__brand-tagline">
              Your personalized learning companion.
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="footer__nav" aria-label="Footer navigation">
          <ul className="footer__links">
            {footerLinks.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="footer__link">{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Divider + copyright */}
      <div className="footer__bottom">
        <p className="footer__copy">
          &copy; {currentYear} LearnMate AI. All rights reserved.
        </p>
        <p className="footer__made">
          Built with ❤️ for learners everywhere.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
