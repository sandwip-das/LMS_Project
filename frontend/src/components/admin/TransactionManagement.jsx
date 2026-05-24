import React, { useState, useEffect, useContext } from 'react';
import { Search, Edit, Trash2, X, RefreshCw } from 'lucide-react';
import api from '../../api';
import CustomModal from '../CustomModal';
import { formatDate } from '../../utils/dateFormatter';
import { SiteContext } from '../../context/SiteContext';

const TransactionManagement = () => {
  const { showToast } = useContext(SiteContext);
  const [transactions, setTransactions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const [formData, setFormData] = useState({
    status: 'success'
  });

  const fetchData = async () => {
    try {
      const [txnRes, crsRes, usrRes] = await Promise.all([
        api.get('payments/transactions/'),
        api.get('lms/courses/?admin_view=true'),
        api.get('users/manage/')
      ]);
      setTransactions(txnRes.data);
      setCourses(crsRes.data);
      setUsers(usrRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (item) => {
    setCurrentId(item.id);
    setFormData({
      status: item.status || 'success'
    });
    setShowModal(true);
  };

  const confirmDelete = (item) => {
    setPendingDelete(item);
    setNotification({ isOpen: true, type: 'confirm', title: 'Confirm Deletion', message: `Delete transaction ${item.transaction_id}?` });
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`payments/transactions/${pendingDelete.id}/`);
      setNotification({ isOpen: false });
      showToast('Transaction removed.', 'success');
      fetchData();
    } catch (err) {
      setNotification({ isOpen: false });
      showToast('Could not delete transaction.', 'error');
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`payments/transactions/${currentId}/`, { status: formData.status });
      showToast('Transaction status updated.', 'success');
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast("Failed to save transaction", 'error');
    }
  };

  const filtered = searchQuery.length > 0 
    ? transactions.filter(t => t.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) || users.find(u => u.id === (t.user?.id || t.user))?.email?.includes(searchQuery))
    : transactions;

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
        <button onClick={fetchData} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}><RefreshCw size={16} /> Refresh</button>
        <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
            <input type="text" placeholder="Search by Txn ID or Email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 35px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '10px' }}>Txn ID</th>
              <th style={{ padding: '10px' }}>User</th>
              <th style={{ padding: '10px' }}>Course (Batch)</th>
              <th style={{ padding: '10px' }}>Amount</th>
              <th style={{ padding: '10px' }}>Promo</th>
              <th style={{ padding: '10px' }}>Method</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const u = users.find(x => x.id === (item.user?.id || item.user));
              const c = courses.find(x => x.id === (item.course?.id || item.course));
              return (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontWeight: '800' }}>{item.transaction_id || 'N/A'}</td>
                <td style={{ padding: '10px' }}>{u ? u.email : item.user}</td>
                <td style={{ padding: '10px', fontWeight: '600' }}>
                  {c ? c.title : item.course} 
                  {item.batch ? <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '5px' }}>(B{item.batch})</span> : ''}
                </td>
                <td style={{ padding: '10px', fontWeight: '800', color: '#0ea5e9' }}>৳{item.amount}</td>
                <td style={{ padding: '10px', color: '#8b5cf6', fontWeight: '700' }}>{item.promo_code ? item.promo_code : '-'}</td>
                <td style={{ padding: '10px', textTransform: 'uppercase' }}>{item.payment_method}</td>
                <td style={{ padding: '10px' }}>
                   <span style={{ padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', background: item.status === 'success' ? '#dcfce7' : item.status === 'pending' ? '#fef3c7' : '#fee2e2', color: item.status === 'success' ? '#16a34a' : item.status === 'pending' ? '#d97706' : '#ef4444' }}>
                      {item.status}
                   </span>
                </td>
                <td style={{ padding: '10px' }}>{formatDate(item.created_at)}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleEdit(item)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer', marginRight: '10px' }} title="Update Status"><Edit size={16} /></button>
                  <button onClick={() => confirmDelete(item)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            )})}
            {filtered.length === 0 && <tr><td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No transactions found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ margin: 0 }}>Update Transaction</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Payment Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   <option value="success">Success</option>
                   <option value="pending">Pending</option>
                   <option value="failed">Failed</option>
                </select>
              </div>

              <button type="submit" style={{ width: '100%', padding: '15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
