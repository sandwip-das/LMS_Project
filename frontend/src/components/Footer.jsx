import React from 'react';
import { Link } from 'react-router-dom';
import { SiteContext } from '../context/SiteContext';
import { Mail, MapPin, Globe, MessageCircle, Info } from 'lucide-react';

const Footer = () => {
  const { settings } = React.useContext(SiteContext);
  return (
    <footer style={{ background: 'rgba(24, 220, 255, 1.0)', color: 'var(--black-accent)', padding: '4rem 2rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="grid grid-cols-4" style={{ gap: '3rem', marginBottom: '3rem' }}>
          
          {/* Column 1: Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--black-accent)' }}>
              {settings.site_logo ? (
                <img src={settings.site_logo} alt={settings.site_name} style={{ height: '50px', width: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,0,0,0.1)' }} />
              ) : (
                <span style={{ background: 'var(--accent-primary)', padding: '5px 10px', borderRadius: '8px', color: 'white' }}>LMS</span>
              )}
              {settings.site_name}
            </Link>
            <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: '0.9rem', lineHeight: '1.6' }}>
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
              <li><Link to="/courses" style={{ color: 'rgba(0,0,0,0.7)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(0,0,0,0.7)'}>Upcoming Live Batch</Link></li>
              <li><Link to="/free-courses" style={{ color: 'rgba(0,0,0,0.7)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(0,0,0,0.7)'}>Free Courses</Link></li>
              <li><Link to="/workshops" style={{ color: 'rgba(0,0,0,0.7)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(0,0,0,0.7)'}>Live Workshop</Link></li>
              <li><Link to="/apply-instructor" style={{ color: 'rgba(0,0,0,0.7)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(0,0,0,0.7)'}>Join As Instructor</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', position: 'relative', paddingBottom: '10px' }}>
              Company
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '2px', background: 'var(--black-accent)' }}></span>
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/about" style={{ color: 'rgba(0,0,0,0.7)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(0,0,0,0.7)'}>About Us</Link></li>
              <li><Link to="/privacy" style={{ color: 'rgba(0,0,0,0.7)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(0,0,0,0.7)'}>Privacy Policy</Link></li>
              <li><Link to="/terms" style={{ color: 'rgba(0,0,0,0.7)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(0,0,0,0.7)'}>Terms and Conditions</Link></li>
              <li><Link to="/refund" style={{ color: 'rgba(0,0,0,0.7)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(0,0,0,0.7)'}>Refund Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', position: 'relative', paddingBottom: '10px' }}>
              Contacts
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '2px', background: 'var(--black-accent)' }}></span>
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li style={{ display: 'flex', gap: '10px', color: 'rgba(0,0,0,0.7)' }}>
                <Mail size={18} color="var(--black-accent)" />
                <span style={{ fontSize: '0.9rem' }}>{settings.contact_email}</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', color: 'rgba(0,0,0,0.7)' }}>
                <MapPin size={24} color="var(--black-accent)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {settings.contact_address}
                </span>
              </li>
              <li>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px', alignItems: 'center' }}>
                  {settings.facebook_url && (
                    <a href={settings.facebook_url} target="_blank" rel="noreferrer" style={{ color: 'var(--black-accent)', display: 'flex' }} title="Facebook">
                      {settings.facebook_icon ? <img src={settings.facebook_icon} alt="FB" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : <Globe size={20} />}
                    </a>
                  )}
                  {settings.twitter_url && (
                    <a href={settings.twitter_url} target="_blank" rel="noreferrer" style={{ color: 'var(--black-accent)', display: 'flex' }} title="Twitter">
                      {settings.twitter_icon ? <img src={settings.twitter_icon} alt="TW" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : <MessageCircle size={20} />}
                    </a>
                  )}
                  {settings.instagram_url && (
                    <a href={settings.instagram_url} target="_blank" rel="noreferrer" style={{ color: 'var(--black-accent)', display: 'flex' }} title="Instagram">
                      {settings.instagram_icon ? <img src={settings.instagram_icon} alt="IG" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : <Globe size={20} />}
                    </a>
                  )}
                  {settings.linkedin_url && (
                    <a href={settings.linkedin_url} target="_blank" rel="noreferrer" style={{ color: 'var(--black-accent)', display: 'flex' }} title="LinkedIn">
                      {settings.linkedin_icon ? <img src={settings.linkedin_icon} alt="IN" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : <Info size={20} />}
                    </a>
                  )}
                  {settings.youtube_url && (
                    <a href={settings.youtube_url} target="_blank" rel="noreferrer" style={{ color: 'var(--black-accent)', display: 'flex' }} title="YouTube">
                      {settings.youtube_icon ? <img src={settings.youtube_icon} alt="YT" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : <Globe size={20} />}
                    </a>
                  )}
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.9rem', textAlign: 'center' }}>
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
