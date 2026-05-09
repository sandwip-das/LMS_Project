import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, CheckCircle, UserPlus, Clock } from 'lucide-react';
import api from '../../api';

const AdminSummary = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('lms/dashboard-summary/');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading dashboard data...</div>;
  if (!stats) return <div style={{ padding: '50px', textAlign: 'center' }}>Error loading statistics.</div>;

  const StatCard = ({ title, value, icon, color, subText }) => (
    <div className="glass-card" style={{ padding: '25px', borderRadius: '16px', flex: 1, minWidth: '240px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div style={{ background: `${color}15`, padding: '12px', borderRadius: '12px', color: color }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={14} /> +12%
        </span>
      </div>
      <h3 style={{ margin: '0 0 5px', fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>{value}</h3>
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>{title}</p>
      {subText && <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{subText}</p>}
    </div>
  );

  return (
    <div style={{ padding: '35px' }}>
      <div style={{ marginBottom: '35px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>Welcome back, Admin</h1>
        <p style={{ margin: '5px 0 0', color: '#64748b' }}>Here's what's happening with your LMS today.</p>
      </div>

      {/* Main Stats */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard 
          title="Total Registered Users" 
          value={stats.total_users} 
          icon={<Users size={24} />} 
          color="#6366f1"
          subText="Across all user roles"
        />
        <StatCard 
          title="Active Courses" 
          value={stats.total_courses} 
          icon={<BookOpen size={24} />} 
          color="#f59e0b"
          subText={`${stats.total_categories} Course Categories`}
        />
        <StatCard 
          title="Total Enrollments" 
          value={stats.total_enrollments} 
          icon={<CheckCircle size={24} />} 
          color="#10b981"
          subText="Successful registrations"
        />
        <StatCard 
          title="Active Batches" 
          value={stats.active_batches} 
          icon={<Clock size={24} />} 
          color="#8b5cf6"
          subText="Currently running live batches"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* User Distribution */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>User Role Distribution</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {stats.role_stats.map(role => (
              <div key={role.role} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '120px', fontSize: '0.9rem', color: '#475569', textTransform: 'capitalize' }}>{role.role.replace('_', ' ')}</div>
                <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${(role.count / stats.total_users) * 100}%`, height: '100%', background: 'var(--black-accent)', borderRadius: '5px' }}></div>
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600' }}>{role.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>Team Overview</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ padding: '10px', background: '#ecfdf5', color: '#10b981', borderRadius: '10px' }}><GraduationCap size={20} /></div>
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{stats.instructor_count} Instructors</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Teaching across all batches</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ padding: '10px', background: '#fef3c7', color: '#d97706', borderRadius: '10px' }}><UserPlus size={20} /></div>
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>Moderate Activity</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>System load is optimal</p>
              </div>
            </div>
          </div>
          <button style={{ width: '100%', marginTop: '30px', padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#1e293b', fontWeight: '600', cursor: 'pointer' }}>View Detailed Reports</button>
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
