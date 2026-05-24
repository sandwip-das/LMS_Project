import React from 'react';

const DashboardLayout = ({ sidebar, children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: 'calc(100vh - 150px)', // Adjust based on navbar/footer height
      width: '100%',
      background: '#f8fafc'
    }}>
      {/* Sidebar - Left Div */}
      {sidebar && (
        <div style={{ 
          width: '250px',
          minWidth: '250px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50
        }}>
          {sidebar}
        </div>
      )}

      {/* Main Content - Right Div */}
      <div style={{ 
        flex: 1, 
        padding: '5px', // 5px padding around the div
        position: 'relative',
        overflowX: 'hidden'
      }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
