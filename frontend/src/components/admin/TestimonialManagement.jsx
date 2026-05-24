import React, { useState, useEffect, useContext } from 'react';
import { Search, Plus, Edit, Trash2, X, Star } from 'lucide-react';
import api from '../../api';
import CustomModal from '../CustomModal';
import { formatDate } from '../../utils/dateFormatter';
import { SiteContext } from '../../context/SiteContext';

const TestimonialManagement = () => {
  const { showToast } = useContext(SiteContext);
  const [testimonials, setTestimonials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const [formData, setFormData] = useState({
    user: '', course: '', content: '', rating: '5'
  });

  const fetchData = async () => {
    try {
      const [tstRes, crsRes, usrRes] = await Promise.all([
        api.get('lms/testimonials/'),
        api.get('lms/courses/?admin_view=true'),
        api.get('users/manage/')
      ]);
      setTestimonials(tstRes.data);
      setCourses(crsRes.data);
      setUsers(usrRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateNew = () => {
    setIsEditing(false);
    setFormData({ user: '', course: '', content: '', rating: '5' });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      user: item.user?.id || item.user,
      course: item.course?.id || item.course,
      content: item.content || '',
      rating: item.rating || '5'
    });
    setShowModal(true);
  };

  const confirmDelete = (item) => {
    setPendingDelete(item);
    setNotification({ isOpen: true, type: 'confirm', title: 'Confirm Deletion', message: `Are you sure you want to delete this testimonial?` });
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`lms/testimonials/${pendingDelete.id}/`);
      setNotification({ isOpen: false });
      showToast('Testimonial removed.', 'success');
      fetchData();
    } catch (err) {
      setNotification({ isOpen: false });
      showToast('Could not delete testimonial.', 'error');
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
        await api.put(`lms/testimonials/${currentId}/`, payload);
        showToast('Testimonial updated.', 'success');
      } else {
        await api.post('lms/testimonials/', payload);
        showToast('New testimonial added.', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast("Failed to save testimonial", 'error');
    }
  };

  const filtered = searchQuery.length > 0 
    ? testimonials.filter(t => t.content?.toLowerCase().includes(searchQuery.toLowerCase()) || users.find(u => u.id === (t.user?.id || t.user))?.email?.includes(searchQuery))
    : testimonials;

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

      <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', justifyContent: 'space-between' }}>
        <button onClick={handleCreateNew} style={{ padding: '8px 16px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}><Plus size={16} /> Add Testimonial</button>
        <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
            <input type="text" placeholder="Search content..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 35px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filtered.map(item => {
          const u = users.find(x => x.id === (item.user?.id || item.user));
          const c = courses.find(x => x.id === (item.course?.id || item.course));
          return (
            <div key={item.id} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                   <div style={{ fontWeight: '800', color: '#1e293b' }}>{u ? (u.first_name || u.email) : 'User'}</div>
                   <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c ? c.title : 'General'}</div>
                 </div>
                 <div style={{ display: 'flex', color: '#f59e0b', alignItems: 'center' }}>
                   {item.rating} <Star size={14} fill="currentColor" style={{ marginLeft: '4px' }}/>
                 </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#334155', fontStyle: 'italic', lineHeight: '1.5' }}>"{item.content}"</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                 <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formatDate(item.created_at)}</div>
                 <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => handleEdit(item)} style={{ color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer' }}><Edit size={16}/></button>
                    <button onClick={() => confirmDelete(item)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                 </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No testimonials found.</div>}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ margin: 0 }}>{isEditing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Rating (1-5)</label>
                <select required value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Review Content</label>
                <textarea required rows="4" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Student's review..."></textarea>
              </div>

              <button type="submit" style={{ width: '100%', padding: '15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}>{isEditing ? 'Save Changes' : 'Create Testimonial'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManagement;
