import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Layout, CheckCircle, Package } from 'lucide-react';

const ProjectDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const project = state?.project;

  if (!project) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <h2>Project details not found.</h2>
        <button onClick={() => navigate(-1)} className="btn-primary" style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '10px' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '50px 0' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', marginBottom: '30px' }}
        >
          <ArrowLeft size={18} /> Back to Course
        </button>

        <div className="glass-card" style={{ background: 'white', borderRadius: '32px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <img 
            src={project.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200'} 
            style={{ width: '100%', height: '450px', objectFit: 'cover' }} 
          />
          
          <div style={{ padding: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', fontSize: '0.9rem' }}>
              <Layout size={20} /> Industrial Capstone Project
            </div>
            
            <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '25px', lineHeight: '1.1' }}>{project.name}</h1>
            
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#475569', fontSize: '1.15rem', marginBottom: '50px' }}>
              {project.description}
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package color="var(--accent-primary)" /> Tools & Technologies Used
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {project.tools_learned && project.tools_learned.length > 0 ? (
                  project.tools_learned.map((tool, i) => (
                    <div key={i} style={{ padding: '15px 25px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} color="var(--success)" /> {tool.name || tool}
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#94a3b8' }}>Tools list not specified.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
