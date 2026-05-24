import React, { createContext, useState, useEffect, useCallback } from 'react';
import api, { BASE_URL } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_name: '',
    website_title: '',
    site_logo: null,
    favicon: null,
    footer_description: "",
    copyright_text: '',
    contact_email: '',
    contact_address: '',
    facebook_url: '', twitter_url: '', instagram_url: '', linkedin_url: '', youtube_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 6000);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('users/settings/');
      const data = res.data;
      
      const formatUrl = (url) => url && url.startsWith('/') ? `${BASE_URL}${url}` : url;
      data.site_logo = formatUrl(data.site_logo);
      data.favicon = formatUrl(data.favicon);
      data.hero_image = formatUrl(data.hero_image);
      
      ['facebook_icon', 'twitter_icon', 'instagram_icon', 'linkedin_icon', 'youtube_icon'].forEach(k => {
        data[k] = formatUrl(data[k]);
      });
      
      setSettings(data);
      if (data.website_title) document.title = data.website_title;
      
      if (data.favicon) {
        let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = data.favicon;
        if (!document.querySelector("link[rel~='icon']")) document.head.appendChild(link);
      }
    } catch (err) {
      console.error("Site settings error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const getToastConfig = (type) => {
    const configs = {
      success: { icon: <CheckCircle2 size={20} color="#10b981" />, border: '#10b981', bg: '#ecfdf5' },
      error: { icon: <XCircle size={20} color="#ef4444" />, border: '#ef4444', bg: '#fef2f2' },
      warning: { icon: <AlertTriangle size={20} color="#f59e0b" />, border: '#f59e0b', bg: '#fffbeb' },
      info: { icon: <Info size={20} color="#2563eb" />, border: '#2563eb', bg: '#eff6ff' }
    };
    return configs[type] || configs.info;
  };

  const toastCfg = getToastConfig(toast.type);

  return (
    <SiteContext.Provider value={{ settings, loading, fetchSettings, showToast }}>
      {children}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: '-50%' }}
            style={{
              position: 'fixed', bottom: '40px', left: '50%', zIndex: 9999,
              padding: '16px 24px', borderRadius: '16px', minWidth: '320px', maxWidth: '500px',
              display: 'flex', alignItems: 'center', gap: '15px',
              background: toastCfg.bg, borderLeft: `5px solid ${toastCfg.border}`,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            {toastCfg.icon}
            <p style={{ margin: 0, flex: 1, fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteContext.Provider>
  );
};
