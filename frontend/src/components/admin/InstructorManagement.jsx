import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, GraduationCap, Users, Mail, Phone, ExternalLink, X, Save, Calendar } from 'lucide-react';
import api from '../../api';
import CustomModal from '../CustomModal';
import { formatDate } from '../../utils/dateFormatter';

const InstructorManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Form States
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '', username: '', email: '', mobile_number: '', user_id_custom: '', role: ''
  });

  // Notification States
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('users/manage/');
      const staffMembers = res.data.filter(u => ['instructor', 'teaching_assistant'].includes(u.role));
      setStaff(staffMembers);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const notify = (type, title, message) => setNotification({ isOpen: true, type, title, message });

  const handleEdit = (member) => {
    setCurrentMember(member);
    setFormData({
      full_name: member.first_name + ' ' + (member.last_name || ''),
      username: member.username,
      email: member.email,
      mobile_number: member.mobile_number || '',
      user_id_custom: member.user_id_custom || '',
      role: member.role
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`users/manage/${currentMember.id}/`, formData);
      notify('success', 'Updated!', 'Instructor data has been successfully updated.');
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      notify('error', 'Update Failed', 'Could not save changes to instructor record.');
    }
  };

  const confirmDelete = (member) => {
    setPendingDelete(member);
    notify('confirm', 'Remove Instructor?', `Are you sure you want to delete ${member.username}'s account? This cannot be undone.`);
  };

  const executeDelete = async () => {
    try {
      await api.delete(`users/manage/${pendingDelete.id}/`);
      setNotification({ ...notification, isOpen: false });
      notify('success', 'Deleted!', 'Instructor account has been removed.');
      fetchData();
    } catch (err) {
      console.error("Delete Error:", err);
      let errorMsg = 'Could not remove instructor.';
      if (err.response?.data) {
        if (typeof err.response.data.error === 'string') errorMsg = err.response.data.error;
        else if (typeof err.response.data === 'string') errorMsg = err.response.data;
        else if (typeof err.response.data === 'object') {
          // Flatten DRF validation errors if any
          errorMsg = Object.values(err.response.data).flat().join(", ");
        }
      }
      notify('error', 'Action Failed', errorMsg);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user_id_custom?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '30px' }}>
      <CustomModal 
        isOpen={notification.isOpen} type={notification.type} title={notification.title} message={notification.message} 
        onConfirm={notification.type === 'confirm' ? executeDelete : () => setNotification({ ...notification, isOpen: false })}
        onCancel={() => setNotification({ ...notification, isOpen: false })}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
           <h2 style={{ margin: 0 }}>Instructor Management</h2>
           <p style={{ color: '#64748b', margin: '5px 0 0' }}>Manage all Instructors and Teaching Assistants profiles and accounts.</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input 
            type="text" placeholder="Search instructors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {filteredStaff.map(member => (
          <div key={member.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ width: '55px', height: '55px', borderRadius: '50%', background: 'var(--black-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1.4rem' }}>
                {member.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{member.first_name} {member.last_name}</h4>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: member.role === 'instructor' ? '#6366f1' : '#10b981', background: member.role === 'instructor' ? '#eef2ff' : '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                  {member.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}><Mail size={16} /> {member.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}><GraduationCap size={16} /> ID: {member.user_id_custom || 'N/A'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#475569' }}><Calendar size={16} /> Joined: {formatDate(member.date_joined)}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
               <button onClick={() => handleEdit(member)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>Edit Account</button>
               <button onClick={() => confirmDelete(member)} style={{ flex: 1, padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700' }}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '600px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ margin: 0 }}>Edit Instructor Details</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Full Name</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Enter full name" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Instructor ID</label>
                <input type="text" value={formData.user_id_custom} onChange={(e) => setFormData({...formData, user_id_custom: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Custom ID" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Account Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                   <option value="instructor">Instructor</option>
                   <option value="teaching_assistant">Teaching Assistant</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="instructor@example.com" />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, padding: '15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                  <Save size={20} /> Update Instructor Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorManagement;
