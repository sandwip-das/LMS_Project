import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import { SiteContext } from '../context/SiteContext';
import { useFormPersist } from '../hooks/useFormPersist';

const Register = () => {
  const { showToast } = useContext(SiteContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ full_name: '', identifier: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { clearDraft } = useFormPersist('register', formData, setFormData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      if (!formData.identifier) {
        showToast("Please provide an Email or Mobile Number.", "error");
        setLoading(false);
        return;
      }

      const isEmail = formData.identifier.includes('@');
      
      await api.post('users/register/', {
        full_name: formData.full_name,
        username: formData.identifier, 
        email: isEmail ? formData.identifier : '',
        mobile_number: isEmail ? '' : formData.identifier,
        password: formData.password
      });
      showToast("Registration successful! Please login to continue.", "success");
      clearDraft();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. This email or mobile may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const isMatching = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const isNotEmpty = formData.password && formData.confirmPassword;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '15px', background: '#f8fafc' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '500px', padding: '35px 40px', borderRadius: '32px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#0f172a', fontWeight: '900' }}>Join the Journey</h2>
          <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.95rem' }}>Create your account to start learning</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe" 
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', transition: '0.2s' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>Email or Mobile Number</label>
            <input 
              type="text" 
              placeholder="name@example.com or 017XXXXXXXX" 
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>Password</label>
            <input 
              type={showPass ? "text" : "password"} 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '0.95rem', paddingRight: '45px', outline: 'none' }}
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: '12px', top: '35px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>Confirm Password</label>
            <input 
              type={showPass ? "text" : "password"} 
              placeholder="••••••••" 
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              style={{ 
                width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid', 
                borderColor: isNotEmpty ? (isMatching ? '#22c55e' : '#ef4444') : '#e2e8f0',
                fontSize: '0.95rem', paddingRight: '45px', outline: 'none'
              }}
            />
            {isNotEmpty && (
              <div style={{ position: 'absolute', right: '12px', top: '35px', color: isMatching ? '#22c55e' : '#ef4444' }}>
                {isMatching ? <CheckCircle size={18} /> : <XCircle size={18} />}
              </div>
            )}
            {isNotEmpty && (
              <p style={{ 
                margin: '5px 0 0', fontSize: '0.75rem', fontWeight: '800',
                color: isMatching ? '#22c55e' : '#ef4444' 
              }}>
                {isMatching ? '✓ Password matches' : '✗ Password did not match'}
              </p>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', padding: '16px', borderRadius: '16px', background: '#0f172a', color: 'white', 
              border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', transition: 'all 0.3s' 
            }}
          >
            {loading ? 'Creating Account...' : <><UserPlus size={20} /> Sign Up Free</>}
          </motion.button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: '800', textDecoration: 'none', marginLeft: '5px' }}>Login here <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
