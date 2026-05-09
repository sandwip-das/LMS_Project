import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, AlertCircle, Save, Trash, ArrowLeft, Calendar, BookOpen,
  Image as ImageIcon, Upload, ChevronRight, Layers, GraduationCap, PenTool, Layout,
  Users, Wrench, CheckCircle, Package, Search, User as UserIcon, Eye, EyeOff,
  Video, FileText, BarChart, Settings, Clock, Link as LinkIcon, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import CustomModal from '../CustomModal';
import { formatDate } from '../../utils/dateFormatter';

const CourseManagement = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const notify = (type, title, message) => setNotification({ isOpen: true, type, title, message });
  
  const fetchData = async () => {
    try {
      const [catRes, courseRes, userRes] = await Promise.all([
        api.get('lms/categories/'),
        api.get('lms/courses/?admin_view=true'),
        api.get('users/manage/')
      ]);
      setCategories(catRes.data);
      setCourses(courseRes.data);
      setAllUsers(userRes.data);
    } catch (err) { console.error("Data fetch error:", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const styles = {
    tabContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '30px',
      borderBottom: '1px solid #f1f5f9',
      paddingBottom: '20px',
      flexWrap: 'wrap'
    },
    tabButton: (active) => ({
      padding: '12px 24px',
      borderRadius: '10px',
      border: active ? 'none' : '1px solid #e2e8f0',
      background: active ? 'var(--black-accent)' : '#ffffff',
      color: active ? '#ffffff' : '#475569',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.85rem',
      transition: 'all 0.3s ease',
      boxShadow: active ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
    }),
    card: {
      background: 'white',
      borderRadius: '24px',
      padding: '30px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto' }}>
      <CustomModal 
        isOpen={notification.isOpen} 
        type={notification.type} 
        title={notification.title} 
        message={notification.message} 
        onConfirm={() => setNotification({ ...notification, isOpen: false })}
        onCancel={() => setNotification({ ...notification, isOpen: false })}
      />

      <div style={styles.tabContainer}>
        {[
          { id: 'categories', label: 'Add Course Category', icon: Layers },
          { id: 'courses', label: 'Add Courses', icon: BookOpen },
          { id: 'curriculum', label: 'Course Curriculum', icon: GraduationCap },
          { id: 'modules', label: 'Module Management', icon: Package },
          { id: 'projects', label: 'Projects', icon: Layout }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={styles.tabButton(activeTab === tab.id)}>
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content fade-in">
        {activeTab === 'categories' && <CategorySection categories={categories} onRefresh={fetchData} notify={notify} />}
        {activeTab === 'courses' && <CourseSection categories={categories} courses={courses} onRefresh={fetchData} notify={notify} />}
        {activeTab === 'curriculum' && <CurriculumSection courses={courses} categories={categories} allUsers={allUsers} notify={notify} onRefresh={fetchData} />}
        {activeTab === 'modules' && <ModuleManagementSection courses={courses} onRefresh={fetchData} notify={notify} />}
        {activeTab === 'projects' && <ProjectSection courses={courses} notify={notify} onRefresh={fetchData} />}
      </div>
    </div>
  );
};


// --- Shared Helper: User Preview ---
const UserPreview = ({ idInput, allUsers }) => {
  if (!idInput) return null;
  const user = allUsers.find(u => u.id == idInput || u.user_id_custom == idInput);
  if (!user) return <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '5px' }}>User ID Not Found</div>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#cbd5e1', overflow: 'hidden' }}>
        {user.profile?.photo ? <img src={user.profile.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={24} style={{ margin: '10px', color: 'white' }}/>}
      </div>
      <div>
        <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{user.full_name}</div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user.role.replace('_', ' ')}</div>
      </div>
    </div>
  );
};

// --- Shared Helper: Section Header ---
const SectionSubHeader = ({ title, icon: Icon, onAdd }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '900' }}>
      {Icon && <Icon size={20} color="var(--black-accent)" />} {title}
    </h4>
    {onAdd && (
      <button onClick={onAdd} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--black-accent)', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Plus size={14} /> Add New
      </button>
    )}
  </div>
);

// --- 1. Category Section ---
const CategorySection = ({ categories, onRefresh, notify }) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState('');

  const handleOpenForm = (cat = null) => {
    if (cat) {
      setIsEditing(true);
      setCurrentId(cat.id);
      setName(cat.name);
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setName('');
    }
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`lms/categories/${currentId}/`, { name });
        notify('success', 'Updated', 'Category updated successfully.');
      } else {
        await api.post('lms/categories/', { name });
        notify('success', 'Created', 'Category created successfully.');
      }
      setName('');
      setShowForm(false);
      onRefresh();
    } catch (err) { 
      console.error("Category save error:", err.response?.data || err);
      notify('error', 'Error', 'Failed to save category.'); 
    }
  };

  const handleDelete = async () => {
    if (!currentId) return;
    if (window.confirm("Are you sure you want to delete this category? All courses in this category will become uncategorized.")) {
      try {
        await api.delete(`lms/categories/${currentId}/`);
        setShowForm(false);
        onRefresh();
        notify('success', 'Deleted', 'Category removed successfully.');
      } catch (err) {
        notify('error', 'Error', 'Failed to delete category.');
      }
    }
  };

  return (
    <div className="glass-card" style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#1e293b' }}>Course Categories</h2>
          <p style={{ margin: '5px 0 0', color: '#64748b' }}>Manage your learning tracks and organizational categories.</p>
        </div>
        <button onClick={() => handleOpenForm()} style={{ padding: '14px 30px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.3s' }}>
          <Plus size={20} /> Add New Course Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ 
            padding: '0 5px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s',
            cursor: 'default', fontSize: '0.8rem'
          }}>
            <div style={{ fontWeight: '800', color: '#1e293b' }}>{cat.name}</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleOpenForm(cat)} style={{ padding: '8px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}>
                <Edit size={16} />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <Layers size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
            <p>No categories found. Create one to get started.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fade-in" 
            style={{ background: 'white', padding: '30px', borderRadius: '32px', width: '500px', maxWidth: '95%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.5rem' }}>{isEditing ? 'Edit Category' : 'New Course Category'}</h2>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#334155', fontSize: '0.85rem' }}>Course Category Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Full Stack Web Development"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', transition: '0.2s' }} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', transition: '0.3s' }}>
                  <Save size={18} style={{ marginRight: '8px' }} /> {isEditing ? 'Update Category' : 'Create Course Category'}
                </button>
                {isEditing && (
                  <button type="button" onClick={handleDelete} style={{ padding: '14px 20px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

// --- 2. Course Section ---
const CourseSection = ({ categories, courses, onRefresh, notify }) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({});

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // Ensure category is either an ID (number/string) or null, never empty string
      const catId = payload.category?.id || payload.category;
      payload.category = catId || null;
      
      if (isEditing) await api.put(`lms/courses/${currentId}/`, payload);
      else await api.post('lms/courses/', payload);
      
      setShowForm(false);
      onRefresh();
      notify('success', 'Saved!', 'Course has been updated.');
    } catch (err) { 
      console.error("Course save error:", err.response?.data || err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save course.';
      notify('error', 'Error', msg); 
    }
  };

  const confirmDelete = async () => {
    if (window.confirm("Warning: Are you sure you want to delete this course? This will remove all associated modules and data.")) {
      try {
        await api.delete(`lms/courses/${currentId}/`);
        setShowForm(false);
        onRefresh();
        notify('success', 'Deleted', 'Course removed.');
      } catch (err) { 
        console.error("Course delete error:", err);
        notify('error', 'Error', 'Delete failed.'); 
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h3 style={{ margin: 0 }}>Courses Management</h3>
        <button onClick={() => { setIsEditing(false); setFormData({ category: '', course_type: 'live', title: '', description: '', demo_video_url: '', batch_no: '', price: '', start_date: '', schedule_days: '', support_class_schedule: '', total_seats: 50 }); setShowForm(true); }} style={{ padding: '10px 25px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700' }}>+ Add Course</button>
      </div>

      {categories.map(cat => {
        const catCourses = courses.filter(c => (c.category?.id || c.category) === cat.id);
        if (catCourses.length === 0) return null;
        return (
          <div key={cat.id} style={{ marginBottom: '40px' }}>
            <h4 style={{ background: '#f8fafc', padding: '15px 20px', borderRadius: '12px', borderLeft: '5px solid var(--black-accent)', marginBottom: '15px' }}>{cat.name}</h4>
            <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0 15px' }}>Creation Date</th>
                    <th style={{ padding: '0 15px' }}>Course Name</th>
                    <th style={{ padding: '0 15px' }}>Start Date</th>
                    <th style={{ padding: '0 15px' }}>Batch</th>
                    <th style={{ padding: '0 15px' }}>Total Seats</th>
                    <th style={{ padding: '0 15px' }}>Enrolled</th>
                    <th style={{ padding: '0 15px' }}>Seats Left</th>
                    <th style={{ padding: '0 15px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {catCourses.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem' }}>
                      <td style={{ padding: '0 15px' }}>{formatDate(c.created_at)}</td>
                      <td style={{ padding: '0 15px', fontWeight: '800' }}>{c.title}</td>
                      <td style={{ padding: '0 15px' }}>{formatDate(c.start_date)}</td>
                      <td style={{ padding: '0 15px' }}>{c.batch_no}</td>
                      <td style={{ padding: '0 15px' }}>{c.total_seats}</td>
                      <td style={{ padding: '0 15px' }}>{c.enrolled_count}</td>
                      <td style={{ padding: '0 15px', fontWeight: 'bold', color: c.seats_left < 5 ? '#ef4444' : '#10b981' }}>{c.seats_left}</td>
                      <td style={{ padding: '0 15px' }}>
                        <button onClick={() => { setIsEditing(true); setCurrentId(c.id); setFormData({...c}); setShowForm(true); }} style={{ padding: '4px', borderRadius: '6px', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}><Edit size={12}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <AnimatePresence>
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            style={{ background: 'white', padding: '30px', borderRadius: '32px', width: '750px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900' }}>{isEditing ? 'Edit Course Record' : 'Create New Course'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}><X size={24}/></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.6fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Course Category</label>
                    <select required value={formData.category?.id || formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }}>
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Course Type</label>
                    <select value={formData.course_type} onChange={e => setFormData({...formData, course_type: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }}>
                      <option value="live">Live</option>
                      <option value="pre_recorded">Pre-Recorded</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Batch No</label>
                    <input type="text" value={formData.batch_no} onChange={e => setFormData({...formData, batch_no: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} />
                  </div>
               </div>

               <div>
                  <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Course Name</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} placeholder="Enter course title" />
               </div>

               <div>
                  <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Course Description</label>
                  <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} placeholder="Course objectives and summary..." />
               </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Demo Class Link</label>
                    <input type="text" value={formData.demo_video_url} onChange={e => setFormData({...formData, demo_video_url: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} placeholder="URL (YouTube/Vimeo)" />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Total Seats</label>
                    <input type="number" required value={formData.total_seats} onChange={e => setFormData({...formData, total_seats: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} />
                  </div>
                </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Course Fees (BDT)</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: '900', fontSize: '1rem' }}>৳</div>
                      <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Start Date</label>
                    <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Live Class Schedule</label>
                    <input type="text" value={formData.schedule_days} onChange={e => setFormData({...formData, schedule_days: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} placeholder="Sat, Mon, Wed 9 PM" />
                  </div>
               </div>

               <div>
                  <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Support Class Schedule</label>
                  <input type="text" value={formData.support_class_schedule} onChange={e => setFormData({...formData, support_class_schedule: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} placeholder="Fri 4 PM" />
               </div>
               
               <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button type="submit" style={{ flex: 1, padding: '15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}>{isEditing ? 'Save Changes' : 'Save Course'}</button>
                  {isEditing && <button type="button" onClick={confirmDelete} style={{ padding: '15px 25px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>Delete Course</button>}
               </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

// --- 3. Curriculum Section ---
const CurriculumSection = ({ courses, categories, allUsers, notify, onRefresh }) => {
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState([]);
  const [moderatorId, setModeratorId] = useState('');
  const [instructorIds, setInstructorIds] = useState([]);
  const [taIds, setTaIds] = useState([]);
  const [tools, setTools] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter courses by category
  const filteredCourses = selectedCatId 
    ? courses.filter(c => (c.category?.id || c.category) == selectedCatId)
    : courses;

  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find(c => c.id == selectedCourseId);
      if (course) {
        setModules(course.modules?.map(m => ({ name: m.name, duration: m.duration_weeks, instructor: m.instructor })) || []);
        setModeratorId(course.moderators?.[0] || '');
        setInstructorIds(course.instructors || []);
        setTaIds(course.teaching_assistants || []);
        setTools(course.tools || []);
        setRequirements(course.requirements || []);
        setProjects(course.course_projects || []);
        // Auto-select category if not selected
        if (!selectedCatId) setSelectedCatId(course.category?.id || course.category);
      }
    }
  }, [selectedCourseId, courses]);

  const handleSave = async () => {
    if (!selectedCourseId) return notify('error', 'Error', 'Select course first');
    setLoading(true);
    try {
      const resolveId = (input) => {
        if (!input) return null;
        const user = allUsers.find(u => u.id == input || u.user_id_custom == input);
        return user ? user.id : input; // Fallback to input if not found (let backend handle error)
      };

      const summaryText = `This course consists of ${modules.length} intensive modules spanning over ${totalWeeks} weeks of professional training.`;
      
      await api.patch(`lms/courses/${selectedCourseId}/`, {
        modules: modules.map(m => ({ 
          name: m.name, 
          duration_weeks: parseInt(m.duration) || 1, 
          instructor: resolveId(m.instructor) 
        })),
        moderators: moderatorId ? [resolveId(moderatorId)] : [],
        teaching_assistants: taIds.filter(id => id).map(id => resolveId(id)),
        tools: tools.filter(t => t.name),
        requirements: requirements.filter(r => r.description),
        course_projects: projects.filter(p => p.name),
        curriculum_summary: summaryText
      });
      notify('success', 'Saved!', 'Curriculum and summaries updated.');
      onRefresh();
    } catch (err) { 
      console.error("Curriculum save error:", err.response?.data || err);
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save curriculum.';
      notify('error', 'Error', errorMsg); 
    }
    finally { setLoading(false); }
  };

  const totalWeeks = modules.reduce((sum, m) => sum + parseInt(m.duration || 0), 0);
  const totalClasses = modules.length * 4; // Placeholder calc

  return (
    <div className="glass-card" style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginBottom: '30px' }}>Add Course Curriculum</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
         <div>
            <label style={{ fontWeight: '700' }}>Course Category</label>
            <select value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <option value="">Filter by Category...</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
         </div>
         <div>
            <label style={{ fontWeight: '700' }}>Course Name</label>
            <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <option value="">Choose Course...</option>
              {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
         </div>
      </div>

      {selectedCourseId && (
        <>
          {/* Summary Row */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
             <div style={{ padding: '10px 25px', borderRadius: '50px', background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={16}/> {totalWeeks} Weeks Total</div>
             <div style={{ padding: '10px 25px', borderRadius: '50px', background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}><Package size={16}/> {modules.length} Modules</div>
             <div style={{ padding: '10px 25px', borderRadius: '50px', background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}><Video size={16}/> {totalClasses} Live Classes</div>
             <div style={{ padding: '10px 25px', borderRadius: '50px', background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}><Layout size={16}/> {projects.length} Projects</div>
          </div>

          <SectionSubHeader title="Modules" onAdd={() => setModules([...modules, { name: '', duration: '', instructor: '' }])} icon={Package} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {modules.map((m, i) => (
              <div key={i} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 2fr 40px', gap: '15px', alignItems: 'start' }}>
                   <input placeholder="Module Name" value={m.name} onChange={e => { const u = [...modules]; u[i].name = e.target.value; setModules(u); }} style={{ padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                   <input placeholder="Weeks" type="number" value={m.duration} onChange={e => { const u = [...modules]; u[i].duration = e.target.value; setModules(u); }} style={{ padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                   <div>
                     <input placeholder="Instructor ID" value={m.instructor} onChange={e => { const u = [...modules]; u[i].instructor = e.target.value; setModules(u); }} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                     <UserPreview idInput={m.instructor} allUsers={allUsers} />
                   </div>
                   <button onClick={() => setModules(modules.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', border: 'none', background: 'none' }}><Trash size={20}/></button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px' }}>
             <div>
                <label style={{ fontWeight: '900', marginBottom: '10px', display: 'block' }}>Add Moderator (ID)</label>
                <input value={moderatorId} onChange={e => setModeratorId(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <UserPreview idInput={moderatorId} allUsers={allUsers} />
             </div>
             <div>
                <SectionSubHeader title="Add Teaching Assistant (ID)" onAdd={() => setTaIds([...taIds, ''])} icon={Users} />
                {taIds.map((id, i) => (
                  <div key={i} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input placeholder="TA ID" value={id} onChange={e => { const u = [...taIds]; u[i] = e.target.value; setTaIds(u); }} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                      <button onClick={() => setTaIds(taIds.filter((_, idx) => idx !== i))} style={{ color: '#ef4444' }}><Trash size={18}/></button>
                    </div>
                    <UserPreview idInput={id} allUsers={allUsers} />
                  </div>
                ))}
             </div>
          </div>

          <SectionSubHeader title="Tools And Technologies" onAdd={() => setTools([...tools, { name: '', image: null }])} icon={Wrench} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {tools.map((t, i) => (
              <div key={i} style={{ width: '160px', padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <input placeholder="Name" value={t.name} onChange={e => { const u = [...tools]; u[i].name = e.target.value; setTools(u); }} style={{ width: '100%', marginBottom: '12px', padding: '8px', borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                <div style={{ height: '80px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={24} color="#94a3b8" /></div>
              </div>
            ))}
          </div>

          <SectionSubHeader title="Basic Requirements" onAdd={() => setRequirements([...requirements, { description: '', image: null }])} icon={CheckCircle} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {requirements.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', padding: '25px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <textarea placeholder="Requirement Description" value={r.description} onChange={e => { const u = [...requirements]; u[i].description = e.target.value; setRequirements(u); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }} />
                <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={24} color="#94a3b8" /></div>
              </div>
            ))}
          </div>

          <SectionSubHeader title="Projects" onAdd={() => setProjects([...projects, { name: '', description: '', image: null, tools_learned: [] }])} icon={Layout} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px' }}>
             {projects.map((p, i) => (
               <div key={i} style={{ padding: '30px', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                     <input placeholder="Project Name" value={p.name} onChange={e => { const u = [...projects]; u[i].name = e.target.value; setProjects(u); }} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9' }} />
                     <div style={{ background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={18}/> Main Image</div>
                  </div>
                  <textarea placeholder="Project Descriptions (Text with controls)" value={p.description} onChange={e => { const u = [...projects]; u[i].description = e.target.value; setProjects(u); }} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '15px' }} />
                  <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800' }}>+ Tools Learn (Multi-Image Upload)</div>
               </div>
             ))}
          </div>

          <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '20px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '900', marginTop: '50px', fontSize: '1.1rem', boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}>{loading ? 'Finalizing...' : 'Finalize & Save Curriculum'}</button>
        </>
      )}
    </div>
  );
};

// --- 4. Module Management Section ---
const ModuleManagementSection = ({ courses, onRefresh, notify }) => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find(c => c.id == selectedCourseId);
      if (course && course.modules?.[selectedModuleIdx]) {
        setWeeks(course.modules[selectedModuleIdx].weeks || []);
      } else { setWeeks([]); }
    }
  }, [selectedCourseId, selectedModuleIdx, courses]);

  const handleAddWeek = () => {
    setWeeks([...weeks, { week_number: weeks.length + 1, topic_title: '', live_classes: [], quiz_count: 0, assignment_count: 0, is_disabled: false, extra_features: {} }]);
  };

  const handleAddLiveClass = (wIdx) => {
    const updated = [...weeks];
    updated[wIdx].live_classes = updated[wIdx].live_classes || [];
    updated[wIdx].live_classes.push({ title: '', topics: '' });
    setWeeks(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const course = courses.find(c => c.id == selectedCourseId);
      if (!course) return notify('error', 'Error', 'Select course first');

      // Validate weeks
      const invalidWeek = weeks.find(w => !w.topic_title || w.topic_title.trim() === '');
      if (invalidWeek) {
        return notify('error', 'Validation Error', `Week ${invalidWeek.week_number} must have a Topic Title.`);
      }

      // Sanitize modules data before sending to backend
      const sanitizeModule = (m) => {
        const { id, instructor_name, weeks, ...rest } = m;
        return {
          ...rest,
          instructor: m.instructor?.id || m.instructor, // Handle both object and ID
          weeks: (weeks || []).map(w => {
            const { id: wId, live_classes, ...wRest } = w;
            return {
              ...wRest,
              live_classes: (live_classes || []).map(lc => {
                const { id: lcId, ...lcRest } = lc;
                return lcRest;
              })
            };
          })
        };
      };

      const updatedModules = course.modules.map((m, idx) => 
        idx == selectedModuleIdx ? sanitizeModule({ ...m, weeks }) : sanitizeModule(m)
      );

      await api.patch(`lms/courses/${selectedCourseId}/`, { modules: updatedModules });
      notify('success', 'Saved', 'Module and weeks updated successfully.');
      onRefresh();
    } catch (err) { 
      console.error("Module save error:", err.response?.data || err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Save failed.';
      notify('error', 'Error', msg); 
    }
    finally { setLoading(false); }
  };

  const course = courses.find(c => c.id == selectedCourseId);

  return (
    <div className="glass-card" style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginBottom: '30px' }}>Module Management</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
         <div><label style={{ fontWeight: '700' }}>Course Category</label><input readOnly value={course?.category_name || ''} style={{ width: '100%', padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }} /></div>
         <div><label style={{ fontWeight: '700' }}>Course Name</label><select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px' }}><option value="">Select Course</option>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
         <div><label style={{ fontWeight: '700' }}>Batch</label><input readOnly value={course?.batch_no || ''} style={{ width: '100%', padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }} /></div>
         <div><label style={{ fontWeight: '700' }}>Modules</label><select value={selectedModuleIdx} onChange={e => setSelectedModuleIdx(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>{course?.modules?.map((m, i) => <option key={i} value={i}>{m.name}</option>)}</select></div>
      </div>

      <SectionSubHeader title="Add New Week" onAdd={handleAddWeek} icon={Calendar} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {weeks.map((w, wIdx) => (
          <div key={wIdx} style={{ padding: '30px', background: w.is_disabled ? '#f1f5f9' : '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', opacity: w.is_disabled ? 0.6 : 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 120px 120px 50px', gap: '20px' }}>
               <input type="number" value={w.week_number} onChange={e => { const u = [...weeks]; u[wIdx].week_number = e.target.value; setWeeks(u); }} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} placeholder="Week" />
               <input type="text" value={w.topic_title} onChange={e => { const u = [...weeks]; u[wIdx].topic_title = e.target.value; setWeeks(u); }} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} placeholder="Tropic Title" />
               <input type="number" value={w.quiz_count} onChange={e => { const u = [...weeks]; u[wIdx].quiz_count = e.target.value; setWeeks(u); }} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} placeholder="Quiz" />
               <input type="number" value={w.assignment_count} onChange={e => { const u = [...weeks]; u[wIdx].assignment_count = e.target.value; setWeeks(u); }} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} placeholder="Assignment" />
               <button onClick={() => { const u = [...weeks]; u[wIdx].is_disabled = !u[wIdx].is_disabled; setWeeks(u); }} style={{ background: 'none', border: 'none', color: w.is_disabled ? '#ef4444' : '#94a3b8', cursor: 'pointer' }}>{w.is_disabled ? <EyeOff size={24}/> : <Eye size={24}/>}</button>
            </div>
            
            <div style={{ marginTop: '25px', background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionSubHeader title="Live Classes" onAdd={() => handleAddLiveClass(wIdx)} icon={Video} />
                <button type="button" onClick={() => {
                  const u = [...weeks];
                  u[wIdx].extra_features = u[wIdx].extra_features || {};
                  const key = prompt("Extra Feature Name?");
                  if(key) { u[wIdx].extra_features[key] = ""; setWeeks(u); }
                }} style={{ padding: '8px 16px', borderRadius: '8px', background: 'white', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '900' }}>+ Extra Features</button>
              </div>

              {w.live_classes?.map((lc, lcIdx) => (
                <div key={lcIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 40px', gap: '15px', marginBottom: '15px' }}>
                  <input placeholder="Class Title" value={lc.title} onChange={e => { const u = [...weeks]; u[wIdx].live_classes[lcIdx].title = e.target.value; setWeeks(u); }} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  <textarea placeholder="Class Topics" value={lc.topics} onChange={e => { const u = [...weeks]; u[wIdx].live_classes[lcIdx].topics = e.target.value; setWeeks(u); }} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  <button onClick={() => { const u = [...weeks]; u[wIdx].live_classes.splice(lcIdx, 1); setWeeks(u); }} style={{ color: '#ef4444', border: 'none' }}><Trash size={18}/></button>
                </div>
              ))}

              {Object.keys(w.extra_features || {}).length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', marginBottom: '10px' }}>ADDITIONAL OPTIONS</div>
                  {Object.keys(w.extra_features).map(key => (
                    <div key={key} style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                      <div style={{ width: '150px', padding: '12px', background: '#e2e8f0', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem' }}>{key}</div>
                      <input value={w.extra_features[key]} onChange={e => { const u = [...weeks]; u[wIdx].extra_features[key] = e.target.value; setWeeks(u); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                      <button onClick={() => { const u = [...weeks]; delete u[wIdx].extra_features[key]; setWeeks(u); }} style={{ color: '#ef4444', border: 'none' }}><X size={16}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '20px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', marginTop: '40px', fontSize: '1rem' }}>{loading ? 'Saving...' : 'Save Module Management'}</button>
    </div>
  );
};

// --- 5. Project Section ---
const ProjectSection = ({ courses, notify, onRefresh }) => (
  <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
    <Layout size={64} color="#94a3b8" style={{ marginBottom: '20px' }} />
    <h3 style={{ margin: 0, color: '#1e293b' }}>Projects Portfolio Management</h3>
    <p style={{ color: '#64748b', marginTop: '10px' }}>Manage end-to-end projects assigned to each course curriculum.</p>
    <button className="btn-primary" style={{ padding: '15px 40px', borderRadius: '12px', marginTop: '20px' }}>+ Setup New Project</button>
  </div>
);

export default CourseManagement;
