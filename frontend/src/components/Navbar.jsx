import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SiteContext } from '../context/SiteContext';
import { LogOut, User as UserIcon, BookOpen, Menu, LayoutDashboard, ChevronDown, ChevronRight, PlayCircle, Bell } from 'lucide-react';
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
  const [courses, setCourses] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const courseRef = useRef(null);
  const notifRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to landing page on logout
    setDropdownOpen(false);
  };

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchCategoriesAndCourses = async () => {
      try {
        const [catRes, courseRes] = await Promise.all([
          api.get('lms/categories/'),
          api.get('lms/courses/')
        ]);
        setCategories(catRes.data);
        setCourses(courseRes.data);
        if (catRes.data.length > 0) {
          setActiveCategory(catRes.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch categories or courses", err);
      }
    };
    
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }
      try {
        const res = await api.get('users/profile/');
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile in navbar", err);
      }
    };
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await api.get('users/notifications/');
        setNotifications(res.data);
      } catch (err) { console.error("Failed to fetch notifications", err); }
    };

    fetchCategoriesAndCourses();
    fetchProfile();
    fetchNotifications();

    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (courseRef.current && !courseRef.current.contains(event.target)) {
        setCourseDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.post(`users/notifications/${id}/mark_read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error(err); }
  };

  return (
    <nav style={{ 
      background: '#ffffff', 
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0.8rem 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
      {/* Left: Logo & Name */}
      <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="brand-link" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
        {settings.site_logo && (
          <img src={settings.site_logo} alt={settings.site_name} className="brand-logo" style={{ height: '40px', width: '40px', borderRadius: '8px', objectFit: 'contain' }} />
        )}
        <span className="brand-text">{settings.site_name}</span>
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
            All Courses <ChevronDown size={16} />
          </button>
          
          {courseDropdownOpen && (
            <div className="glass-card" style={{
              position: 'fixed', top: '75px', left: '50%', transform: 'translateX(-50%)',
              width: '800px', maxWidth: '90vw', padding: 0, zIndex: 1100,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)',
              borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
              background: '#ffffff'
            }}>
              <div style={{ display: 'flex', minHeight: '350px' }}>
                {/* Left Column: Categories */}
                <div style={{ width: '250px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '15px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 10px 10px' }}>Categories</div>
                  {categories.length > 0 ? (
                    categories.map(cat => {
                      const isActive = activeCategory && activeCategory.id === cat.id;
                      return (
                        <div 
                          key={cat.id} 
                          onMouseEnter={() => setActiveCategory(cat)}
                          onClick={() => {
                            setCourseDropdownOpen(false);
                            navigate(`/?category=${cat.id}`);
                          }}
                          style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                            fontWeight: isActive ? '700' : '500',
                            background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
                          {isActive && <ChevronRight size={16} />}
                        </div>
                      )
                    })
                  ) : (
                    <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No categories found</p>
                  )}
                </div>

                {/* Right Column: Courses */}
                <div style={{ flex: 1, padding: '20px', background: '#ffffff', overflowY: 'auto', maxHeight: '400px' }}>
                  {activeCategory ? (
                    <>
                      <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                        {activeCategory.name} Courses
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {courses.filter(c => c.category === activeCategory.id).length > 0 ? (
                          courses.filter(c => c.category === activeCategory.id).map(course => (
                            <Link 
                              key={course.id} 
                              to={`/course/${course.id}`}
                              onClick={() => setCourseDropdownOpen(false)}
                              style={{ 
                                display: 'flex', alignItems: 'flex-start', gap: '12px',
                                padding: '12px', borderRadius: '10px', textDecoration: 'none',
                                color: '#0f172a', transition: 'all 0.2s',
                                border: '1px solid transparent'
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                            >
                              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--accent-primary)' }}>
                                <PlayCircle size={20} />
                              </div>
                              <div>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px', lineHeight: '1.2' }}>{course.title}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Instructor: {course.instructor_name || 'Expert'}</div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                            <BookOpen size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                            <p style={{ fontWeight: '500' }}>New courses coming soon!</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                      Hover over a category to see courses
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bottom Bar */}
              <div style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc', padding: '12px 20px' }}>
                <Link 
                  to="/" 
                  onClick={() => setCourseDropdownOpen(false)}
                  style={{ 
                    display: 'block', padding: '12px', borderRadius: '8px', textDecoration: 'none',
                    color: 'var(--accent-primary)', fontWeight: '700', textAlign: 'center',
                    background: 'rgba(99, 102, 241, 0.1)', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                >
                  Explore All Courses
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

            {/* Notifications */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', padding: '5px' }}
              >
                <Bell size={24} color="var(--text-primary)" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="glass-card" style={{ position: 'absolute', top: '100%', right: '-10px', width: '350px', padding: '0', marginTop: '15px', zIndex: 1100, borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', background: '#fff', overflow: 'hidden' }}>
                    <div style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Notifications</h4>
                    </div>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => markAsRead(n.id)} style={{ padding: '15px 20px', borderBottom: '1px solid #f1f5f9', background: n.is_read ? 'white' : 'rgba(99, 102, 241, 0.05)', cursor: 'pointer', transition: '0.2s' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a', marginBottom: '5px' }}>{n.title}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                </div>
              )}
            </div>
            
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
                  {/* Full Name & Picture - Premium required.png Style */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px', 
                    borderBottom: '1px solid var(--glass-border)', 
                    paddingBottom: '16px', 
                    marginBottom: '16px' 
                  }}>
                    {/* Avatar Container with flexShrink: 0 to prevent squeezing */}
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '50%', 
                      background: '#e2e8f0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid var(--glass-border)'
                    }}>
                      {profile?.profile?.photo ? (
                        <img 
                          src={getImageUrl(profile.profile.photo)} 
                          alt={profile.full_name || 'User'} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <UserIcon size={32} style={{ color: '#94a3b8' }} />
                      )}
                    </div>
                    {/* Name & Email Stack */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: '1.15rem', 
                        color: '#0f172a', 
                        lineHeight: '1.2',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {profile?.full_name || user?.username}
                      </div>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#64748b', 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {profile?.email || 'demo.tania@gmail.com'}
                      </div>
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
      </div>
    </nav>
  );
};

export default Navbar;
