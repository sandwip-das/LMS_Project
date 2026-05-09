import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { 
  Search, Users, PlayCircle, Star, ArrowRight, CheckCircle, 
  ChevronLeft, ChevronRight, Layout, Book, Code, Monitor, Briefcase,
  Calendar, UserPlus, Clock, Tv, Heart, GraduationCap, Zap
} from 'lucide-react';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [catStartIndex, setCatStartIndex] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, catRes] = await Promise.all([
          api.get('lms/courses/'),
          api.get('lms/categories/')
        ]);
        setCourses(courseRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = useMemo(() => {
    let filtered = courses;
    if (selectedCategory !== 'All') {
      const cat = categories.find(c => c.name === selectedCategory);
      if (cat) {
        filtered = courses.filter(c => c.category === cat.id);
      }
    }
    if (searchQuery) {
      filtered = filtered.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [courses, selectedCategory, categories, searchQuery]);

  // Category Slider Logic
  const visibleCategories = categories.slice(catStartIndex, catStartIndex + 5);
  const showRightArrow = categories.length > catStartIndex + 5;
  const showLeftArrow = catStartIndex > 0;

  const handleNextCat = () => {
    if (showRightArrow) setCatStartIndex(catStartIndex + 1);
  };
  const handlePrevCat = () => {
    if (showLeftArrow) setCatStartIndex(catStartIndex - 1);
  };

  const getDaysLeft = (startDate) => {
    if (!startDate) return 'TBA';
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = start - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} Days Left` : 'Started';
  };

  const getCategoryIcon = (name) => {
    const icons = {
      'Development': <Code size={20} />,
      'Programming': <Code size={20} />,
      'Design': <Layout size={20} />,
      'Business': <Briefcase size={20} />,
      'Marketing': <Monitor size={20} />,
    };
    return icons[name] || <Book size={20} />;
  };

  return (
    <div className="animate-fade-in" style={{ background: '#fdfdfd', minHeight: '100vh', paddingBottom: '100px', width: '100%' }}>
      
      {/* Premium Hero Section - Full Width */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        padding: '30px 5% 120px',
        width: '100%',
        borderRadius: '50px 50px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4rem' }}>
          <div style={{ flex: '1' }}>
             <div className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '20px', padding: '8px 16px', borderRadius: '100px', fontWeight: '700' }}>
               # Online Learning Platform in Bangladesh
             </div>
             <h1 style={{ fontSize: '3.2rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-0.04em' }}>
               Skills that <span style={{ color: '#818cf8' }}>Launch</span> <br /> Your Career.
             </h1>
             <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '40px', maxWidth: '600px', lineHeight: '1.6' }}>
               Join thousands of students mastering high-demand skills through live mentorship and industry-grade projects.
             </p>
             
             {/* Search Bar */}
             <div style={{ 
               display: 'flex', 
               alignItems: 'center',
               background: 'white', 
               padding: '4px', 
               borderRadius: '12px', 
               boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
               maxWidth: '480px',
               border: '1px solid rgba(255,255,255,0.1)',
               gap: '5px'
             }}>
               <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '15px', color: '#64748b' }}>
                 <Search size={18} />
               </div>
               <input 
                 type="text" 
                 placeholder="Search courses..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 style={{ 
                   border: 'none', 
                   background: 'transparent', 
                   flex: 1, 
                   padding: '10px 5px', 
                   fontSize: '0.95rem', 
                   color: '#0f172a', 
                   outline: 'none',
                   margin: 0
                 }}
               />
               <button className="btn-primary" style={{ 
                 padding: '8px 25px', 
                 borderRadius: '8px', 
                 fontSize: '0.9rem', 
                 fontWeight: '700',
                 height: '100%',
                 margin: 0
               }}>
                 Search
               </button>
             </div>

             <div style={{ display: 'flex', gap: '40px', marginTop: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}><Tv color="#818cf8" size={24}/></div>
                   <div>
                      <div style={{ fontWeight: '800', fontSize: '1.4rem' }}>{courses.length}+</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Live Courses</div>
                   </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}><Users color="#4ade80" size={24}/></div>
                   <div>
                      <div style={{ fontWeight: '800', fontSize: '1.4rem' }}>100+</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Active Students</div>
                   </div>
                </div>
             </div>
          </div>

          <div style={{ flex: '1', position: 'relative' }}>
             <div style={{ 
               width: '100%', 
               aspectRatio: '16 / 10', 
               background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)',
               borderRadius: '40px',
               border: '2px solid rgba(255,255,255,0.1)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
               <img 
                 src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600" 
                 alt="Students" 
                 style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
               />
             </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Bar - Full Width */}
      <div style={{ width: '100%', padding: '0 5%', marginTop: '-50px', marginBottom: '60px', position: 'relative', zIndex: 10 }}>
         <div style={{ background: 'white', padding: '10px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', border: '1px solid #f1f5f9' }}>
            {[
              { icon: <Zap color="#818cf8"/>, title: 'Live Classes', sub: 'Interactive sessions' },
              { icon: <Heart color="#ef4444"/>, title: 'Expert Mentors', sub: 'From top tech giants' },
              { icon: <GraduationCap color="#3b82f6"/>, title: 'Skill Projects', sub: 'Build real portfolio' },
              { icon: <CheckCircle color="#22c55e"/>, title: 'Job Assist', sub: 'Placement support' }
            ].map((f, i) => (
              <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                 <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>{f.icon}</div>
                 <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>{f.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{f.sub}</div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Category Slider Section - Full Width */}
      <section style={{ width: '90%', padding: '0 5%', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginBottom: '30px' }}>Explore Categories</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {showLeftArrow && (
            <button onClick={handlePrevCat} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <ChevronLeft size={20} color="var(--accent-primary)" />
            </button>
          )}

          <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
            <div 
              onClick={() => setSelectedCategory('All')}
              style={{ 
                flex: '0 0 calc(20% - 16px)',
                padding: '10px 10px',
                background: selectedCategory === 'All' ? 'rgba(99, 102, 241, 0.05)' : 'white', 
                border: '1px solid',
                borderColor: selectedCategory === 'All' ? 'var(--accent-primary)' : '#e2e8f0',
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px', 
                cursor: 'pointer',
                height: '64px',
                transition: '0.3s'
              }}
            >
              <div style={{ color: 'var(--accent-primary)' }}><Layout size={24} /></div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', lineHeight: '1.2' }}>All Courses</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{courses.length.toString().padStart(2, '0')} Courses</div>
              </div>
            </div>

            {visibleCategories.map(cat => (
              <div 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                style={{ 
                  flex: '0 0 calc(20% - 16px)',
                  padding: '10px 10px',
                  background: selectedCategory === cat.name ? 'rgba(99, 102, 241, 0.05)' : 'white', 
                  border: '1px solid',
                  borderColor: selectedCategory === cat.name ? 'var(--accent-primary)' : '#e2e8f0',
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px', 
                  cursor: 'pointer',
                  height: '64px',
                  transition: '0.3s'
                }}
              >
                <div style={{ color: 'var(--accent-primary)' }}>{getCategoryIcon(cat.name)}</div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{cat.course_count.toString().padStart(2, '0')} Courses</div>
                </div>
              </div>
            ))}
          </div>

          {showRightArrow && (
            <button onClick={handleNextCat} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <ChevronRight size={20} color="var(--accent-primary)" />
            </button>
          )}
        </div>
      </section>

      {/* Course Grid - Full Width */}
      <section style={{ width: '90%', padding: '0 5%' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '40px' }}>
           {selectedCategory === 'All' ? 'All Live Courses' : `${selectedCategory} Courses`}
        </h2>
        
        <div className="grid grid-cols-4" style={{ gap: '10px' }}>
          {filteredCourses.map(course => {
            const seatsLeft = (course.total_seats || 0) - (course.enrolled_count || 0);
            
            return (
              <div key={course.id} className="glass-card hover-lift" style={{ 
                background: 'white', 
                borderRadius: '15px', 
                overflow: 'hidden', 
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.4s'
              }}>
                {/* 1. Image */}
                <div style={{ height: '150px', width: '100%' }}>
                  <img src={course.thumbnail || 'https://via.placeholder.com/400x225'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={course.title} />
                </div>

                <div style={{ padding: '0', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  
                  {/* 2. Metrics Buttons Row - Adding small margin to keep away from edges */}
                  <div style={{ display: 'flex', gap: '5px', padding: '15px 10px 10px' }}>
                    <div style={{ flex: 1, background: '#f8fafc', color: '#475569', padding: '2px 5px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '800', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                       Batch {course.batch_no || '01'}
                    </div>
                    <div style={{ flex: 1, background: 'rgba(34, 197, 94, 0.08)', color: '#16a34a', padding: '2px 5px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '800', textAlign: 'center' }}>
                       {seatsLeft > 0 ? seatsLeft : 0} Seats Left
                    </div>
                    <div style={{ flex: 1, background: 'rgba(245, 158, 11, 0.08)', color: '#d97706', padding: '2px 5px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '800', textAlign: 'center' }}>
                       {getDaysLeft(course.start_date)}
                    </div>
                  </div>

                  {/* 3. Course Name */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', padding: '0 10px 15px', lineHeight: '1.3', flex: 1 }}>
                    {course.title}
                  </h3>

                  {/* 4. See Details Button */}
                  <div style={{ padding: '0 10px 15px' }}>
                    <Link to={`/course/${course.id}`} className="btn-primary" style={{ 
                      width: '100%', 
                      padding: '10px',
                      borderRadius: '10px', 
                      textAlign: 'center', 
                      textDecoration: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '10px',
                      fontWeight: '900',
                      fontSize: '0.95rem',
                      boxShadow: 'none'
                    }}>
                      See Details <ArrowRight size={18} />
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </section>

      <style>{`
        .hover-lift:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.08) !important;
          border-color: var(--accent-primary) !important;
        }
      `}</style>

    </div>
  );
};

export default CourseList;
