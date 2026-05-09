import React, { useState } from 'react';
import api from '../api';
import { KeyRound, ShieldCheck, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`users/password-reset/${uidb64}/${token}/`, { password });
      setMessage('Password reset successful! Redirecting to login...');
      setError(false);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage('Error resetting password. Link may be expired or invalid.');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#f8fafc', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '32px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#16a34a' }}>
            <ShieldCheck size={30} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>New Password</h2>
          <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: '0.95rem' }}>Secure your account with a fresh password.</p>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: error ? '#fef2f2' : '#f0fdf4', 
              color: error ? '#991b1b' : '#166534', 
              padding: '12px', borderRadius: '12px', marginBottom: '25px', textAlign: 'center', 
              fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', 
              border: `1px solid ${error ? '#fee2e2' : '#dcfce7'}` 
            }}
          >
            {error ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
            {message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>New Secure Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            type="submit" 
            style={{ 
              width: '100%', padding: '16px', background: '#0f172a', color: 'white', 
              border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1.1rem', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              gap: '12px', marginTop: '10px', boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.3)' 
            }}
          >
            {loading ? 'Updating...' : <><ShieldCheck size={20} /> Update Password</>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
