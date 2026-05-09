import React from 'react';
import { 
  Users, BookOpen, GraduationCap, 
  Briefcase, LayoutDashboard, Settings
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user }) => {
  const menuItems = [
    { id: 'overview', label: 'Analytics', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'User Management', icon: <Users size={20} /> },
    { id: 'courses', label: 'Course Management', icon: <BookOpen size={20} /> },
    { id: 'instructors', label: 'Instructor Management', icon: <Briefcase size={20} /> },
    { id: 'instructor-portals', label: 'Instructor Portals', icon: <GraduationCap size={20} /> },
    { id: 'student-portals', label: 'Student Portals', icon: <Users size={20} /> },
    { id: 'settings', label: 'Site Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '25px', borderBottom: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: '800' }}>Control Panel</h3>
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Admin: {user?.username}</p>
      </div>
      
      <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab && setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 15px',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === item.id ? 'var(--black-accent, #0f172a)' : 'transparent',
              color: activeTab === item.id ? '#ffffff' : '#475569',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '0.95rem',
              fontWeight: activeTab === item.id ? '600' : '500',
              transition: 'all 0.2s'
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
