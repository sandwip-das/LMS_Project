import React, { useState, useContext } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, BookOpen, GraduationCap, 
  Briefcase, LayoutDashboard, X, Settings
} from 'lucide-react';

// Sub-components
import UserManagement from '../components/admin/UserManagement';
import CourseManagement from '../components/admin/CourseManagement';
import InstructorManagement from '../components/admin/InstructorManagement';
import InstructorPortals from '../components/admin/InstructorPortals';
import StudentPortals from '../components/admin/StudentPortals';
import AdminSummary from '../components/admin/AdminSummary';
import SiteSettings from '../components/admin/SiteSettings';
import Sidebar from '../components/admin/Sidebar';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminSummary />;
      case 'users': return <UserManagement />;
      case 'courses': return <CourseManagement />;
      case 'instructors': return <InstructorManagement />;
      case 'instructor-portals': return <InstructorPortals />;
      case 'student-portals': return <StudentPortals />;
      case 'settings': return <SiteSettings />;
      default: return <AdminSummary />;
    }
  };

  return (
    <DashboardLayout sidebar={<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />}>
      <div style={{ minHeight: '100%', background: '#ffffff' }}>
        <div style={{ padding: '30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h2 style={{ margin: 0, fontSize: '1.5rem', textTransform: 'capitalize' }}>{activeTab.replace('-', ' ')}</h2>
           <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Home / {activeTab.replace('-', ' ')}
           </div>
        </div>
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
