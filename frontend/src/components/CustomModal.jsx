import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Trash2, Save } from 'lucide-react';

const CustomModal = ({ isOpen, type, title, message, onConfirm, onCancel, isLoading = false }) => {
  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={56} className="text-emerald-500" />,
          color: '#10b981',
          btnText: 'Excellent',
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        };
      case 'error':
        return {
          icon: <AlertTriangle size={56} className="text-rose-500" />,
          color: '#f43f5e',
          btnText: 'Try Again',
          gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
        };
      case 'confirm':
        return {
          icon: <Trash2 size={56} className="text-amber-500" />,
          color: '#f59e0b',
          btnText: 'Yes, Delete',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        };
      default:
        return {
          icon: <Info size={56} className="text-blue-500" />,
          color: '#3b82f6',
          btnText: 'Continue',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
        };
    }
  };

  const theme = getTheme();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '28px', width: '100%', maxWidth: '420px',
        padding: '40px', textAlign: 'center', position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        animation: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={{ marginBottom: '24px', display: 'inline-flex', padding: '20px', borderRadius: '50%', background: `${theme.color}15` }}>
          {theme.icon}
        </div>

        <h2 style={{ margin: '0 0 12px', fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.025em' }}>
          {title}
        </h2>
        
        <p style={{ margin: '0 0 32px', fontSize: '1.05rem', color: '#64748b', lineHeight: '1.6' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          {type === 'confirm' ? (
            <>
              <button 
                onClick={onCancel}
                style={{
                  flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0',
                  background: '#f8fafc', color: '#64748b', fontWeight: '700', cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                onMouseOut={(e) => e.target.style.background = '#f8fafc'}
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                disabled={isLoading}
                style={{
                  flex: 1.5, padding: '14px', borderRadius: '16px', border: 'none',
                  background: theme.gradient, color: '#ffffff', fontWeight: '800', cursor: 'pointer',
                  boxShadow: `0 8px 20px ${theme.color}40`, transition: 'transform 0.2s',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Processing...' : theme.btnText}
              </button>
            </>
          ) : (
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                background: 'var(--black-accent)', color: '#ffffff', fontWeight: '800', cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Processing...' : theme.btnText}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CustomModal;
