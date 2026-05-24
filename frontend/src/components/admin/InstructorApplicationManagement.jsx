import React, { useState, useEffect, useContext } from 'react';
import { Search, Edit, Trash2, X, ExternalLink, Download } from 'lucide-react';
import api from '../../api';
import CustomModal from '../CustomModal';
import { formatDate } from '../../utils/dateFormatter';
import { SiteContext } from '../../context/SiteContext';

const InstructorApplicationManagement = () => {
  const { showToast } = useContext(SiteContext);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const [formData, setFormData] = useState({
    status: 'pending'
  });

  const fetchData = async () => {
    try {
      const [appRes, usrRes] = await Promise.all([
        api.get('users/instructor-applications/'),
        api.get('users/manage/')
      ]);
      setApplications(appRes.data);
      setUsers(usrRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (item) => {
    setCurrentId(item.id);
    setFormData({
      status: item.status || 'pending'
    });
    setShowModal(true);
  };

  const confirmDelete = (item) => {
    setPendingDelete(item);
    setNotification({ isOpen: true, type: 'confirm', title: 'Confirm Deletion', message: `Delete instructor application?` });
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`users/instructor-applications/${pendingDelete.id}/`);
      setNotification({ isOpen: false });
      showToast('Application removed.', 'success');
      fetchData();
    } catch (err) {
      setNotification({ isOpen: false });
      showToast('Could not delete application.', 'error');
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const app = applications.find(a => a.id === currentId);
      await api.patch(`users/instructor-applications/${currentId}/`, { status: formData.status });
      
      // Implement property: Update user role to instructor if approved
      if (formData.status === 'approved' && app) {
        const userId = app.user?.id || app.user;
        await api.patch(`users/manage/${userId}/`, { role: 'instructor' });
        showToast('Application approved and user role updated to Instructor.', 'success');
      } else {
        showToast('Application status updated.', 'success');
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast("Failed to save application status", 'error');
    }
  };

  const filtered = searchQuery.length > 0 
    ? applications.filter(a => users.find(u => u.id === (a.user?.id || a.user))?.email?.includes(searchQuery))
    : applications;

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

      <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
            <input type="text" placeholder="Search by Email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 35px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '10px' }}>Applicant</th>
              <th style={{ padding: '10px' }}>Experience</th>
              <th style={{ padding: '10px' }}>Portfolio</th>
              <th style={{ padding: '10px' }}>Resume</th>
              <th style={{ padding: '10px' }}>Applied On</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const u = users.find(x => x.id === (item.user?.id || item.user));
              return (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontWeight: '600' }}>{u ? u.email : item.user}</td>
                <td style={{ padding: '10px' }}>{item.experience_years} Years</td>
                <td style={{ padding: '10px' }}>
                  {item.portfolio_url ? <a href={item.portfolio_url} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}><ExternalLink size={14}/> View</a> : '-'}
                </td>
                <td style={{ padding: '10px' }}>
                  {item.resume ? <a href={item.resume} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}><Download size={14}/> Download</a> : '-'}
                </td>
                <td style={{ padding: '10px' }}>{formatDate(item.applied_at || item.created_at)}</td>
                <td style={{ padding: '10px' }}>
                   <span style={{ padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', background: item.status === 'approved' ? '#dcfce7' : item.status === 'pending' ? '#fef3c7' : '#fee2e2', color: item.status === 'approved' ? '#16a34a' : item.status === 'pending' ? '#d97706' : '#ef4444' }}>
                      {item.status}
                   </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleEdit(item)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer', marginRight: '10px' }} title="Update Status"><Edit size={16} /></button>
                  <button onClick={() => confirmDelete(item)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            )})}
            {filtered.length === 0 && <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No applications found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ margin: 0 }}>Review Application</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Application Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   <option value="pending">Pending</option>
                   <option value="approved">Approved</option>
                   <option value="rejected">Rejected</option>
                </select>
                {formData.status === 'approved' && <p style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '5px' }}>Approving will automatically update the user's role to Instructor.</p>}
              </div>

              <button type="submit" style={{ width: '100%', padding: '15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}>Save Decision</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorApplicationManagement;
