import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, KeyRound, User, ArrowRight, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SiteContext } from '../context/SiteContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(SiteContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      showToast('Welcome back! You have logged in successfully.', 'success');
      navigate('/');
    } catch (err) {
      showToast('Your Email ID/ Mobile Number and Password is Incorrect, Please provide correct information.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', background: '#f8fafc', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '32px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '900', color: '#0f172a' }}>Welcome Back</h2>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '1rem' }}>Enter your details to access your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>Email or Mobile</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="name@example.com or mobile" 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: '0.2s' }}
              />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>Password</label>
              <Link to="/forget-password" style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: '0.2s' }}
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
            {loading ? 'Signing in...' : <><LogIn size={20} /> Sign In</>}
          </motion.button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
          New here? <Link to="/register" style={{ color: '#2563eb', fontWeight: '800', textDecoration: 'none', marginLeft: '5px' }}>Create an account <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
