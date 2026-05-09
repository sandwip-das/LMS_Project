import React, { useState, useEffect, useContext } from 'react';
import { Search, Plus, Edit, Trash2, X, AlertCircle, Eye, EyeOff, Calendar } from 'lucide-react';
import api from '../../api';
import CustomModal from '../CustomModal';
import { formatDate } from '../../utils/dateFormatter';
import { SiteContext } from '../../context/SiteContext';
import { useFormPersist } from '../../hooks/useFormPersist';

const UserManagement = () => {
  const { showToast } = useContext(SiteContext);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '', mobile_number: '', email: '', user_id_custom: '', password: '', confirm_password: '', role: 'student'
  });

  // Auto-save and restore form draft
  const { clearDraft } = useFormPersist('user_mgmt', formData, setFormData, showModal);

  const fetchUsers = async () => {
    try {
      const res = await api.get('users/manage/');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateNew = () => {
    setIsEditing(false);
    setFormData({ full_name: '', mobile_number: '', email: '', user_id_custom: '', password: '', confirm_password: '', role: 'student' });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      full_name: user.first_name + ' ' + (user.last_name || ''),
      mobile_number: user.mobile_number || '',
      email: user.email,
      user_id_custom: user.user_id_custom || '',
      role: user.role,
      password: '',
      confirm_password: ''
    });
    setShowModal(true);
  };

  const confirmDelete = (user) => {
    setPendingDelete(user);
    setNotification({ isOpen: true, type: 'confirm', title: 'Confirm Deletion', message: `Are you sure you want to delete ${user.username}? This action is permanent.` });
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`users/manage/${pendingDelete.id}/`);
      setNotification({ isOpen: false, title: '', message: '', type: 'success' });
      showToast('User has been successfully removed from the system.', 'success');
      fetchUsers();
    } catch (err) {
      setNotification({ isOpen: false, title: '', message: '', type: 'error' });
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || "Could not delete user.";
      showToast(errorMsg, 'error');
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const validateForm = () => {
    const { email, mobile_number, user_id_custom, password, confirm_password } = formData;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email.', 'warning'); return false; }
    if (!/^\d{9,15}$/.test(mobile_number)) { showToast('Mobile must be 9-15 digits.', 'warning'); return false; }
    if (user_id_custom && user_id_custom.length < 8) { showToast('User ID must be at least 8 digits.', 'warning'); return false; }
    if (!isEditing && password !== confirm_password) { showToast('Passwords do not match!', 'warning'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = { ...formData };
      payload.username = payload.email;
      delete payload.confirm_password;
      
      if (isEditing && !payload.password) { 
        delete payload.password; 
      }
      
      if (isEditing) {
        await api.put(`users/manage/${currentUser.id}/`, payload);
        showToast('User data has been successfully updated.', 'success');
      } else {
        await api.post('users/manage/', payload);
        showToast('New user account has been created successfully.', 'success');
      }
      setShowModal(false);
      clearDraft();
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data ? Object.values(err.response.data).flat().join(", ") : "Failed to save user", 'error');
    }
  };

  const filteredUsers = searchQuery.length > 0 
    ? users.filter(u => u.user_id_custom?.toLowerCase().includes(searchQuery.toLowerCase()) || u.mobile_number?.includes(searchQuery))
    : users;

  return (
    <div style={{ padding: '30px' }}>
      <CustomModal 
        isOpen={notification.isOpen} 
        type={notification.type} 
        title={notification.title} 
        message={notification.message} 
        onConfirm={notification.type === 'confirm' ? executeDelete : () => setNotification({ ...notification, isOpen: false })}
        onCancel={() => setNotification({ ...notification, isOpen: false })}
        isLoading={isDeleting}
      />

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button onClick={handleCreateNew} style={{ padding: '12px 24px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><Plus size={18} /> Create New User</button>
        <button onClick={() => setViewMode(viewMode === 'search' ? 'list' : 'search')} style={{ padding: '12px 24px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><Search size={18} /> {viewMode === 'search' ? 'Back to List' : 'Search User'}</button>
      </div>

      {viewMode === 'search' && (
        <div style={{ marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
            <input type="text" placeholder="Search by User ID or Mobile Number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '15px' }}>SL</th>
              <th style={{ padding: '15px' }}>Full Name</th>
              <th style={{ padding: '15px' }}>Mobile</th>
              <th style={{ padding: '15px' }}>Email</th>
              <th style={{ padding: '15px' }}>User ID</th>
              <th style={{ padding: '15px' }}>Joined</th>
              <th style={{ padding: '15px' }}>Role</th>
              <th style={{ padding: '15px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px' }}>{i + 1}</td>
                <td style={{ padding: '15px', fontWeight: '600' }}>
                  {(u.first_name || u.last_name) ? `${u.first_name} ${u.last_name || ''}` : u.username}
                </td>
                <td style={{ padding: '15px' }}>{u.mobile_number}</td>
                <td style={{ padding: '15px' }}>{u.email}</td>
                <td style={{ padding: '15px' }}>{u.user_id_custom}</td>
                <td style={{ padding: '15px' }}>{formatDate(u.date_joined)}</td>
                <td style={{ padding: '15px' }}>
                  {u.is_superuser ? (
                    <span style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>Super User</span>
                  ) : (u.role && u.role !== 'student') ? (
                    <span style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                      {u.role.replace('_', ' ')}
                    </span>
                  ) : null}
                </td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleEdit(u)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer', marginRight: '10px' }}><Edit size={18} /></button>
                  <button onClick={() => confirmDelete(u)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ margin: 0 }}>{isEditing ? 'Edit User Record' : 'Add New User'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Full Name</label>
                <input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Enter full name" />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Mobile Number</label>
                <input type="text" required value={formData.mobile_number} onChange={(e) => setFormData({...formData, mobile_number: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="9-15 digits" />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email Address</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="email@example.com" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>User ID</label>
                <input type="text" value={formData.user_id_custom} onChange={(e) => setFormData({...formData, user_id_custom: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Custom account ID" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>User Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                   <option value="administrator">Administrator</option>
                   <option value="moderator">Moderator</option>
                   <option value="instructor">Instructor</option>
                   <option value="teaching_assistant">Teaching Assistant</option>
                </select>
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPasswords ? "text" : "password"} required={!isEditing} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', paddingRight: '45px' }} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                    {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

               <div style={{ position: 'relative' }}>
                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Confirm Password</label>
                 <div style={{ position: 'relative' }}>
                   <input type={showPasswords ? "text" : "password"} required={!isEditing} value={formData.confirm_password} onChange={(e) => setFormData({...formData, confirm_password: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', paddingRight: '45px' }} placeholder="••••••••" />
                   <button type="button" onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                     {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                   </button>
                 </div>
                 {formData.confirm_password && (
                   <p style={{ 
                     fontSize: '0.75rem', marginTop: '5px', fontWeight: '700',
                     color: formData.password === formData.confirm_password ? '#10b981' : '#ef4444' 
                   }}>
                     {formData.password === formData.confirm_password ? '✓ Passwords Match' : '✗ Passwords do not match'}
                   </p>
                 )}
               </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, padding: '15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>{isEditing ? 'Save Changes' : 'Create Account'}</button>
                {isEditing && <button type="button" onClick={() => confirmDelete(currentUser)} style={{ padding: '15px 30px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>Delete</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
