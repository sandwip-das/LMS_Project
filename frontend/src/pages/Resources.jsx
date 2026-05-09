import React, { useContext } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StudentSidebar from '../components/StudentSidebar';
import { AuthContext } from '../context/AuthContext';

const Resources = () => {
  const { user } = useContext(AuthContext);

  return (
    <DashboardLayout sidebar={<StudentSidebar user={user} />}>
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Resources</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>This page will contain course resources and materials.</p>
      </div>
    </DashboardLayout>
  );
};

export default Resources;
