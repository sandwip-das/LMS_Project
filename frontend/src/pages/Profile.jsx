import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useFieldHistory } from '../hooks/useFieldHistory';
import { 
  User as UserIcon, ShieldCheck, History, Save, MapPin, GraduationCap, 
  Briefcase, Lock, Download, Camera, CheckCircle, LogOut, ArrowLeft,
  Eye, EyeOff, XCircle
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StudentSidebar from '../components/StudentSidebar';
import ImageCropper from '../components/ImageCropper';

// Custom date formatter for transaction history: "17 March , 05:42 PM"
const formatTransactionDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const time = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day} ${month} , ${time}`;
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8000${path}`;
};

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('account');
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passUpdating, setPassUpdating] = useState(false);
  const [showPassOld, setShowPassOld] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  
  // Image Cropping States
  const [tempImage, setTempImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  // Field History
  const { history: districtHistory, addValue: addDistrictHistory } = useFieldHistory('district');

  const [accForm, setAccForm] = useState({
    full_name: '', email: '', mobile_number: '',
    alternative_email: '', alternative_number: '', gender: '', age: '', 
    edu_background: '', edu_institute: '', address: '', district: '', skill_sector: '',
    occupation: '', position: '', job_from: '', job_to: '', is_continuing: false, job_description: ''
  });

  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, transRes, catRes] = await Promise.all([
          api.get('users/profile/'),
          api.get('users/transactions/'),
          api.get('lms/categories/')
        ]);
        
        const p = profileRes.data;
        setProfile(p);
        setTransactions(transRes.data);
        setCategories(catRes.data);

        setAccForm({
          full_name: p.full_name || '',
          email: p.email || '',
          mobile_number: p.mobile_number || '',
          alternative_email: p.profile?.alternative_email || '',
          alternative_number: p.profile?.alternative_number || '',
          gender: p.profile?.gender || '',
          age: p.profile?.age || '',
          edu_background: p.profile?.edu_background || '',
          edu_institute: p.profile?.edu_institute || '',
          address: p.profile?.address || '',
          district: p.profile?.district || '',
          skill_sector: p.profile?.skill_sector || '',
          occupation: p.profile?.occupation || '',
          position: p.profile?.position || '',
          job_from: p.profile?.job_from || '',
          job_to: p.profile?.job_to || '',
          is_continuing: p.profile?.is_continuing || false,
          job_description: p.profile?.job_description || ''
        });
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put('users/profile/', accForm);
      setProfile(res.data);
      addDistrictHistory(accForm.district);
      window.dispatchEvent(new Event('profileUpdated'));
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Update failed. Please check your inputs.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) return alert("Passwords don't match!");
    setPassUpdating(true);
    try {
      await api.post('users/change-password/', {
        old_password: passForm.old,
        new_password: passForm.new
      });
      alert('Password updated!');
      setPassForm({ old: '', new: '', confirm: '' });
    } catch (err) {
      alert('Password change failed.');
    } finally {
      setPassUpdating(false);
    }
  };

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be chosen again if needed
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob) => {
    setIsCropping(false);
    if (!croppedBlob) return;

    const formData = new FormData();
    formData.append('photo', croppedBlob, 'profile_image.jpg');

    try {
      setUpdating(true);
      const res = await api.put('users/profile/', formData);
      setProfile(res.data);
      // Trigger a global event to notify Navbar and Sidebar to re-fetch
      window.dispatchEvent(new Event('profileUpdated'));
      alert('Profile picture updated!');
    } catch (err) {
      alert('Image upload failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Loading profile...</div>;

  const styles = {
    container: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
    tabNav: { display: 'flex', gap: '30px', borderBottom: '1px solid #e2e8f0', marginBottom: '30px', background: 'white', padding: '0 25px', borderRadius: '12px 12px 0 0' },
    tabBtn: (active) => ({
      padding: '20px 5px', fontSize: '1rem', fontWeight: '700', color: active ? '#2563eb' : '#64748b',
      borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
      cursor: 'pointer', background: 'none', border: 'none', transition: '0.3s'
    }),
    card: { 
      background: 'white', borderRadius: '12px', padding: '15px', 
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', 
      marginBottom: '12px' 
    },
    sectionTitle: { fontSize: '1.05rem', fontWeight: '800', marginBottom: '12px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' },
    label: { display: 'block', marginBottom: '4px', fontWeight: '700', color: '#334155', fontSize: '0.8rem' },
    input: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px', fontSize: '0.85rem', color: '#0f172a' },
    readOnly: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '10px', fontSize: '0.85rem', background: '#f8fafc', color: '#64748b' },
    btnPrimary: { padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    btnUpdate: { padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#0f172a', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
  };

  const isStudent = profile?.role === 'student';

  const renderAccountDetails = () => {
    if (isStudent) {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Student Left Column */}
          <form onSubmit={handleUpdateProfile} style={{ display: 'contents' }}>
            <div>
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>Basic Information</h3>
                <label style={styles.label}>Full Name</label>
                <input 
                  name="name" 
                  autoComplete="name" 
                  style={profile?.full_name ? styles.readOnly : styles.input} 
                  type="text" 
                  value={accForm.full_name} 
                  onChange={e => setAccForm({...accForm, full_name: e.target.value})} 
                  disabled={!!profile?.full_name}
                  placeholder="Full Name" 
                />
                
                <label style={styles.label}>Email Address</label>
                <input 
                  name="email" 
                  autoComplete="email" 
                  style={profile?.email ? styles.readOnly : styles.input} 
                  type="email" 
                  value={accForm.email} 
                  onChange={e => setAccForm({...accForm, email: e.target.value})} 
                  disabled={!!profile?.email}
                  placeholder="Email Address" 
                />

                <label style={styles.label}>Primary Number</label>
                <input 
                  name="tel" 
                  autoComplete="tel" 
                  style={profile?.mobile_number ? styles.readOnly : styles.input} 
                  type="text" 
                  value={accForm.mobile_number} 
                  onChange={e => setAccForm({...accForm, mobile_number: e.target.value})} 
                  disabled={!!profile?.mobile_number}
                  placeholder="Mobile Number" 
                />

                <label style={styles.label}>Alternative Email</label>
                <input name="email" autoComplete="email" style={styles.input} type="email" value={accForm.alternative_email} onChange={e => setAccForm({...accForm, alternative_email: e.target.value})} placeholder="Enter alternative email" />
                <label style={styles.label}>Alternative Number</label>
                <input name="tel" autoComplete="tel" style={styles.input} type="text" value={accForm.alternative_number} onChange={e => setAccForm({...accForm, alternative_number: e.target.value})} placeholder="Enter alternative number" />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ ...styles.btnUpdate, flex: 1 }}>Update Information</button>
                </div>
              </div>
              
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>Change Password</h3>
                
                <label style={styles.label}>Old Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    name="old-pass-prevent-autofill" 
                    autoComplete="new-password" 
                    style={styles.input} 
                    type={showPassOld ? "text" : "password"} 
                    value={passForm.old} 
                    onChange={e => setPassForm({...passForm, old: e.target.value})} 
                  />
                  <button type="button" onClick={() => setShowPassOld(!showPassOld)} style={{ position: 'absolute', right: '12px', top: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    {showPassOld ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <label style={styles.label}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    name="new-password" 
                    autoComplete="new-password" 
                    style={styles.input} 
                    type={showPassNew ? "text" : "password"} 
                    value={passForm.new} 
                    onChange={e => setPassForm({...passForm, new: e.target.value})} 
                    placeholder="New Password" 
                  />
                  <button type="button" onClick={() => setShowPassNew(!showPassNew)} style={{ position: 'absolute', right: '12px', top: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    {showPassNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <label style={styles.label}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    name="new-password" 
                    autoComplete="new-password" 
                    style={{ 
                      ...styles.input,
                      borderColor: passForm.confirm ? (passForm.new === passForm.confirm ? '#22c55e' : '#ef4444') : '#e2e8f0'
                    }} 
                    type={showPassConfirm ? "text" : "password"} 
                    value={passForm.confirm} 
                    onChange={e => setPassForm({...passForm, confirm: e.target.value})} 
                    placeholder="Confirm Password" 
                  />
                  <div style={{ position: 'absolute', right: '35px', top: '8px', color: passForm.new === passForm.confirm ? '#22c55e' : '#ef4444' }}>
                    {passForm.confirm && (passForm.new === passForm.confirm ? <CheckCircle size={16} /> : <XCircle size={16} />)}
                  </div>
                  <button type="button" onClick={() => setShowPassConfirm(!showPassConfirm)} style={{ position: 'absolute', right: '12px', top: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    {showPassConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {passForm.confirm && (
                  <p style={{ margin: '-5px 0 10px', fontSize: '0.75rem', fontWeight: '800', color: passForm.new === passForm.confirm ? '#22c55e' : '#ef4444' }}>
                    {passForm.new === passForm.confirm ? '✓ Passwords Match' : '✗ Passwords Do Not Match'}
                  </p>
                )}

                <button type="button" onClick={handlePassChange} style={{ ...styles.btnPrimary, width: '100%' }}>Change Password</button>
              </div>
            </div>

            {/* Student Right Column */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Current Occupation</h3>
              <label style={styles.label}>Which sector do you want to build skills in?</label>
              <select name="skill-sector" style={styles.input} value={accForm.skill_sector} onChange={e => setAccForm({...accForm, skill_sector: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <label style={styles.label}>Gender</label>
              <select name="sex" autoComplete="sex" style={styles.input} value={accForm.gender} onChange={e => setAccForm({...accForm, gender: e.target.value})}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
              <label style={styles.label}>Age</label>
              <input name="age" style={styles.input} type="number" value={accForm.age} onChange={e => setAccForm({...accForm, age: e.target.value})} placeholder="Enter age" />
              <label style={styles.label}>Educational Background</label>
              <select name="education" style={styles.input} value={accForm.edu_background} onChange={e => setAccForm({...accForm, edu_background: e.target.value})}>
                <option value="">Select Background</option>
                {['BSc', 'MSc', 'Diploma', 'HSC', 'SSC', 'BBA', 'MBA', 'BA', 'MA', 'BSS', 'MSS', 'MBBS', 'BDS', 'LLB', 'LLM', 'PhD', 'MPhil', 'Vocational Training', 'Professional Certification', 'Others'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <label style={styles.label}>Educational Institute</label>
              <input name="organization" autoComplete="organization" style={styles.input} type="text" value={accForm.edu_institute} onChange={e => setAccForm({...accForm, edu_institute: e.target.value})} placeholder="Educational Institute" />
              <label style={styles.label}>District / City</label>
              <input 
                name="address-level2"
                autoComplete="address-level2"
                style={styles.input} 
                type="text" 
                value={accForm.district} 
                onChange={e => setAccForm({...accForm, district: e.target.value})} 
                placeholder="e.g. Dhaka" 
              />
              <label style={styles.label}>Address</label>
              <textarea name="street-address" autoComplete="street-address" style={{ ...styles.input, height: '100px' }} value={accForm.address} onChange={e => setAccForm({...accForm, address: e.target.value})} placeholder="Address" />
              <button type="submit" style={{ ...styles.btnUpdate, width: '100%' }}>Update Information</button>
            </div>
          </form>
        </div>
      );
    } else {
      // Admin/Instructor/TA/Moderator Layout
      return (
        <form onSubmit={handleUpdateProfile} style={{ display: 'contents' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Account Details</h3>
              <label style={styles.label}>Full Name</label>
              <div style={styles.readOnly}>{profile?.full_name}</div>
              <label style={styles.label}>User ID</label>
              <div style={styles.readOnly}>{profile?.username}</div>
              <label style={styles.label}>Role</label>
              <div style={styles.readOnly}>{profile?.role?.toUpperCase()}</div>
              <label style={styles.label}>Primary Number</label>
              <div style={styles.readOnly}>{profile?.mobile_number}</div>
              <label style={styles.label}>Alternative Number</label>
              <input name="tel" autoComplete="tel" style={styles.input} type="text" value={accForm.alternative_number} onChange={e => setAccForm({...accForm, alternative_number: e.target.value})} placeholder="Alternative Number" />
              <label style={styles.label}>Email</label>
              <div style={styles.readOnly}>{profile?.email}</div>
              <label style={styles.label}>Alternative Email</label>
              <input name="email" autoComplete="email" style={styles.input} type="email" value={accForm.alternative_email} onChange={e => setAccForm({...accForm, alternative_email: e.target.value})} placeholder="Alternative Email" />
              <button type="submit" style={{ ...styles.btnUpdate, width: '100%' }}>Update</button>
            </div>

            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Change Password</h3>
              
              <label style={styles.label}>Old Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  name="old-pass-staff-prevent-autofill" 
                  autoComplete="new-password" 
                  style={styles.input} 
                  type={showPassOld ? "text" : "password"} 
                  value={passForm.old} 
                  onChange={e => setPassForm({...passForm, old: e.target.value})} 
                />
                <button type="button" onClick={() => setShowPassOld(!showPassOld)} style={{ position: 'absolute', right: '12px', top: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  {showPassOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <label style={styles.label}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  name="new-password" 
                  autoComplete="new-password" 
                  style={styles.input} 
                  type={showPassNew ? "text" : "password"} 
                  value={passForm.new} 
                  onChange={e => setPassForm({...passForm, new: e.target.value})} 
                  placeholder="New Password" 
                />
                <button type="button" onClick={() => setShowPassNew(!showPassNew)} style={{ position: 'absolute', right: '12px', top: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  {showPassNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <label style={styles.label}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  name="new-password" 
                  autoComplete="new-password" 
                  style={{ 
                    ...styles.input,
                    borderColor: passForm.confirm ? (passForm.new === passForm.confirm ? '#22c55e' : '#ef4444') : '#e2e8f0'
                  }} 
                  type={showPassConfirm ? "text" : "password"} 
                  value={passForm.confirm} 
                  onChange={e => setPassForm({...passForm, confirm: e.target.value})} 
                  placeholder="Confirm Password" 
                />
                <div style={{ position: 'absolute', right: '35px', top: '8px', color: passForm.new === passForm.confirm ? '#22c55e' : '#ef4444' }}>
                  {passForm.confirm && (passForm.new === passForm.confirm ? <CheckCircle size={16} /> : <XCircle size={16} />)}
                </div>
                <button type="button" onClick={() => setShowPassConfirm(!showPassConfirm)} style={{ position: 'absolute', right: '12px', top: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  {showPassConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {passForm.confirm && (
                <p style={{ margin: '-5px 0 10px', fontSize: '0.75rem', fontWeight: '800', color: passForm.new === passForm.confirm ? '#22c55e' : '#ef4444' }}>
                  {passForm.new === passForm.confirm ? '✓ Passwords Match' : '✗ Passwords Do Not Match'}
                </p>
              )}

              <button type="button" onClick={handlePassChange} style={{ ...styles.btnPrimary, width: '100%' }}>Change Password</button>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Current Occupation</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={styles.label}>Company Name</label>
              <input name="organization" autoComplete="organization" style={styles.input} type="text" value={accForm.occupation} onChange={e => setAccForm({...accForm, occupation: e.target.value})} placeholder="Company Name" />
              <label style={styles.label}>Position</label>
              <input name="job-title" autoComplete="organization-title" style={styles.input} type="text" value={accForm.position} onChange={e => setAccForm({...accForm, position: e.target.value})} placeholder="Position" />
              <label style={styles.label}>From (Date)</label>
              <input name="bday-day" style={styles.input} type="date" value={accForm.job_from} onChange={e => setAccForm({...accForm, job_from: e.target.value})} />
              <label style={styles.label}>To (Dropdown Date field/ Continuing)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                <input name="bday-day" style={{ ...styles.input, marginBottom: 0, flex: 1 }} type="date" value={accForm.job_to} onChange={e => setAccForm({...accForm, job_to: e.target.value, is_continuing: false})} disabled={accForm.is_continuing} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={accForm.is_continuing} onChange={e => setAccForm({...accForm, is_continuing: e.target.checked})} /> Continuing
                </label>
              </div>
              <label style={styles.label}>Job Description</label>
              <textarea name="description" style={{ ...styles.input, height: '80px' }} value={accForm.job_description} onChange={e => setAccForm({...accForm, job_description: e.target.value})} placeholder="Job Description" />
              <label style={styles.label}>Age</label>
              <input name="age" style={styles.input} type="number" value={accForm.age} onChange={e => setAccForm({...accForm, age: e.target.value})} placeholder="Age" />
              <label style={styles.label}>Educational Background</label>
              <input name="education" style={styles.input} type="text" value={accForm.edu_background} onChange={e => setAccForm({...accForm, edu_background: e.target.value})} placeholder="Educational Background" />
              <label style={styles.label}>Educational Institute</label>
              <input name="organization" style={styles.input} type="text" value={accForm.edu_institute} onChange={e => setAccForm({...accForm, edu_institute: e.target.value})} placeholder="Educational Institute" />
              <label style={styles.label}>District / City</label>
              <input 
                name="address-level2"
                autoComplete="address-level2"
                style={styles.input} 
                type="text" 
                value={accForm.district} 
                onChange={e => setAccForm({...accForm, district: e.target.value})} 
                placeholder="e.g. Dhaka" 
              />
              <label style={styles.label}>Address</label>
              <textarea name="street-address" autoComplete="street-address" style={{ ...styles.input, height: '80px' }} value={accForm.address} onChange={e => setAccForm({...accForm, address: e.target.value})} placeholder="Address" />
              <button type="submit" style={{ ...styles.btnUpdate, width: '100%' }}>Update Information</button>
            </div>
          </div>
        </form>
      );
    }
  };

  const renderTransactionHistory = () => (
    <div style={styles.card}>
      <h3 style={styles.sectionTitle}>Transaction History</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>
              <th style={{ padding: '15px' }}>Course</th>
              <th style={{ padding: '15px' }}>Date & Time</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>Payment Medium</th>
              <th style={{ padding: '15px' }}>Amount</th>
              <th style={{ padding: '15px' }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc', fontSize: '0.95rem' }}>
                <td style={{ padding: '15px', fontWeight: '700' }}>{t.course_name}</td>
                <td style={{ padding: '15px' }}>{formatTransactionDate(t.created_at)}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800',
                    background: t.status === 'success' || t.status === 'completed' ? '#dcfce7' : '#fee2e2',
                    color: t.status === 'success' || t.status === 'completed' ? '#166534' : '#991b1b'
                  }}>{t.status?.toUpperCase() || 'SUCCESS'}</span>
                </td>
                <td style={{ padding: '15px' }}>{t.payment_method || 'sslcommerz'}</td>
                <td style={{ padding: '15px', fontWeight: '800' }}>৳{t.amount}</td>
                <td style={{ padding: '15px' }}>
                  <button style={{ color: '#2563eb', background: 'none', border: '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Download size={14} /> Download
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No transactions found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );


  const renderTopBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>Profile</h1>
      </div>
      <button 
        onClick={handleLogout} 
        style={{ ...styles.btnPrimary, background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2' }}
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );

  const renderHeader = () => (
    <div style={{ background: 'white', borderRadius: '16px', padding: '25px', border: '1px solid #e2e8f0', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '25px' }}>
      <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid #eff6ff', overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>
        {profile?.profile?.photo ? (
          <img src={getImageUrl(profile.profile.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon size={36} color="#94a3b8" />
          </div>
        )}
        <button 
          type="button" 
          onClick={handleImageClick}
          style={{ position: 'absolute', bottom: 5, right: 5, background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
        >
          <Camera size={14} />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>{profile?.full_name}</h2>
        <p style={{ margin: '5px 0 0', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>
          {profile?.mobile_number || profile?.email}
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout sidebar={profile?.role === 'student' ? <StudentSidebar user={profile} /> : null}>
      <div style={styles.container}>
        {renderTopBar()}
        {renderHeader()}
        <div style={styles.tabNav}>
          <button onClick={() => setActiveTab('account')} style={styles.tabBtn(activeTab === 'account')}>Account Details</button>
          <button onClick={() => setActiveTab('transactions')} style={styles.tabBtn(activeTab === 'transactions')}>Transaction History</button>
        </div>
        {activeTab === 'account' ? renderAccountDetails() : renderTransactionHistory()}
        {isCropping && (
          <ImageCropper 
            image={tempImage} 
            onCropComplete={handleCropComplete} 
            onCancel={() => setIsCropping(false)} 
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
