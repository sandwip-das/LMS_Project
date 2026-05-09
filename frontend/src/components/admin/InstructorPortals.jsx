import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, ExternalLink, GraduationCap } from 'lucide-react';
import api from '../../api';

const InstructorPortals = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await api.get('users/manage/');
      // Show both Instructors and TAs in the portal list
      const staff = res.data.filter(u => ['instructor', 'teaching_assistant'].includes(u.role));
      setInstructors(staff);
    } catch (err) {
      console.error("Failed to load instructors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const filtered = instructors.filter(ins => 
    ins.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ins.first_name + ' ' + ins.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    ins.user_id_custom?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ marginBottom: '10px' }}>Instructor Portals</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Access and monitor individual instructor dashboards and course progress.</p>
        </div>
        <div style={{ position: 'relative', width: '400px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, Name, or Mobile..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {filtered.length > 0 ? filtered.map(ins => (
          <div key={ins.id} className="glass-card" style={{ padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--black-accent)' }}>
                {ins.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{ins.first_name} {ins.last_name}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                   {ins.role.replace('_', ' ').toUpperCase()} (ID: {ins.user_id_custom || 'N/A'})
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                <Mail size={16} className="text-slate-400" /> {ins.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                <Phone size={16} className="text-slate-400" /> {ins.mobile_number || 'No Phone Registered'}
              </div>
            </div>

            <button style={{ width: '100%', marginTop: '25px', padding: '12px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '700' }}>
              View Instructor Portal <ExternalLink size={16} />
            </button>
          </div>
        )) : (
          <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
            {loading ? "Synchronizing portals..." : "No instructors found. Make sure users are registered with the 'Instructor' role."}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorPortals;
