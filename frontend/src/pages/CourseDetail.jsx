import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { 
  CheckCircle, Clock, Users, Play, BookOpen, 
  ChevronRight, Download, ShieldCheck, Briefcase, 
  Star, MessageCircle, HelpCircle, Layers, Monitor, Target,
  ChevronDown, Globe, Award, Zap, Layout, Video, Package,
  Phone, Calendar, ArrowRight, PlayCircle
} from 'lucide-react';
import { formatDate } from '../utils/dateFormatter';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(0);

  // Modern Professional Theme (No Yellow)
  const theme = {
    primary: '#2563eb', // Dynamic Blue
    secondary: '#0f172a', // Deep Navy/Black
    accent: '#3b82f6',
    text: '#1e293b',
    muted: '#64748b',
    white: '#FFFFFF',
    light: '#f8fafc',
    border: '#e2e8f0'
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await api.get(`lms/courses/${id}/`);
        setCourse(res.data);
        if (res.data.batches && res.data.batches.length > 0) {
          setSelectedBatch(res.data.batches[0].id);
        }
      } catch (err) {
        console.error("Error fetching course", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedBatch) {
      alert("Please select a batch first.");
      return;
    }
    navigate(`/checkout/${course.id}`, { state: { batchId: selectedBatch } });
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ fontSize: '1.2rem', color: theme.muted, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Zap className="animate-pulse" color={theme.primary} /> Loading course details...
      </div>
    </div>
  );
  
  if (!course) return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Course not found.</div>;

  return (
    <div style={{ background: theme.white, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: theme.text }}>
      
      {/* 1. Dynamic Hero Section */}
      <section style={{ background: theme.secondary, color: theme.white, padding: '60px 5%', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37, 99, 235, 0.2)', color: theme.accent, padding: '6px 14px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '20px', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
              <Zap size={14} fill={theme.accent} /> {course.course_type === 'live' ? 'Live Interactive Course' : 'Self-Paced Learning'}
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', lineHeight: '1.2', marginBottom: '20px', letterSpacing: '-0.02em' }}>{course.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Star size={18} fill="#fbbf24" color="#fbbf24" />
                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{course.rating || '4.9'}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>(Based on 2.5k+ students)</span>
              </div>
              <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: '500' }}>
                <Globe size={18} /> Available in English & Bengali
              </div>
            </div>

            <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '40px', lineHeight: '1.6', maxWidth: '600px' }}>
              {course.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
               <div>
                  <div style={{ color: theme.accent, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '5px' }}><Video size={14}/> Live Classes</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{course.total_classes || '36'}+ Sessions</div>
               </div>
               <div>
                  <div style={{ color: theme.accent, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '5px' }}><Package size={14}/> Projects</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{course.total_projects || '12'}+ Industry Projects</div>
               </div>
               <div>
                  <div style={{ color: theme.accent, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '5px' }}><Calendar size={14}/> Duration</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{course.duration_months || '4'} Months</div>
               </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: '32px', overflow: 'hidden', border: '8px solid rgba(255,255,255,0.05)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
               <img src={course.thumbnail || 'https://via.placeholder.com/800x500'} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
                  <div 
                    onClick={() => course.demo_video_url && window.open(course.demo_video_url, '_blank')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'white', color: theme.secondary, padding: '14px 28px', borderRadius: '50px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 15px 35px rgba(0,0,0,0.3)', transition: '0.3s' }}
                  >
                    <PlayCircle size={24} fill={theme.primary} color={theme.primary} /> Watch Trailer
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sticky Tab Navigation */}
      <div style={{ position: 'sticky', top: '0', background: theme.white, borderBottom: '1px solid ' + theme.border, zIndex: 100, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '40px', padding: '0 5%' }}>
          {['curriculum', 'projects', 'mentors', 'reviews', 'faq'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: '22px 5px', 
                background: 'none', 
                border: 'none', 
                fontSize: '0.95rem', 
                fontWeight: '700', 
                color: activeTab === tab ? theme.primary : theme.muted,
                cursor: 'pointer',
                position: 'relative',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {tab}
              {activeTab === tab && <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: theme.primary, borderRadius: '100px' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Dynamic Page Content */}
      <main style={{ maxWidth: '1200px', margin: '50px auto 120px', padding: '0 5%', display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '4rem' }}>
        <div>
           {activeTab === 'curriculum' && (
             <section className="animate-fade-in">
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '30px' }}>What you'll learn</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   {course.modules?.map((module, idx) => (
                     <div key={module.id} style={{ border: '1px solid ' + theme.border, borderRadius: '16px', overflow: 'hidden', transition: '0.3s' }}>
                        <div 
                          onClick={() => setExpandedModule(expandedModule === idx ? -1 : idx)}
                          style={{ padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedModule === idx ? theme.light : theme.white }}
                        >
                           <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                              <div style={{ width: '28px', height: '28px', background: expandedModule === idx ? theme.primary : theme.light, color: expandedModule === idx ? 'white' : theme.muted, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800' }}>
                                 {idx + 1}
                              </div>
                              <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{module.title}</h4>
                           </div>
                           <ChevronDown size={20} color={theme.muted} style={{ transform: expandedModule === idx ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                        </div>
                        {expandedModule === idx && (
                          <div style={{ padding: '5px 28px 25px', borderTop: '1px solid ' + theme.border }}>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '20px' }}>
                                {module.lessons?.map((lesson, lIdx) => (
                                  <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: theme.text, fontSize: '0.95rem' }}>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <PlayCircle size={16} color={theme.primary} /> {lesson.title}
                                     </div>
                                     <span style={{ color: theme.muted, fontSize: '0.85rem' }}>15:00 min</span>
                                  </div>
                                ))}
                                {(!module.lessons || module.lessons.length === 0) && <p style={{ color: theme.muted, fontStyle: 'italic' }}>Lesson details coming soon.</p>}
                             </div>
                          </div>
                        )}
                     </div>
                   ))}
                   {(!course.modules || course.modules.length === 0) && <p style={{ color: theme.muted }}>Curriculum is currently being finalized. Stay tuned!</p>}
                </div>
             </section>
           )}

           {activeTab === 'projects' && (
              <section className="animate-fade-in">
                 <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '30px' }}>Build Industry-Grade Projects</h2>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    {course.course_projects?.map((proj, i) => (
                      <div key={i} style={{ border: '1px solid ' + theme.border, borderRadius: '24px', overflow: 'hidden', background: theme.white, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                         <img src={proj.image || 'https://via.placeholder.com/500x300'} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                         <div style={{ padding: '25px' }}>
                            <h4 style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '12px' }}>{proj.name}</h4>
                            <p style={{ color: theme.muted, fontSize: '0.95rem', lineHeight: '1.6' }}>{proj.description}</p>
                         </div>
                      </div>
                    ))}
                    {(!course.course_projects || course.course_projects.length === 0) && <p style={{ color: theme.muted, gridColumn: 'span 2' }}>Projects will be announced during the live sessions.</p>}
                 </div>
              </section>
           )}

           {activeTab === 'mentors' && (
              <section className="animate-fade-in">
                 <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '30px' }}>Learn from Experts</h2>
                 <div style={{ background: theme.light, padding: '40px', borderRadius: '32px', display: 'flex', gap: '35px', alignItems: 'center', border: '1px solid ' + theme.border }}>
                    <div style={{ width: '160px', height: '160px', borderRadius: '24px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                       <img src={course.instructor_photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                       <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '8px' }}>{course.instructor_name || 'Expert Instructor'}</h3>
                       <p style={{ color: theme.primary, fontWeight: '700', marginBottom: '15px', fontSize: '1.1rem' }}>{course.instructor_title || 'Lead Mentor & Senior Engineer'}</p>
                       <p style={{ color: theme.text, lineHeight: '1.8', fontSize: '1rem', opacity: 0.8 }}>
                          {course.instructor_bio || "With years of professional experience in top-tier tech firms, our mentors bring real-world industry knowledge directly to your screen. Master the tech stack through structured mentorship and project-based learning."}
                       </p>
                    </div>
                 </div>
              </section>
           )}
        </div>

        <aside>
           <div style={{ position: 'sticky', top: '110px', border: '1px solid ' + theme.border, borderRadius: '32px', padding: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.05)', background: theme.white }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '25px' }}>Registration Details</h3>
              
              <div style={{ marginBottom: '30px' }}>
                 <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: theme.muted, marginBottom: '10px', textTransform: 'uppercase' }}>Available Batches</label>
                 <select 
                   value={selectedBatch} 
                   onChange={e => setSelectedBatch(e.target.value)}
                   style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '1px solid #cbd5e1', fontWeight: '600', fontSize: '1rem', color: theme.text }}
                 >
                    {course.batches?.map(b => (
                      <option key={b.id} value={b.id}>Batch #{b.batch_number} • Starts {formatDate(b.start_date)}</option>
                    ))}
                    {(!course.batches || course.batches.length === 0) && <option>No active batches</option>}
                 </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '35px' }}>
                 {[
                   { icon: <CheckCircle size={18} color={theme.primary} />, text: 'Dedicated 1:1 Live Support' },
                   { icon: <CheckCircle size={18} color={theme.primary} />, text: 'Job Placement Guarantee' },
                   { icon: <CheckCircle size={18} color={theme.primary} />, text: 'Lifetime Resource Access' },
                   { icon: <CheckCircle size={18} color={theme.primary} />, text: 'Professional Certification' }
                 ].map((item, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.95rem', color: theme.text, fontWeight: '600' }}>
                      {item.icon} {item.text}
                   </div>
                 ))}
              </div>

              <button 
                onClick={handleEnroll}
                style={{ width: '100%', padding: '14px', background: 'rgba(0, 184, 148, 1.0)', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', color: 'white', transition: '0.3s' }}
                onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}
              >
                Join Now
              </button>

              <div style={{ textAlign: 'center', marginTop: '25px' }}>
                 <p style={{ color: theme.muted, fontSize: '0.9rem', fontWeight: '500' }}>Any questions? Talk to us</p>
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', marginTop: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}><MessageCircle size={18}/> WhatsApp</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.primary, fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}><Phone size={18}/> Call Center</div>
                 </div>
              </div>
           </div>
        </aside>
      </main>      {/* 4. Persistent Bottom Enrollment Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '12px 5%', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 -10px 30px rgba(0,0,0,0.05)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: '900', color: theme.secondary }}>৳{course.price}</span>
                  <span style={{ textDecoration: 'line-through', color: theme.muted, fontSize: '1rem' }}>৳{Math.round(course.price * 1.5)}</span>
               </div>
               <div style={{ color: '#059669', fontWeight: '800', fontSize: '0.8rem' }}>OFFER: 33% Early Bird Discount</div>
            </div>
            <div style={{ height: '35px', width: '1.5px', background: 'rgba(0,0,0,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem', fontWeight: '700' }}>
               <Phone size={18} color={theme.primary} /> Hotline: +880 1234 567890
            </div>
         </div>
         <button 
           onClick={handleEnroll}
           style={{ padding: '10px 25px', background: 'rgba(0, 184, 148, 1.0)', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 5px 15px rgba(0, 184, 148, 0.2)', width: 'auto', minWidth: '180px' }}
         >
           Enroll Today <ArrowRight size={18}/>
         </button>
      </div>
    </div>
  );
};

export default CourseDetail;
