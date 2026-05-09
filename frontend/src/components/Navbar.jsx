import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SiteContext } from '../context/SiteContext';
import { LogOut, User as UserIcon, BookOpen, Menu, LayoutDashboard, ChevronDown } from 'lucide-react';
import api from '../api';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8000${path}`;
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { settings } = useContext(SiteContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);
  const courseRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to landing page on logout
    setDropdownOpen(false);
  };

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('lms/categories/');
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await api.get('users/profile/');
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile in navbar", err);
      }
    };

    fetchCategories();
    fetchProfile();

    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (courseRef.current && !courseRef.current.contains(event.target)) {
        setCourseDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  return (
    <nav style={{ 
      background: '#ffffff', 
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.8rem 5%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Left: Logo & Name */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
        {settings.site_logo ? (
          <img src={settings.site_logo} alt={settings.site_name} style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <span style={{ background: 'var(--black-accent)', padding: '4px 10px', borderRadius: '8px', color: 'white' }}>LMS</span>
        )}
        <span>{settings.site_name}</span>
      </Link>
      
      {/* Right: Menu items */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        
        {/* All Course Dropdown */}
        <div style={{ position: 'relative' }} ref={courseRef}>
          <button 
            onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: '5px', 
              fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.95rem'
            }}
          >
            All Course <ChevronDown size={16} />
          </button>
          
          {courseDropdownOpen && (
            <div className="glass-card" style={{
              position: 'absolute', top: '100%', left: 0, marginTop: '15px',
              width: '280px', padding: '0.5rem', zIndex: 1100,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)'
            }}>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <Link 
                      key={cat.id} 
                      to={`/courses?category=${cat.id}`}
                      onClick={() => setCourseDropdownOpen(false)}
                      style={{ 
                        display: 'block', padding: '12px 16px', borderRadius: '8px', 
                        color: 'var(--text-primary)', transition: 'all 0.2s' 
                      }}
                      className="dropdown-item"
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No categories found</p>
                )}
              </div>
              <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '5px', paddingTop: '5px' }}>
                <Link 
                  to="/courses" 
                  onClick={() => setCourseDropdownOpen(false)}
                  style={{ 
                    display: 'block', padding: '12px 16px', borderRadius: '8px', 
                    color: 'var(--accent-primary)', fontWeight: '600', textAlign: 'center' 
                  }}
                  className="dropdown-item"
                >
                  All Courses
                </Link>
              </div>
            </div>
          )}
        </div>

        {user ? (
          <>
            {(user.role === 'administrator' || user.role === 'moderator' || user.is_superuser) ? (
              <Link to="/admin" style={{ fontWeight: '500', color: 'var(--accent-primary)', fontSize: '0.95rem' }}>Dashboard</Link>
            ) : (
              <Link to="/dashboard" style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Dashboard</Link>
            )}
            
            {/* Profile Image */}
            <Link to="/profile" style={{ display: 'flex' }}>
              <div style={{ 
                width: '38px', height: '38px', borderRadius: '50%', 
                background: 'var(--black-accent)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', color: 'white',
                fontWeight: 'bold', fontSize: '1.1rem', overflow: 'hidden'
              }}>
                {profile?.profile?.photo ? (
                  <img src={getImageUrl(profile.profile.photo)} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (profile?.username || user?.username || '').charAt(0).toUpperCase()}
              </div>
            </Link>
            
            {/* Three-line Menu */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', padding: '4px' }}
              >
                <Menu size={26} />
              </button>

              {dropdownOpen && (
                <div className="glass-card" style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '15px',
                  width: '280px', padding: '1.2rem', zIndex: 1100,
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)'
                }}>
                  {/* Full Name & Picture */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '15px' }}>
                    <div style={{ 
                      width: '50px', height: '50px', borderRadius: '50%', 
                      background: 'var(--black-accent)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', color: 'white',
                      fontWeight: 'bold', fontSize: '1.4rem', overflow: 'hidden'
                    }}>
                      {profile?.profile?.photo ? (
                        <img src={getImageUrl(profile.profile.photo)} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (profile?.username || user?.username || '').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>{profile?.full_name || user?.username}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{profile?.mobile_number || profile?.email || user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Student Navigation Links */}
                  {user.role === 'student' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid var(--glass-border)' }}>
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} style={{ padding: '8px 12px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }} className="dropdown-item">My Courses</Link>
                      <Link to="/class-joining" onClick={() => setDropdownOpen(false)} style={{ padding: '8px 12px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }} className="dropdown-item">Class Joining</Link>
                      <Link to="/live-classes" onClick={() => setDropdownOpen(false)} style={{ padding: '8px 12px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }} className="dropdown-item">Live Classes</Link>
                      <Link to="/resources" onClick={() => setDropdownOpen(false)} style={{ padding: '8px 12px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }} className="dropdown-item">Resources</Link>
                      <Link to="/" onClick={() => setDropdownOpen(false)} style={{ padding: '8px 12px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }} className="dropdown-item">Browse Courses</Link>
                    </div>
                  )}

                  {/* Profile & Log Out links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link 
                        to="/profile" 
                        onClick={() => setDropdownOpen(false)} 
                        style={{ 
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                          padding: '10px', borderRadius: '8px', color: 'var(--text-primary)',
                          background: '#f1f5f9', fontSize: '0.9rem', fontWeight: '500'
                        }} 
                        className="dropdown-item"
                      >
                        <UserIcon size={16} /> Profile
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        style={{ 
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                          padding: '10px', borderRadius: '8px', color: 'var(--danger)',
                          background: '#fee2e2', border: 'none', cursor: 'pointer',
                          fontSize: '0.9rem', fontWeight: '500'
                        }} 
                        className="dropdown-item"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Link to="/login" style={{ 
              color: 'var(--black-accent)', 
              fontWeight: '700', 
              fontSize: '0.95rem',
              padding: '10px 20px',
              borderRadius: '12px',
              transition: 'all 0.2s',
              border: '1.5px solid transparent'
            }} onMouseOver={(e) => e.target.style.background = '#f8fafc'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
              Sign In
            </Link>
            <Link to="/register" style={{ 
              background: 'var(--black-accent)', 
              color: 'white', 
              fontWeight: '700', 
              fontSize: '0.95rem',
              padding: '10px 25px',
              borderRadius: '12px',
              boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)',
              transition: 'all 0.3s'
            }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
              Join for Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
