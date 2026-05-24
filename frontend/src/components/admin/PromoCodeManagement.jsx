import React, { useState, useEffect, useContext } from 'react';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../api';
import CustomModal from '../CustomModal';
import { formatDate } from '../../utils/dateFormatter';
import { SiteContext } from '../../context/SiteContext';

const PromoCodeManagement = () => {
  const { showToast } = useContext(SiteContext);
  const [promoCodes, setPromoCodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const [formData, setFormData] = useState({
    code: '', discount_percentage: '', expiry_date: '', usage_limit: '', is_active: true
  });

  const fetchData = async () => {
    try {
      const res = await api.get('payments/promo-codes/');
      setPromoCodes(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateNew = () => {
    setIsEditing(false);
    setFormData({ code: '', discount_percentage: '', expiry_date: '', usage_limit: '', is_active: true });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      code: item.code,
      discount_percentage: item.discount_percentage,
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
      usage_limit: item.usage_limit || '',
      is_active: item.is_active
    });
    setShowModal(true);
  };

  const confirmDelete = (item) => {
    setPendingDelete(item);
    setNotification({ isOpen: true, type: 'confirm', title: 'Confirm Deletion', message: `Delete promo code ${item.code}?` });
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`payments/promo-codes/${pendingDelete.id}/`);
      setNotification({ isOpen: false });
      showToast('Promo code removed.', 'success');
      fetchData();
    } catch (err) {
      setNotification({ isOpen: false });
      showToast('Could not delete promo code.', 'error');
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.usage_limit) payload.usage_limit = null;
      if (!payload.expiry_date) payload.expiry_date = null;

      if (isEditing) {
        await api.put(`payments/promo-codes/${currentId}/`, payload);
        showToast('Promo code updated.', 'success');
      } else {
        await api.post('payments/promo-codes/', payload);
        showToast('Promo code created.', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast("Failed to save promo code", 'error');
    }
  };

  const filtered = searchQuery.length > 0 
    ? promoCodes.filter(p => p.code?.toLowerCase().includes(searchQuery.toLowerCase()))
    : promoCodes;

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
        <button onClick={handleCreateNew} style={{ padding: '8px 16px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}><Plus size={16} /> Add Promo Code</button>
        <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
            <input type="text" placeholder="Search codes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 35px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '10px' }}>Code</th>
              <th style={{ padding: '10px' }}>Discount</th>
              <th style={{ padding: '10px' }}>Expiry Date</th>
              <th style={{ padding: '10px' }}>Limit / Used</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontWeight: '800' }}>{item.code}</td>
                <td style={{ padding: '10px' }}>{item.discount_percentage}%</td>
                <td style={{ padding: '10px' }}>{item.expiry_date ? formatDate(item.expiry_date) : 'No Expiry'}</td>
                <td style={{ padding: '10px' }}>{item.usage_limit || '∞'} / {item.used_count || 0}</td>
                <td style={{ padding: '10px' }}>
                   <span style={{ padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', background: item.is_active ? '#dcfce7' : '#f1f5f9', color: item.is_active ? '#16a34a' : '#64748b' }}>
                      {item.is_active ? 'Active' : 'Inactive'}
                   </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleEdit(item)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer', marginRight: '10px' }}><Edit size={16} /></button>
                  <button onClick={() => confirmDelete(item)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No promo codes found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ margin: 0 }}>{isEditing ? 'Edit Promo Code' : 'Add Promo Code'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Promo Code string</label>
                <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', textTransform: 'uppercase' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Discount Percentage (%)</label>
                <input type="number" min="1" max="100" required value={formData.discount_percentage} onChange={e => setFormData({...formData, discount_percentage: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Expiry Date (Optional)</label>
                <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Usage Limit (Optional)</label>
                <input type="number" min="1" value={formData.usage_limit} onChange={e => setFormData({...formData, usage_limit: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                <label htmlFor="is_active" style={{ fontWeight: '600' }}>Is Active</label>
              </div>

              <button type="submit" style={{ width: '100%', padding: '15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}>{isEditing ? 'Save Changes' : 'Create Code'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeManagement;
