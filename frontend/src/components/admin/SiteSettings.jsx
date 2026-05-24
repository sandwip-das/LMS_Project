import React, { useState, useEffect, useContext } from 'react';
import { Save, Image as ImageIcon, Globe, MessageSquare, Info, Layout } from 'lucide-react';
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
    instagram_url: '', linkedin_url: '', youtube_url: '',
    hero_badge_text: '', hero_heading: '', hero_highlighted_word: '', hero_subheading: ''
  });

  const [files, setFiles] = useState({
    site_logo: null, favicon: null, hero_image: null,
    facebook_icon: null, twitter_icon: null, instagram_icon: null, linkedin_icon: null, youtube_icon: null
  });
  
  const [clearedFiles, setClearedFiles] = useState({});

  const notify = (type, title, message) => setNotification({ isOpen: true, type, title, message });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('users/settings/');
        const data = res.data;
        // Keep null checks so React doesn't complain about uncontrolled inputs
        setSettings({
          site_name: data.site_name || '', website_title: data.website_title || '',
          footer_description: data.footer_description || '', copyright_text: data.copyright_text || '',
          contact_email: data.contact_email || '', contact_address: data.contact_address || '',
          facebook_url: data.facebook_url || '', twitter_url: data.twitter_url || '',
          instagram_url: data.instagram_url || '', linkedin_url: data.linkedin_url || '',
          youtube_url: data.youtube_url || '', hero_badge_text: data.hero_badge_text || '',
          hero_heading: data.hero_heading || '', hero_highlighted_word: data.hero_highlighted_word || '',
          hero_subheading: data.hero_subheading || '',
          site_logo: data.site_logo || null, favicon: data.favicon || null,
          hero_image: data.hero_image || null, facebook_icon: data.facebook_icon || null,
          twitter_icon: data.twitter_icon || null, instagram_icon: data.instagram_icon || null,
          linkedin_icon: data.linkedin_icon || null, youtube_icon: data.youtube_icon || null
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadSettings();
  }, []);

  const handleChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
      setClearedFiles({ ...clearedFiles, [e.target.name]: false });
    }
  };

  const handleClearImage = (fieldName) => {
    setSettings(prev => ({ ...prev, [fieldName]: null }));
    setFiles(prev => ({ ...prev, [fieldName]: null }));
    setClearedFiles(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      const imageFields = ['site_logo', 'favicon', 'hero_image', 'facebook_icon', 'twitter_icon', 'instagram_icon', 'linkedin_icon', 'youtube_icon'];
      
      Object.keys(settings).forEach(key => {
        if (!imageFields.includes(key) && settings[key] !== null && settings[key] !== undefined) {
          formData.append(key, settings[key]);
        }
      });
      
      if (files.site_logo) formData.append('site_logo', files.site_logo);
      if (files.favicon) formData.append('favicon', files.favicon);
      if (files.hero_image) formData.append('hero_image', files.hero_image);
      if (files.facebook_icon) formData.append('facebook_icon', files.facebook_icon);
      if (files.twitter_icon) formData.append('twitter_icon', files.twitter_icon);
      if (files.instagram_icon) formData.append('instagram_icon', files.instagram_icon);
      if (files.linkedin_icon) formData.append('linkedin_icon', files.linkedin_icon);
      if (files.youtube_icon) formData.append('youtube_icon', files.youtube_icon);

      Object.keys(clearedFiles).forEach(key => {
        if (clearedFiles[key]) formData.append(`clear_${key}`, 'true');
      });

      await api.put('users/settings/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notify('success', 'Settings Saved!', 'Global site configuration has been updated successfully.');
      fetchSettings(); // Refresh frontend context
    } catch (err) {
      notify('error', 'Update Failed', 'Could not save site settings. Please check your network connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '30px', color: '#64748b' }}>Initializing Settings Engine...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px' }}>
      <CustomModal 
        isOpen={notification.isOpen} type={notification.type} title={notification.title} message={notification.message} 
        onConfirm={() => setNotification({ ...notification, isOpen: false })}
        onCancel={() => setNotification({ ...notification, isOpen: false })}
      />

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>System Settings</h2>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Configure global site branding, hero section, and social media presence.</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Branding & Images Section */}
        <div style={{ gridColumn: 'span 1', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '10px' }}><Globe size={20} color="#3b82f6" /></div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Branding & Meta</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label>Site Name</label><input name="site_name" value={settings.site_name} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div><label>Website Title</label><input name="website_title" value={settings.website_title} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Site Logo
                {settings.site_logo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={settings.site_logo} alt="Site Logo" style={{ height: '30px', borderRadius: '4px' }} />
                    <button type="button" onClick={() => handleClearImage('site_logo')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                  </div>
                )}
              </label>
              <input type="file" accept="image/*" name="site_logo" onChange={handleFileChange} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Favicon
                {settings.favicon && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={settings.favicon} alt="Favicon" style={{ height: '30px', borderRadius: '4px' }} />
                    <button type="button" onClick={() => handleClearImage('favicon')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                  </div>
                )}
              </label>
              <input type="file" accept="image/*" name="favicon" onChange={handleFileChange} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
            </div>
            <div><label>Copyright Text</label><input name="copyright_text" value={settings.copyright_text} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ gridColumn: 'span 1', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '10px' }}><Layout size={20} color="#d97706" /></div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Hero Section</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label>Hero Badge Text</label><input name="hero_badge_text" value={settings.hero_badge_text} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div><label>Hero Highlighted Word</label><input name="hero_highlighted_word" value={settings.hero_highlighted_word} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div><label>Hero Heading</label><input name="hero_heading" value={settings.hero_heading} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div><label>Hero Subheading</label><textarea name="hero_subheading" value={settings.hero_subheading} onChange={handleChange} rows="2" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Right-side Hero Image
                {settings.hero_image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={settings.hero_image} alt="Hero" style={{ height: '40px', borderRadius: '4px' }} />
                    <button type="button" onClick={() => handleClearImage('hero_image')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                  </div>
                )}
              </label>
              <input type="file" accept="image/*" name="hero_image" onChange={handleFileChange} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
            </div>
          </div>
        </div>

        {/* Communication Section */}
        <div style={{ gridColumn: 'span 1', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', background: '#ecfdf5', borderRadius: '10px' }}><MessageSquare size={20} color="#10b981" /></div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Communication</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label>Contact Email</label><input name="contact_email" value={settings.contact_email} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div><label>Contact Address</label><input name="contact_address" value={settings.contact_address} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
            <div><label>Footer Description</label><textarea name="footer_description" value={settings.footer_description} onChange={handleChange} rows="4" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
          </div>
        </div>

        {/* Social Media Section */}
        <div style={{ gridColumn: 'span 1', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', background: '#faf5ff', borderRadius: '10px' }}><Info size={20} color="#a855f7" /></div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Social Media Links</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label>Facebook URL</label><input name="facebook_url" value={settings.facebook_url} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Facebook Icon
                  {settings.facebook_icon && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={settings.facebook_icon} alt="FB Icon" style={{ height: '24px', borderRadius: '4px' }} />
                      <button type="button" onClick={() => handleClearImage('facebook_icon')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                    </div>
                  )}
                </label>
                <input type="file" accept="image/*" name="facebook_icon" onChange={handleFileChange} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label>LinkedIn URL</label><input name="linkedin_url" value={settings.linkedin_url} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  LinkedIn Icon
                  {settings.linkedin_icon && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={settings.linkedin_icon} alt="IN Icon" style={{ height: '24px', borderRadius: '4px' }} />
                      <button type="button" onClick={() => handleClearImage('linkedin_icon')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                    </div>
                  )}
                </label>
                <input type="file" accept="image/*" name="linkedin_icon" onChange={handleFileChange} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label>YouTube URL</label><input name="youtube_url" value={settings.youtube_url} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  YouTube Icon
                  {settings.youtube_icon && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={settings.youtube_icon} alt="YT Icon" style={{ height: '24px', borderRadius: '4px' }} />
                      <button type="button" onClick={() => handleClearImage('youtube_icon')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                    </div>
                  )}
                </label>
                <input type="file" accept="image/*" name="youtube_icon" onChange={handleFileChange} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label>Instagram URL</label><input name="instagram_url" value={settings.instagram_url} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Instagram Icon
                  {settings.instagram_icon && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={settings.instagram_icon} alt="IG Icon" style={{ height: '24px', borderRadius: '4px' }} />
                      <button type="button" onClick={() => handleClearImage('instagram_icon')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                    </div>
                  )}
                </label>
                <input type="file" accept="image/*" name="instagram_icon" onChange={handleFileChange} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label>Twitter URL</label><input name="twitter_url" value={settings.twitter_url} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Twitter Icon
                  {settings.twitter_icon && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={settings.twitter_icon} alt="TW Icon" style={{ height: '24px', borderRadius: '4px' }} />
                      <button type="button" onClick={() => handleClearImage('twitter_icon')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                    </div>
                  )}
                </label>
                <input type="file" accept="image/*" name="twitter_icon" onChange={handleFileChange} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
            </div>

          </div>
        </div>

        {/* Action Button */}
        <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
           <button type="submit" disabled={saving} style={{ padding: '16px 50px', background: 'var(--black-accent, #0f172a)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
             <Save size={20} /> {saving ? "Synchronizing..." : "Update All System Settings"}
           </button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettings;
