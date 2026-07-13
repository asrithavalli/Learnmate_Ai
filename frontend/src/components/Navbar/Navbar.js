import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const navLinks = [
  { label: 'Home',      to: '/'          },
  { label: 'Profile',   to: '/profile'   },
  { label: 'Roadmap',   to: '/roadmap'   },
  { label: 'Quiz',      to: '/quiz'      },
  { label: 'Dashboard', to: '/dashboard' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  /* NavLink receives `isActive` and adds className automatically */
  const linkClass = ({ isActive }) =>
    `navbar__link${isActive ? ' navbar__link--active' : ''}`;

  const mobileLinkClass = ({ isActive }) =>
    `navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}`;

  return (
    <header className="navbar">
      <div className="navbar__container">

        {/* Brand */}
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <span className="navbar__brand-icon" aria-hidden="true">🎓</span>
          <span className="navbar__brand-name">
            LearnMate <span className="navbar__brand-ai">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="navbar__nav" aria-label="Main navigation">
          <ul className="navbar__links">
            {navLinks.map(({ label, to }) => (
              <li key={to}>
                <NavLink to={to} className={linkClass} end={to === '/'}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Active-route pill — visible on desktop only */}
        <span className="navbar__active-pill" aria-hidden="true">
          {navLinks.find((l) =>
            l.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(l.to)
          )?.label ?? 'Home'}
        </span>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile dropdown */}
      <nav
        id="mobile-menu"
        className={`navbar__mobile-menu${menuOpen ? ' navbar__mobile-menu--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <ul>
          {navLinks.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={mobileLinkClass}
                end={to === '/'}
                onClick={closeMenu}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
