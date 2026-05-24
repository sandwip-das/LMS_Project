import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, AlertCircle, Save, Trash, ArrowLeft, Calendar, BookOpen,
  Image as ImageIcon, Upload, ChevronRight, Layers, GraduationCap, PenTool, Layout,
  Users, Wrench, CheckCircle, Package, Search, User as UserIcon, Eye, EyeOff,
  Video, FileText, BarChart, Settings, Clock, Link as LinkIcon, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../api';
import CustomModal from '../CustomModal';
import { formatDate } from '../../utils/dateFormatter';

const CourseManagement = () => {
  const [activeTab, setActiveTab] = useState('all-courses');
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
    <div style={{ padding: '0px', maxWidth: '1600px', margin: '0 auto' }}>
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
          { id: 'all-courses', label: 'All Courses', icon: BookOpen },
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
        {activeTab === 'all-courses' && <AllCoursesSection courses={courses} categories={categories} />}
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
                  style={{ width: '100%', padding: '6px 12px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', transition: '0.2s' }} 
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
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ],
};

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

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '0.75rem' }}>
              <th style={{ padding: '5px' }}>Creation Date</th>
              <th style={{ padding: '5px' }}>Course Name</th>
              <th style={{ padding: '5px' }}>Start Date</th>
              <th style={{ padding: '5px' }}>Batch</th>
              <th style={{ padding: '5px' }}>Total Seats</th>
              <th style={{ padding: '5px' }}>Enrolled</th>
              <th style={{ padding: '5px' }}>Seats Left</th>
              <th style={{ padding: '5px' }}>Status</th>
              <th style={{ padding: '5px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {[...courses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(c => {
              const catName = c.category_name || (categories.find(cat => cat.id === (c.category?.id || c.category))?.name) || 'Uncategorized';
              return (
                <tr key={c.id} onClick={() => window.open(`/course/${c.id}`, '_blank')} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', cursor: 'pointer' }}>
                  <td style={{ padding: '5px' }}>{formatDate(c.created_at)}</td>
                  <td style={{ padding: '5px', fontWeight: '800' }}>{c.title}</td>
                  <td style={{ padding: '5px' }}>{formatDate(c.start_date)}</td>
                  <td style={{ padding: '5px' }}>{c.batch_no}</td>
                  <td style={{ padding: '5px' }}>{c.total_seats}</td>
                  <td style={{ padding: '5px' }}>{c.enrolled_count}</td>
                  <td style={{ padding: '5px', fontWeight: 'bold', color: c.seats_left < 5 ? '#ef4444' : '#10b981' }}>{c.seats_left}</td>
                  <td style={{ padding: '5px' }}>
                    <button 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        try {
                          await api.patch(`lms/courses/${c.id}/`, { is_published: !c.is_published });
                          onRefresh();
                          notify('success', 'Updated', c.is_published ? 'Course unpublished.' : 'Course published successfully.');
                        } catch (err) {
                          notify('error', 'Error', 'Failed to update status.');
                        }
                      }} 
                      style={{ 
                        padding: '4px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                        background: c.is_published ? '#dcfce7' : '#f1f5f9', color: c.is_published ? '#16a34a' : '#64748b' 
                      }}
                    >
                      {c.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ padding: '5px' }}>
                    <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setCurrentId(c.id); setFormData({...c}); setShowForm(true); }} style={{ padding: '4px', borderRadius: '6px', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}><Edit size={12}/></button>
                  </td>
                </tr>
              );
            })}
            {courses.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No courses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                    <select required value={formData.category?.id || formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '4px 8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }}>
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Course Type</label>
                    <select value={formData.course_type} onChange={e => setFormData({...formData, course_type: e.target.value})} style={{ width: '100%', padding: '4px 8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }}>
                      <option value="live">Live</option>
                      <option value="pre_recorded">Pre-Recorded</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Batch No</label>
                    <input type="text" value={formData.batch_no} onChange={e => setFormData({...formData, batch_no: e.target.value})} style={{ width: '100%', padding: '4px 8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} />
                  </div>
               </div>

               <div>
                  <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Course Name</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '4px 8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} placeholder="Enter course title" />
               </div>

               <div>
                  <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Course Description</label>
                  <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '4px 8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} placeholder="Course objectives and summary..." />
               </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Demo Class Link</label>
                    <input type="text" value={formData.demo_video_url} onChange={e => setFormData({...formData, demo_video_url: e.target.value})} style={{ width: '100%', padding: '4px 8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} placeholder="URL (YouTube/Vimeo)" />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Total Seats</label>
                    <input type="number" required value={formData.total_seats} onChange={e => setFormData({...formData, total_seats: e.target.value})} style={{ width: '100%', padding: '4px 8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} />
                  </div>
                </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Course Fees (BDT)</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: '900', fontSize: '1rem' }}>৳</div>
                      <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '6px 8px 6px 30px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Start Date</label>
                    <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} style={{ width: '100%', padding: '4px 8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Live Class Schedule</label>
                    <input type="text" value={formData.schedule_days} onChange={e => setFormData({...formData, schedule_days: e.target.value})} style={{ width: '100%', padding: '4px 8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} placeholder="Sat, Mon, Wed 9 PM" />
                  </div>
               </div>

               <div>
                  <label style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', display: 'block' }}>Support Class Schedule</label>
                  <input type="text" value={formData.support_class_schedule} onChange={e => setFormData({...formData, support_class_schedule: e.target.value})} style={{ width: '100%', padding: '4px 8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }} placeholder="Fri 4 PM" />
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
  
  // Data States
  const [modules, setModules] = useState([]);
  const [moderatorId, setModeratorId] = useState('');
  const [taIds, setTaIds] = useState([]);
  const [tools, setTools] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [modForm, setModForm] = useState({ name: '', duration: '', instructor: '' });
  const [toolForm, setToolForm] = useState({ name: '', image_base64: '' });
  const [reqForm, setReqForm] = useState({ description: '' });

  // Filter courses by category
  const filteredCourses = selectedCatId 
    ? courses.filter(c => (c.category?.id || c.category) == selectedCatId)
    : courses;

  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find(c => c.id == selectedCourseId);
      if (course) {
        setModules(course.modules?.map(m => ({ id: m.id, name: m.name, duration: m.duration_weeks, instructor: m.instructor })) || []);
        setModeratorId(course.moderators?.[0] || '');
        setTaIds(course.teaching_assistants || []);
        setTools(course.tools || []);
        setRequirements(course.requirements || []);
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
        return user ? user.id : input;
      };

      const summaryText = `This course consists of ${modules.length} intensive modules spanning over ${totalWeeks} weeks of professional training.`;
      
      await api.patch(`lms/courses/${selectedCourseId}/`, {
        modules: modules.map(m => ({ 
          id: m.id,
          name: m.name, 
          duration_weeks: parseInt(m.duration) || 1, 
          instructor: resolveId(m.instructor) 
        })),
        moderators: moderatorId ? [resolveId(moderatorId)] : [],
        teaching_assistants: taIds.filter(id => id).map(id => resolveId(id)),
        tools: tools.filter(t => t.name).map(t => ({ id: t.id, name: t.name, image_base64: t.image_base64 })),
        requirements: requirements.filter(r => r.description).map(r => ({ id: r.id, description: r.description })),
        curriculum_summary: summaryText
      });
      notify('success', 'Saved!', 'Curriculum and summaries updated.');
      onRefresh();
    } catch (err) { 
      console.error("Curriculum save error:", err.response?.data || err);
      notify('error', 'Error', 'Failed to save curriculum.'); 
    }
    finally { setLoading(false); }
  };

  const totalWeeks = modules.reduce((sum, m) => sum + parseInt(m.duration || 0), 0);
  const totalClasses = modules.length * 4; 

  const addModule = () => { if(modForm.name) { setModules([...modules, modForm]); setModForm({ name: '', duration: '', instructor: '' }); } };
  const addTool = () => { if(toolForm.name) { setTools([...tools, toolForm]); setToolForm({ name: '', image_base64: '' }); } };
  const addReq = () => { if(reqForm.description) { setRequirements([...requirements, reqForm]); setReqForm({ description: '' }); } };

  const handleToolImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setToolForm({ ...toolForm, image_base64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="glass-card" style={{ background: 'white', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginBottom: '20px' }}>Course Curriculum Setup</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
         <div>
            <label style={{ fontWeight: '700', fontSize:'0.85rem' }}>Course Category</label>
            <select value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }}>
              <option value="">Filter by Category...</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
         </div>
         <div>
            <label style={{ fontWeight: '700', fontSize:'0.85rem' }}>Course Name</label>
            <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }}>
              <option value="">Choose Course...</option>
              {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
         </div>
      </div>

      {selectedCourseId && (
        <>
          {/* Summary Row */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
             <div style={{ padding: '6px 15px', borderRadius: '50px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> {totalWeeks} Weeks Total</div>
             <div style={{ padding: '6px 15px', borderRadius: '50px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14}/> {modules.length} Modules</div>
             <div style={{ padding: '6px 15px', borderRadius: '50px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}><Video size={14}/> {totalClasses} Live Classes</div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <SectionSubHeader title="Modules" icon={Package} />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input placeholder="Module Name" value={modForm.name} onChange={e => setModForm({...modForm, name: e.target.value})} style={{ flex: 2, padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
              <input placeholder="Weeks" type="number" value={modForm.duration} onChange={e => setModForm({...modForm, duration: e.target.value})} style={{ width: '80px', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
              <input placeholder="Instructor ID" value={modForm.instructor} onChange={e => setModForm({...modForm, instructor: e.target.value})} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
              <button onClick={addModule} style={{ padding: '6px 15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'600' }}>Add</button>
            </div>
            {modules.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {modules.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e293b' }}>{m.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{m.duration} Weeks • Instructor ID: {m.instructor || 'Unassigned'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => { setModForm(m); setModules(modules.filter((_, idx) => idx !== i)); }} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer' }}><Edit size={16}/></button>
                      <button onClick={() => setModules(modules.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
             <div>
                <label style={{ fontWeight: '800', marginBottom: '8px', display: 'block', fontSize:'0.85rem' }}>Moderator (ID)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                   <input value={moderatorId} onChange={e => setModeratorId(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
                </div>
             </div>
             <div>
                <SectionSubHeader title="Teaching Assistants (IDs)" onAdd={() => setTaIds([...taIds, ''])} icon={Users} />
                {taIds.map((id, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <input placeholder="TA ID" value={id} onChange={e => { const u = [...taIds]; u[i] = e.target.value; setTaIds(u); }} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
                    <button onClick={() => setTaIds(taIds.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', background:'none', border:'none', cursor:'pointer' }}><Trash size={16}/></button>
                  </div>
                ))}
             </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <SectionSubHeader title="Tools & Technologies" icon={Wrench} />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input placeholder="Tool Name" value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
              <input type="file" accept="image/*" onChange={handleToolImageChange} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize:'0.8rem' }} />
              <button onClick={addTool} style={{ padding: '6px 15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'600' }}>Add Tool</button>
            </div>
            {tools.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tools.map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {(t.image_base64 || t.image) ? <img src={t.image_base64 || t.image} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} /> : <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={18} color="#94a3b8" /></div>}
                      <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e293b' }}>{t.name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => { setToolForm(t); setTools(tools.filter((_, idx) => idx !== i)); }} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer' }}><Edit size={16}/></button>
                      <button onClick={() => setTools(tools.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <SectionSubHeader title="Basic Requirements" icon={CheckCircle} />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input placeholder="Requirement Description" value={reqForm.description} onChange={e => setReqForm({...reqForm, description: e.target.value})} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
              <button onClick={addReq} style={{ padding: '6px 15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'600' }}>Add Req</button>
            </div>
            {requirements.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {requirements.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>{r.description}</div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => { setReqForm(r); setRequirements(requirements.filter((_, idx) => idx !== i)); }} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer' }}><Edit size={16}/></button>
                      <button onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '12px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', marginTop: '10px', fontSize: '1rem', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Curriculum'}</button>
        </>
      )}
    </div>
  );
};

// --- 4. Module Management Section ---
const ModuleManagementSection = ({ courses, allUsers, notify }) => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [weekForm, setWeekForm] = useState({ week_number: 1, topic_title: '', quiz_count: 0, assignment_count: 0, is_disabled: false, extra_features: {}, live_classes: [] });
  const [lcForm, setLcForm] = useState({ title: '', topics: '' });
  const [efForm, setEfForm] = useState({ key: '', value: '' });

  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find(c => c.id == selectedCourseId);
      if (course && course.modules?.[selectedModuleIdx]) {
        setWeeks(course.modules[selectedModuleIdx].weeks || []);
        setWeekForm(prev => ({ ...prev, week_number: (course.modules[selectedModuleIdx].weeks?.length || 0) + 1 }));
      } else { setWeeks([]); }
    }
  }, [selectedCourseId, selectedModuleIdx, courses]);

  const handleSave = async () => {
    if (!selectedCourseId) return notify('error', 'Error', 'Select course first');
    setLoading(true);
    try {
      const course = courses.find(c => c.id == selectedCourseId);
      const sanitizeModule = (m) => {
        const { id, instructor_name, weeks, ...rest } = m;
        return {
          ...rest,
          instructor: m.instructor?.id || m.instructor,
          weeks: (weeks || []).map(w => {
            const { id: wId, live_classes, module, ...wRest } = w;
            return {
              ...wRest,
              live_classes: (live_classes || []).map(lc => {
                const { id: lcId, week, ...lcRest } = lc;
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
      notify('success', 'Saved!', 'Module weeks updated successfully.');
    } catch (err) { 
      notify('error', 'Error', 'Failed to update module management.'); 
    }
    finally { setLoading(false); }
  };

  const addLiveClass = () => { if(lcForm.title) { setWeekForm({...weekForm, live_classes: [...weekForm.live_classes, lcForm]}); setLcForm({title: '', topics: ''}); } };
  const addExtraFeature = () => { if(efForm.key && efForm.value) { setWeekForm({...weekForm, extra_features: {...weekForm.extra_features, [efForm.key]: efForm.value}}); setEfForm({key: '', value: ''}); } };
  const saveWeekToTable = () => { if(weekForm.topic_title) { setWeeks([...weeks, weekForm]); setWeekForm({ week_number: weeks.length + 2, topic_title: '', quiz_count: 0, assignment_count: 0, is_disabled: false, extra_features: {}, live_classes: [] }); } };

  return (
    <div className="glass-card" style={{ background: 'white', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginBottom: '20px' }}>Module Weekly Curriculum Management</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
         <div>
            <label style={{ fontWeight: '700', fontSize:'0.85rem' }}>Course Name</label>
            <select value={selectedCourseId} onChange={e => { setSelectedCourseId(e.target.value); setSelectedModuleIdx(0); }} style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }}>
              <option value="">Choose Course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
         </div>
         {selectedCourseId && (
           <div>
              <label style={{ fontWeight: '700', fontSize:'0.85rem' }}>Target Module</label>
              <select value={selectedModuleIdx} onChange={e => setSelectedModuleIdx(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }}>
                {courses.find(c => c.id == selectedCourseId)?.modules?.map((m, i) => <option key={i} value={i}>{m.name || `Module ${i+1}`}</option>)}
              </select>
           </div>
         )}
      </div>

      {selectedCourseId && courses.find(c => c.id == selectedCourseId)?.modules?.[selectedModuleIdx] && (
        <>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>Add / Edit Week</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px', gap: '10px', marginBottom: '15px' }}>
               <input placeholder="Wk #" type="number" value={weekForm.week_number} onChange={e => setWeekForm({...weekForm, week_number: e.target.value})} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
               <input placeholder="Topic Title" value={weekForm.topic_title} onChange={e => setWeekForm({...weekForm, topic_title: e.target.value})} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
               <input placeholder="Quizzes" type="number" value={weekForm.quiz_count} onChange={e => setWeekForm({...weekForm, quiz_count: e.target.value})} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} title="Quiz Count" />
               <input placeholder="Assigns" type="number" value={weekForm.assignment_count} onChange={e => setWeekForm({...weekForm, assignment_count: e.target.value})} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} title="Assignment Count" />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
               <label style={{ fontSize: '0.85rem', fontWeight: '600' }}><input type="checkbox" checked={weekForm.is_disabled} onChange={e => setWeekForm({...weekForm, is_disabled: e.target.checked})} style={{ marginRight: '5px' }} /> Week Disabled?</label>
            </div>

            {/* Live Classes Sub-Form */}
            <div style={{ marginBottom: '15px', padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem' }}>Live Classes</h5>
               <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                 <input placeholder="Class Title" value={lcForm.title} onChange={e => setLcForm({...lcForm, title: e.target.value})} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
                 <input placeholder="Topics" value={lcForm.topics} onChange={e => setLcForm({...lcForm, topics: e.target.value})} style={{ flex: 2, padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
                 <button onClick={addLiveClass} style={{ padding: '6px 10px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize:'0.75rem', cursor: 'pointer' }}>Add Class</button>
               </div>
               {weekForm.live_classes.map((lc, idx) => (
                 <div key={idx} style={{ fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                   <span><strong>{lc.title}</strong>: {lc.topics}</span>
                   <button onClick={() => setWeekForm({...weekForm, live_classes: weekForm.live_classes.filter((_, i) => i !== idx)})} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><X size={14}/></button>
                 </div>
               ))}
            </div>

            {/* Extra Features Sub-Form */}
            <div style={{ padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem' }}>Extra Features</h5>
               <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                 <input placeholder="Key (e.g. Note)" value={efForm.key} onChange={e => setEfForm({...efForm, key: e.target.value})} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
                 <input placeholder="Value" value={efForm.value} onChange={e => setEfForm({...efForm, value: e.target.value})} style={{ flex: 2, padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
                 <button onClick={addExtraFeature} style={{ padding: '6px 10px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize:'0.75rem', cursor: 'pointer' }}>Add Feature</button>
               </div>
               {Object.entries(weekForm.extra_features).map(([k, v], idx) => (
                 <div key={idx} style={{ fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                   <span><strong>{k}</strong>: {v}</span>
                   <button onClick={() => { const nf = {...weekForm.extra_features}; delete nf[k]; setWeekForm({...weekForm, extra_features: nf}); }} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><X size={14}/></button>
                 </div>
               ))}
            </div>
            
            <button onClick={saveWeekToTable} style={{ marginTop: '15px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Save Week to List</button>
          </div>

          <h4 style={{ margin: '0 0 15px 0' }}>Saved Weeks Overview</h4>
          {weeks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {weeks.map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b' }}>Week {w.week_number}: {w.topic_title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                      Live Classes: {w.live_classes?.length || 0} • Quizzes: {w.quiz_count} • Assignments: {w.assignment_count}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                      {w.is_disabled ? <span style={{ color: '#ef4444', background: '#fee2e2', padding: '4px 8px', borderRadius: '6px' }}>Disabled</span> : <span style={{ color: '#16a34a', background: '#dcfce7', padding: '4px 8px', borderRadius: '6px' }}>Active</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => { setWeekForm(w); setWeeks(weeks.filter((_, idx) => idx !== i)); }} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer' }}><Edit size={16}/></button>
                      <button onClick={() => setWeeks(weeks.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '16px' }}>No weeks added yet.</div>
          )}
          
          <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', marginTop: '30px', fontSize: '1rem', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Finalize & Save All Weeks'}</button>
        </>
      )}
    </div>
  );
};

// --- 5. Project Section ---
const ProjectSection = ({ courses, notify }) => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [projForm, setProjForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find(c => c.id == selectedCourseId);
      if (course) {
        setProjects(course.course_projects || []);
      }
    }
  }, [selectedCourseId, courses]);

  const handleSave = async () => {
    if (!selectedCourseId) return notify('error', 'Error', 'Select course first');
    setLoading(true);
    try {
      await api.patch(`lms/courses/${selectedCourseId}/`, {
        course_projects: projects.filter(p => p.name)
      });
      notify('success', 'Saved!', 'Projects updated successfully.');
    } catch (err) { 
      notify('error', 'Error', 'Failed to update projects.'); 
    }
    finally { setLoading(false); }
  };

  const addProject = () => { if(projForm.name) { setProjects([...projects, projForm]); setProjForm({ name: '', description: '' }); } };

  return (
    <div className="glass-card" style={{ background: 'white', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginBottom: '20px' }}>Projects Portfolio Management</h3>
      <div style={{ marginBottom: '30px' }}>
         <label style={{ fontWeight: '700', fontSize:'0.85rem' }}>Select Course</label>
         <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }}>
           <option value="">Choose Course...</option>
           {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
         </select>
      </div>

      {selectedCourseId && (
        <>
          <div style={{ marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>Add / Edit Project</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
              <input placeholder="Project Name" value={projForm.name} onChange={e => setProjForm({...projForm, name: e.target.value})} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
              <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}><ReactQuill theme="snow" modules={quillModules} value={projForm.description || ''} onChange={val => setProjForm({...projForm, description: val})} placeholder="Project Description..." /></div>
              <button onClick={addProject} style={{ padding: '8px 15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'600', alignSelf: 'flex-start' }}>Add to List</button>
            </div>
          </div>

          <h4 style={{ margin: '0 0 15px 0' }}>Assigned Projects</h4>
          {projects.length > 0 ? (
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Project Name</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Description Snippet</th>
                    <th style={{ padding: '10px', width: '80px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.name}</td>
                      <td style={{ padding: '10px' }}>{p.description ? p.description.substring(0, 50) + '...' : 'No description'}</td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => { setProjForm(p); setProjects(projects.filter((_, idx) => idx !== i)); }} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}><Edit size={16}/></button>
                        <button onClick={() => setProjects(projects.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '16px' }}>No projects added yet.</div>
          )}

          <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', marginTop: '30px', fontSize: '1rem', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Finalize & Save Projects'}</button>
        </>
      )}
    </div>
  );
};

// --- 0. All Courses Section ---
const AllCoursesSection = ({ courses, categories }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedCourses = React.useMemo(() => {
    return [...courses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [courses]);

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const start = new Date(dateStr);
    const diffTime = start - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="glass-card" style={{ background: 'white', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' }}>All Courses</h3>
        </div>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '0.8rem', color: '#475569' }}>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Course Name</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Type</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Batch</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Start Date</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Price</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Seats</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedCourses.map(c => {
                const isPreRecorded = c.course_type === 'pre_recorded';
                const startDate = c.start_date ? new Date(c.start_date) : null;
                const isUpcoming = startDate && startDate >= today;
                const daysLeft = getDaysUntil(c.start_date);

                return (
                  <tr key={c.id} onClick={() => window.open(`/course/${c.id}`, '_blank')} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', background: isUpcoming && !isPreRecorded ? 'rgba(99, 102, 241, 0.02)' : 'transparent', cursor: 'pointer' }}>
                    <td style={{ padding: '15px', fontWeight: '800', color: '#0f172a' }}>{c.title}</td>
                    <td style={{ padding: '15px', fontWeight: '800', color: '#6366f1' }}>{isPreRecorded ? 'Pre-Recorded' : 'Live'}</td>
                    <td style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>{isPreRecorded ? '-' : `Batch ${c.batch_no || '01'}`}</td>
                    <td style={{ padding: '15px', color: '#0f172a', fontWeight: '500' }}>
                      {!isPreRecorded && c.start_date ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{formatDate(c.start_date)}</span>
                          {isUpcoming && (
                            <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: '600' }}>({daysLeft} days to go)</span>
                          )}
                        </div>
                      ) : isPreRecorded ? 'N/A' : 'TBA'}
                    </td>
                    <td style={{ padding: '15px', fontWeight: '800', color: '#0f172a' }}>৳{c.price || '0'}</td>
                    <td style={{ padding: '15px', color: '#475569' }}>
                      {!isPreRecorded ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontWeight: '700' }}>{c.enrolled_count || 0}</span><span style={{ color: '#94a3b8' }}>/</span><span>{c.total_seats || 0}</span></div>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {isPreRecorded ? (
                        <span style={{ background: 'rgba(148, 163, 184, 0.12)', color: '#475569', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>Available</span>
                      ) : isUpcoming ? (
                        <span style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>Upcoming</span>
                      ) : (
                        <span style={{ background: 'rgba(74, 222, 128, 0.12)', color: '#15803d', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>Ongoing / Past</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sortedCourses.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;








