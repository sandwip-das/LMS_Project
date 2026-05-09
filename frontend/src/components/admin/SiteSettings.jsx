import React, { useState, useEffect, useContext } from 'react';
import { Save, Image as ImageIcon, Globe, MessageSquare, Info, X } from 'lucide-react';
import api from '../../api';
import { SiteContext } from '../../context/SiteContext';
import CustomModal from '../CustomModal';

const SiteSettings = () => {
  const { fetchSettings } = useContext(SiteContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  
  const [settings, setSettings] = useState({
    site_name: '', website_title: '', footer_description: '', copyright_text: '',
    contact_email: '', contact_address: '', facebook_url: '', twitter_url: '',
    instagram_url: '', linkedin_url: '', youtube_url: ''
  });

  const notify = (type, title, message) => setNotification({ isOpen: true, type, title, message });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('users/settings/');
        setSettings(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadSettings();
  }, []);

  const handleChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('users/settings/', settings);
      notify('success', 'Settings Saved!', 'Global site configuration has been updated successfully.');
      fetchSettings();
    } catch (err) {
      notify('error', 'Update Failed', 'Could not save site settings. Please check your network connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '30px', color: '#64748b' }}>Initializing Settings Engine...</div>;

  return (
    <div style={{ padding: '30px' }}>
      <CustomModal 
        isOpen={notification.isOpen} type={notification.type} title={notification.title} message={notification.message} 
        onConfirm={() => setNotification({ ...notification, isOpen: false })}
        onCancel={() => setNotification({ ...notification, isOpen: false })}
      />

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>System Settings</h2>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Configure global site branding, contact info, and social media presence.</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={{ gridColumn: 'span 2', background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px' }}><Globe size={24} color="#3b82f6" /></div>
            <h3 style={{ margin: 0 }}>Branding & Meta</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><label>Site Name</label><input name="site_name" value={settings.site_name} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div><label>Website Title</label><input name="website_title" value={settings.website_title} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div style={{ gridColumn: 'span 2' }}><label>Copyright Text</label><input name="copyright_text" value={settings.copyright_text} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '12px' }}><MessageSquare size={24} color="#10b981" /></div>
            <h3 style={{ margin: 0 }}>Communication</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div><label>Contact Email</label><input name="contact_email" value={settings.contact_email} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div><label>Footer Bio</label><textarea name="footer_description" value={settings.footer_description} onChange={handleChange} rows="4" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ padding: '10px', background: '#faf5ff', borderRadius: '12px' }}><Info size={24} color="#a855f7" /></div>
            <h3 style={{ margin: 0 }}>Social Media</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div><label>Facebook</label><input name="facebook_url" value={settings.facebook_url} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div><label>LinkedIn</label><input name="linkedin_url" value={settings.linkedin_url} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div><label>YouTube</label><input name="youtube_url" value={settings.youtube_url} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
           <button type="submit" disabled={saving} style={{ padding: '16px 50px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
             <Save size={20} /> {saving ? "Synchronizing..." : "Update All System Settings"}
           </button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettings;
