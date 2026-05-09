import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  BookOpen, Users, PlusCircle, CheckCircle, GraduationCap, 
  BarChart3, Layout, Package, ShieldCheck, ArrowRight
} from 'lucide-react';
import api from '../api';
import { formatDate } from '../utils/dateFormatter';

const AdminDashboardSummary = ({ stats }) => {
  return (
    <div className="fade-in">
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>Administrator Control Panel</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Global overview of your learning platform performance.</p>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '50px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase' }}>Total Students</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>{stats?.total_users || 0}</div>
            </div>
            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '14px' }}><Users color="#2563eb" size={28} /></div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase' }}>Courses</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>{stats?.total_courses || 0}</div>
            </div>
            <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '14px' }}><BookOpen color="#d97706" size={28} /></div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase' }}>Enrollments</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>{stats?.total_enrollments || 0}</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '14px' }}><CheckCircle color="#16a34a" size={28} /></div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase' }}>Active Batches</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>{stats?.active_batches || 0}</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '14px' }}><Layout color="#dc2626" size={28} /></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
         <div style={{ background: 'white', padding: '35px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', fontSize: '1.4rem' }}><BarChart3 color="var(--accent-primary)"/> Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
               <button className="btn-primary" style={{ padding: '20px', borderRadius: '16px', fontSize: '1rem' }}>Create New User</button>
               <button className="btn-primary" style={{ padding: '20px', borderRadius: '16px', fontSize: '1rem', background: '#0f172a' }}>Manage Courses</button>
            </div>
         </div>
         <div style={{ background: 'white', padding: '35px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', fontSize: '1.4rem' }}><ShieldCheck color="#8b5cf6"/> System Health</h3>
            <p style={{ color: '#64748b' }}>All systems are operational. Last data sync: {new Date().toLocaleTimeString()}</p>
         </div>
      </div>
    </div>
  );
};

const InstructorDashboard = ({ courses }) => {
  return (
    <div className="fade-in">
       <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>Instructor Hub</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage your assigned courses and interact with students.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {courses.length === 0 ? (
          <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '80px', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
             <BookOpen size={48} color="#94a3b8" style={{ margin: '0 auto 20px' }} />
             <h3 style={{ color: '#0f172a' }}>No Assigned Courses Yet</h3>
             <p style={{ color: '#64748b' }}>Please wait for an administrator to assign you to a course.</p>
          </div>
        ) : (
          courses.map(c => (
            <div key={c.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
               <h3 style={{ margin: '0 0 10px' }}>{c.title}</h3>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem' }}>
                  <span>Batch: {c.batch_no}</span>
                  <span>Enrolled: {c.enrolled_count}</span>
               </div>
               <button className="btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', fontSize: '0.9rem' }}>Open Management Panel <ArrowRight size={16} /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StudentDashboard = ({ enrollments }) => {
  return (
    <div className="fade-in">
       <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>Student Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Welcome back! Continue your learning journey.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        {enrollments.length === 0 ? (
           <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '80px', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
            <GraduationCap size={48} color="#94a3b8" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: '#0f172a' }}>Start Your First Course</h3>
            <p style={{ color: '#64748b' }}>Explore our catalog and start learning today.</p>
         </div>
        ) : (
          enrollments.map(e => (
            <div key={e.id} style={{ background: 'white', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{e.course_title}</h4>
                  <span style={{ padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>ACTIVE</span>
               </div>
               <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#64748b' }}>Progress: {e.progress || 0}%</div>
               <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '25px' }}>
                  <div style={{ width: `${e.progress || 0}%`, height: '100%', background: 'var(--accent-primary)' }}></div>
               </div>
               <button className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px' }}>Continue Learning</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import DashboardLayout from '../components/DashboardLayout';
import StudentSidebar from '../components/StudentSidebar';
import Sidebar from '../components/admin/Sidebar';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ stats: null, courses: [], enrollments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (user.role === 'administrator' || user.is_superuser) {
          const res = await api.get('lms/dashboard-summary/');
          setData(prev => ({ ...prev, stats: res.data }));
        } else if (user.role === 'instructor' || user.role === 'teaching_assistant' || user.role === 'moderator') {
          const res = await api.get('lms/courses/?admin_view=true');
          setData(prev => ({ ...prev, courses: res.data }));
        } else {
          const [enrollRes, profileRes] = await Promise.all([
            api.get('lms/enrollments/'),
            api.get('users/profile/')
          ]);
          setData(prev => ({ ...prev, enrollments: enrollRes.data, profile: profileRes.data }));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (!user) return <div style={{ textAlign: 'center', padding: '100px' }}>Please log in to access your dashboard.</div>;
  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Building your dashboard...</div>;

  const renderContent = () => {
    if (user.role === 'administrator' || user.is_superuser) return <AdminDashboardSummary stats={data.stats} />;
    if (user.role === 'instructor' || user.role === 'teaching_assistant' || user.role === 'moderator') return <InstructorDashboard courses={data.courses} />;
    return <StudentDashboard enrollments={data.enrollments} />;
  };

  const sidebar = (user.role === 'administrator' || user.is_superuser) ? <Sidebar user={user} /> : (user.role === 'student' ? <StudentSidebar user={data.profile || user} /> : null);

  return (
    <DashboardLayout sidebar={sidebar}>
      <div style={{ padding: '20px' }}>
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
