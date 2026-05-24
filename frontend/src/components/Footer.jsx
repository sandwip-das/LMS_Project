import React from 'react';
import { Link } from 'react-router-dom';
import { SiteContext } from '../context/SiteContext';
import { Mail, MapPin, Globe, MessageCircle, Info } from 'lucide-react';

const Footer = () => {
  const { settings } = React.useContext(SiteContext);
  return (
    <footer style={{ background: 'rgba(250, 177, 160, 0.3)', color: 'var(--black-accent)', padding: '4rem 2rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="grid grid-cols-4" style={{ gap: '3rem', marginBottom: '3rem' }}>
          
          {/* Column 1: Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="brand-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--black-accent)' }}>
              {settings.site_logo && (
                <img src={settings.site_logo} alt={settings.site_name} className="brand-logo" style={{ height: '50px', width: '50px', borderRadius: '8px', objectFit: 'contain', border: '2px solid rgba(0,0,0,0.1)' }} />
              )}
              <span className="brand-text">{settings.site_name}</span>
            </Link>
            <p style={{ color: '#000000', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {settings.footer_description}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', position: 'relative', paddingBottom: '10px' }}>
              Quick Links
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '2px', background: 'var(--black-accent)' }}></span>
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/" className="footer-link">Upcoming Live Batch</Link></li>
              <li><Link to="/free-courses" className="footer-link">Free Courses</Link></li>
              <li><Link to="/workshops" className="footer-link">Live Workshop</Link></li>
              <li><Link to="/apply-instructor" className="footer-link">Join As Instructor</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', position: 'relative', paddingBottom: '10px' }}>
              Company
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '2px', background: 'var(--black-accent)' }}></span>
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms and Conditions</Link></li>
              <li><Link to="/refund" className="footer-link">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', position: 'relative', paddingBottom: '10px' }}>
              Contacts
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '2px', background: 'var(--black-accent)' }}></span>
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li style={{ display: 'flex', gap: '10px', color: '#000000' }}>
                <Mail size={18} color="var(--black-accent)" />
                <span style={{ fontSize: '0.9rem' }}>{settings.contact_email}</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', color: '#000000' }}>
                <MapPin size={24} color="var(--black-accent)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {settings.contact_address}
                </span>
              </li>
              <li>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                  {settings.facebook_url && settings.facebook_icon && (
                    <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="social-btn" title="Facebook">
                      <img src={settings.facebook_icon} alt="FB" />
                    </a>
                  )}
                  {settings.twitter_url && settings.twitter_icon && (
                    <a href={settings.twitter_url} target="_blank" rel="noreferrer" className="social-btn" title="Twitter">
                      <img src={settings.twitter_icon} alt="TW" style={{ borderRadius: '50%' }} />
                    </a>
                  )}
                  {settings.instagram_url && settings.instagram_icon && (
                    <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="social-btn" title="Instagram">
                      <img src={settings.instagram_icon} alt="IG" />
                    </a>
                  )}
                  {settings.linkedin_url && settings.linkedin_icon && (
                    <a href={settings.linkedin_url} target="_blank" rel="noreferrer" className="social-btn" title="LinkedIn">
                      <img src={settings.linkedin_icon} alt="IN" />
                    </a>
                  )}
                  {settings.youtube_url && settings.youtube_icon && (
                    <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="social-btn" title="YouTube">
                      <img src={settings.youtube_icon} alt="YT" />
                    </a>
                  )}
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ color: '#000000', fontSize: '0.9rem', textAlign: 'center' }}>
            {settings.copyright_text 
              ? settings.copyright_text.includes('{year}') 
                ? settings.copyright_text.replace('{year}', new Date().getFullYear())
                : `© ${new Date().getFullYear()} ${settings.copyright_text}`
              : `© ${new Date().getFullYear()} ${settings.site_name}. All Rights Reserved.`
            }
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
