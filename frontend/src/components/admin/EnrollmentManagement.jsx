import React, { useState, useEffect, useContext } from 'react';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../api';
import CustomModal from '../CustomModal';
import { formatDate } from '../../utils/dateFormatter';
import { SiteContext } from '../../context/SiteContext';

const EnrollmentManagement = () => {
  const { showToast } = useContext(SiteContext);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const [formData, setFormData] = useState({
    user: '', course: '', batch: '', status: 'active'
  });

  const fetchData = async () => {
    try {
      const [enrRes, crsRes, usrRes] = await Promise.all([
        api.get('lms/enrollments/'),
        api.get('lms/courses/?admin_view=true'),
        api.get('users/manage/')
      ]);
      setEnrollments(enrRes.data);
      setCourses(crsRes.data);
      setUsers(usrRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateNew = () => {
    setIsEditing(false);
    setFormData({ user: '', course: '', batch: '', status: 'active' });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      user: item.user?.id || item.user,
      course: item.course?.id || item.course,
      batch: item.batch || '',
      status: item.status || 'active'
    });
    setShowModal(true);
  };

  const confirmDelete = (item) => {
    setPendingDelete(item);
    setNotification({ isOpen: true, type: 'confirm', title: 'Confirm Deletion', message: `Are you sure you want to delete this enrollment?` });
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`lms/enrollments/${pendingDelete.id}/`);
      setNotification({ isOpen: false, title: '', message: '', type: 'success' });
      showToast('Enrollment has been removed.', 'success');
      fetchData();
    } catch (err) {
      setNotification({ isOpen: false, title: '', message: '', type: 'error' });
      showToast('Could not delete enrollment.', 'error');
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      if (isEditing) {
        await api.put(`lms/enrollments/${currentId}/`, payload);
        showToast('Enrollment updated.', 'success');
      } else {
        await api.post('lms/enrollments/', payload);
        showToast('New enrollment created.', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast("Failed to save enrollment", 'error');
    }
  };

  const filtered = searchQuery.length > 0 
    ? enrollments.filter(e => e.user?.email?.includes(searchQuery) || e.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : enrollments;

  return (
    <div style={{ padding: '0px' }}>
      <CustomModal 
        isOpen={notification.isOpen} 
        type={notification.type} 
        title={notification.title} 
        message={notification.message} 
        onConfirm={notification.type === 'confirm' ? executeDelete : () => setNotification({ ...notification, isOpen: false })}
        onCancel={() => setNotification({ ...notification, isOpen: false })}
        isLoading={isDeleting}
      />

      <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
        <button onClick={handleCreateNew} style={{ padding: '5px 10px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', fontSize: '0.85rem' }}><Plus size={16} /> Create Enrollment</button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '8px' }}>User</th>
              <th style={{ padding: '8px' }}>Course</th>
              <th style={{ padding: '8px' }}>Batch</th>
              <th style={{ padding: '8px' }}>Enrolled On</th>
              <th style={{ padding: '8px' }}>Status</th>
              <th style={{ padding: '8px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const u = users.find(x => x.id === (item.user?.id || item.user));
              const c = courses.find(x => x.id === (item.course?.id || item.course));
              return (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px' }}>{u ? u.email : item.user}</td>
                <td style={{ padding: '8px', fontWeight: '600' }}>{c ? c.title : item.course}</td>
                <td style={{ padding: '8px', color: '#64748b' }}>{item.batch ? `Batch ${item.batch}` : '-'}</td>
                <td style={{ padding: '8px' }}>{formatDate(item.enrolled_on || item.created_at)}</td>
                <td style={{ padding: '8px' }}>
                   <span style={{ padding: '4px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', background: item.status === 'active' ? '#dcfce7' : '#fee2e2', color: item.status === 'active' ? '#16a34a' : '#ef4444' }}>
                      {item.status || 'Active'}
                   </span>
                </td>
                <td style={{ padding: '8px' }}>
                  <button onClick={() => handleEdit(item)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer', marginRight: '10px' }}><Edit size={16} /></button>
                  <button onClick={() => confirmDelete(item)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            )})}
            {filtered.length === 0 && <tr><td colSpan="6" style={{ padding: '15px', textAlign: 'center', color: '#94a3b8' }}>No enrollments found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ margin: 0 }}>{isEditing ? 'Edit Enrollment' : 'Add Enrollment'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Student</label>
                <select required value={formData.user} onChange={(e) => setFormData({...formData, user: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   <option value="">Select User...</option>
                   {users.map(u => <option key={u.id} value={u.id}>{u.email} ({u.first_name})</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Course</label>
                <select required value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   <option value="">Select Course...</option>
                   {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Batch Number</label>
                <input type="number" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="e.g. 1 (Optional)" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   <option value="active">Active</option>
                   <option value="inactive">Inactive</option>
                   <option value="completed">Completed</option>
                </select>
              </div>

              <button type="submit" style={{ width: '100%', padding: '15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}>{isEditing ? 'Save Changes' : 'Create Enrollment'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;
