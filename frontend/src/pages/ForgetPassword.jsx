import React, { useState } from 'react';
import api from '../api';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(false);
    try {
      const res = await api.post('users/password-reset/', { email });
      setMessage(res.data.message || 'Check your email for the reset link.');
      setError(false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error sending reset link.';
      setMessage(errorMsg);
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
        transition={{ duration: 0.4 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '32px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#2563eb' }}>
            <Mail size={30} />
          </div>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>Forgot Password?</h2>
          <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>No worries! Enter your email and we'll send you reset instructions.</p>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              color: error ? '#991b1b' : '#166534', 
              marginBottom: '25px', 
              textAlign: 'center',
              padding: '15px',
              borderRadius: '16px',
              backgroundColor: error ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${error ? '#fee2e2' : '#dcfce7'}`,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: 'center'
            }}
          >
            {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: '0.2s' }}
            />
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
              gap: '12px', marginTop: '5px', boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.3)' 
            }}
          >
            {loading ? 'Sending...' : <><Send size={20} /> Send Reset Link</>}
          </motion.button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={18} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgetPassword;
