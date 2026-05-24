import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, User, BookOpen, 
  CreditCard, LogOut, Settings, Bell, Heart
} from 'lucide-react';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8000${path}`;
};

const StudentSidebar = ({ user }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'My Courses', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'wishlist', label: 'My Wishlist', icon: <Heart size={20} />, path: '/wishlist' },
    { id: 'class_joining', label: 'Class Joining', icon: <BookOpen size={20} />, path: '/class-joining' },
    { id: 'live_classes', label: 'Live Classes', icon: <BookOpen size={20} />, path: '/live-classes' },
    { id: 'resources', label: 'Resources', icon: <BookOpen size={20} />, path: '/resources' },
    { id: 'courses', label: 'Browse Courses', icon: <BookOpen size={20} />, path: '/' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 0' },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 25px',
      color: '#475569',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: '600',
      transition: 'all 0.2s',
      borderLeft: '4px solid transparent'
    },
    activeItem: {
      color: '#2563eb',
      background: '#eff6ff',
      borderLeft: '4px solid #2563eb'
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ padding: '0 25px 30px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden' }}>
               {user?.profile?.photo ? <img src={getImageUrl(user.profile.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={24} style={{ margin: '10px', color: '#94a3b8' }}/>}
            </div>
            <div>
               <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>{user?.full_name || user?.username}</div>
               <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                 {user?.mobile_number || user?.email}
               </div>
            </div>
         </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {menuItems.map(item => (
          <NavLink 
            key={item.id} 
            to={item.path} 
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.activeItem : {}) })}
            end={item.path === '/'}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default StudentSidebar;
