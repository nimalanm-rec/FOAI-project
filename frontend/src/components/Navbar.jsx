import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ASSESSMENT', path: '/assessment' },
    { name: 'SIMULATOR', path: '/simulator' },
    { name: 'COMPARE', path: '/compare' },
    { name: 'HISTORY', path: '/history' },
    { name: 'AI MODEL', path: '/model' },
    { name: 'ABOUT', path: '/about' },
  ];

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" onClick={closeMobile}>
          <div className="brand-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span>CREDIT<span style={{ color: 'var(--accent-cyan)' }}>RISK</span>.AI</span>
          </div>
        </Link>

        {/* Desktop and Mobile navigation links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.path} className="nav-item">
              <NavLink
                to={link.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMobile}
                end={link.path === '/'}
              >
                {link.name}
              </NavLink>
            </li>
          ))}
          {mobileMenuOpen && (
            <li className="nav-item" style={{ marginTop: '0.5rem' }}>
              <Link to="/assessment" className="btn btn-primary" onClick={closeMobile} style={{ width: '100%' }}>
                <Sparkles size={16} /> Start Assessment
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          <Link to="/assessment" className="btn btn-primary" style={{ display: mobileMenuOpen ? 'none' : 'inline-flex' }}>
            <Sparkles size={15} /> Start Assessment
          </Link>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
