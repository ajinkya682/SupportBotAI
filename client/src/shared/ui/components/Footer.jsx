import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa6';
import axios from 'axios';
import { API_URL } from '../../services/config';

const Footer = () => {
  const [platformConfig, setPlatformConfig] = useState({
    twitterUrl: 'https://twitter.com',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com'
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/super-admin/config`);
        if (res.data.success) {
          setPlatformConfig(prev => ({
            ...prev,
            ...res.data.config
          }));
        }
      } catch (err) {
        console.error('Failed to fetch footer config:', err);
      }
    };
    fetchConfig();
  }, []);

  return (
    <footer className="global-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/logo.png" alt="SupportBot AI" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
              <span>SUPPORTBOT <span style={{ color: 'var(--primary)' }}>AI</span></span>
            </Link>
            <p>Revolutionizing customer support with AI that understands, learns, and resolves issues instantly.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <Link to="/product">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/docs">Documentation</Link>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/blog">Blog</Link>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 SupportBotAI Inc. All rights reserved.</p>
          <div className="social-links">
            <a
              href={platformConfig.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Twitter"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href={platformConfig.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={20} />
            </a>
            <a
              href={platformConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="GitHub"
            >
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .global-footer {
          background: var(--surface-container-lowest);
          padding: 80px 0 40px;
          border-top: 1px solid var(--outline-variant);
          margin-top: 80px;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        @media (min-width: 992px) {
          .footer-top {
            grid-template-columns: 400px 1fr;
            gap: 120px;
          }
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--on-surface);
          letter-spacing: -0.03em;
        }

        .footer-brand p {
          color: var(--on-surface-variant);
          font-size: 1.1rem;
          line-height: 1.6;
          max-width: 360px;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
        }

        @media (min-width: 640px) {
          .footer-links {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .link-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .link-group h4 {
          font-size: 1rem;
          font-weight: 800;
          color: var(--on-surface);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .link-group a {
          color: var(--on-surface-variant);
          text-decoration: none;
          font-size: 1rem;
          transition: var(--transition-fast);
        }

        .link-group a:hover {
          color: var(--primary);
          transform: translateX(4px);
        }

        .footer-bottom {
          padding-top: 40px;
          border-top: 1px solid var(--outline-variant);
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
          text-align: center;
        }

        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }

        .footer-bottom p {
          color: var(--on-surface-variant);
          font-size: 0.9rem;
        }

        .social-links {
          display: flex;
          gap: 16px;
        }

        .social-link {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--on-surface-variant);
          transition: var(--transition-fast);
          border: 1px solid var(--outline-variant);
          box-shadow: var(--shadow-sm);
        }

        .social-link:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-3px);
          border-color: var(--primary);
          box-shadow: var(--shadow-raised);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
