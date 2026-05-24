import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { SiteContext } from '../context/SiteContext';
import { 
  Search, Users, PlayCircle, Star, ArrowRight, CheckCircle, 
  ChevronLeft, ChevronRight, Layout, Book, Code, Monitor, Briefcase,
  Calendar, UserPlus, Clock, Tv, Heart, GraduationCap, Zap, Radio, User
} from 'lucide-react';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);
  const { settings } = useContext(SiteContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const categoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [categories]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
    if (user) {
      api.get('lms/wishlists/').then(res => setWishlist(res.data)).catch(console.error);
    }
  }, [user]);

  const toggleWishlist = async (courseId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert("Please log in to save courses to your wishlist.");
    
    const existingItem = wishlist.find(w => w.course === courseId);
    try {
      if (existingItem) {
        await api.delete(`lms/wishlists/${existingItem.id}/`);
        setWishlist(wishlist.filter(w => w.id !== existingItem.id));
      } else {
        const res = await api.post('lms/wishlists/', { course: courseId });
        setWishlist([...wishlist, res.data]);
      }
    } catch (err) {
      console.error("Wishlist error", err);
    }
  };

  // Sync selectedCategory with categoryParam from URL search params
  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const matchedCat = categories.find(c => c.id.toString() === categoryParam);
      if (matchedCat) {
        setSelectedCategory(matchedCat.name);
      } else {
        setSelectedCategory(categories[0]?.name || '');
      }
    } else if (!categoryParam && categories.length > 0) {
      setSelectedCategory(categories[0]?.name || '');
    }
  }, [categoryParam, categories]);

  const filteredCourses = useMemo(() => {
    let filtered = courses;
    if (selectedCategory) {
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

  const liveCoursesList = filteredCourses.filter(c => c.course_type !== 'pre_recorded');
  const preRecordedCoursesList = filteredCourses.filter(c => c.course_type === 'pre_recorded');

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
    <div className="animate-fade-in" style={{ background: '#fdfdfd', minHeight: '100vh', paddingBottom: '100px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Premium Hero Section - Full Width */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '30px 50px 120px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4rem', boxSizing: 'border-box' }}>
          <div style={{ flex: '1' }}>
             {settings.hero_badge_text && (
               <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#818cf8', fontWeight: '600', fontSize: '0.9rem', marginBottom: '20px' }}>
                 {settings.hero_badge_text}
               </div>
             )}
             {settings.hero_heading && (
               <h1 style={{ fontSize: '3.2rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-0.04em' }}>
                 {(() => {
                    const heading = settings.hero_heading;
                    const highlight = settings.hero_highlighted_word;
                    if (heading.includes(highlight) && highlight) {
                      const parts = heading.split(highlight);
                      return <>{parts[0]}<span style={{ color: '#818cf8' }}>{highlight}</span>{parts.slice(1).join(highlight)}</>;
                    }
                    return heading;
                 })()}
               </h1>
             )}
             {settings.hero_subheading && (
               <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '40px', maxWidth: '600px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                 {settings.hero_subheading}
               </p>
             )}
             
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
             {settings.hero_image && (
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
                   src={settings.hero_image} 
                   alt="Hero" 
                   style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
                 />
               </div>
             )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Bar - Full Width */}
      <div style={{ width: '100%', marginTop: '-50px', marginBottom: '60px', position: 'relative', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 50px', boxSizing: 'border-box' }}>
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
      </div>

      {/* Category Section - Full Width */}
      <section style={{ width: '100%', marginBottom: '40px' }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 50px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          <Radio color="#ef4444" size={28} />
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Upcoming Live Course</h2>
        </div>
        
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {canScrollLeft && categories.length > 4 && (
            <div 
              onClick={() => scrollCategories('left')}
              style={{ 
                position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)',
                background: 'white', borderRadius: '50%', width: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', zIndex: 10, border: '1px solid #e2e8f0'
              }}
            >
              <ChevronLeft size={20} color="#0f172a" />
            </div>
          )}
          <div 
            ref={categoryScrollRef}
            onScroll={handleScroll}
            style={{ 
              display: 'flex', overflowX: 'auto', gap: '15px', paddingBottom: '10px', 
              scrollbarWidth: 'none', msOverflowStyle: 'none', flex: 1, scrollBehavior: 'smooth'
            }}>
              {categories.map(cat => {
                const isActive = selectedCategory === cat.name;
                return (
                  <div 
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setSearchParams({ category: cat.id.toString() });
                    }}
                    style={{ 
                      flex: '0 0 auto',
                      padding: '8px 12px',
                      background: isActive ? '#1e293b' : 'white', 
                      border: '1px solid',
                      borderColor: isActive ? '#1e293b' : '#e2e8f0',
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      cursor: 'pointer',
                      transition: '0.3s'
                    }}
                  >
                    <div style={{ 
                      background: isActive ? 'rgba(255,255,255,0.1)' : '#f8fafc', 
                      padding: '6px', 
                      borderRadius: '8px',
                      color: isActive ? '#fbbf24' : '#64748b' 
                    }}>
                      {getCategoryIcon(cat.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: isActive ? 'white' : '#0f172a', marginBottom: '2px' }}>{cat.name}</div>
                      <div style={{ fontSize: '0.65rem', color: isActive ? '#cbd5e1' : '#64748b' }}>
                        • {cat.course_count?.toString() || '0'} Course
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          {canScrollRight && categories.length > 4 && (
            <div 
              onClick={() => scrollCategories('right')}
              style={{ 
                position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)',
                background: 'white', borderRadius: '50%', width: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', zIndex: 10, border: '1px solid #e2e8f0'
              }}
            >
              <ChevronRight size={20} color="#0f172a" />
            </div>
          )}
        </div>
        </div>
      </section>

      {/* Live Course Grid - Full Width */}
      <section style={{ width: '100%', marginBottom: '40px' }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 50px', boxSizing: 'border-box' }}>
            {liveCoursesList.length > 0 ? (
              <div className="grid grid-cols-4" style={{ gap: '20px' }}>
                {liveCoursesList.map(course => {
                  const seatsLeft = (course.total_seats || 0) - (course.enrolled_count || 0);
                  
                  return (
                    <div key={course.id} className="glass-card hover-lift" style={{ 
                      background: 'white', 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.4s',
                      padding: 0
                    }}>
                      <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                        <img src={course.thumbnail || 'https://via.placeholder.com/400x225'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={course.title} />
                      </div>

                      <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                          <div style={{ background: '#f8fafc', color: '#475569', padding: '6px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid #e2e8f0' }}>
                             Batch {course.batch_no || '01'}
                          </div>
                          <div style={{ background: '#f8fafc', color: '#475569', padding: '6px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <User size={12} /> {seatsLeft > 0 ? seatsLeft : 0} Seats Left
                          </div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ display: 'inline-flex', background: '#f8fafc', color: '#475569', padding: '6px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid #e2e8f0', alignItems: 'center', gap: '4px' }}>
                             <Clock size={12} /> {getDaysLeft(course.start_date)}
                          </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '20px', lineHeight: '1.4', flex: 1 }}>
                          {course.title}
                        </h3>

                        <div>
                          <Link to={`/course/${course.id}`} style={{ 
                            width: '100%', 
                            padding: '12px',
                            borderRadius: '8px', 
                            textAlign: 'center', 
                            textDecoration: 'none', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            background: '#f1f5f9',
                            color: '#0f172a',
                            transition: '0.2s'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                          >
                            SEE DETAILS <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>No live courses found for this category.</div>
            )}
        </div>
      </section>

      {/* Pre-Recorded Course Grid - Full Width */}
      {preRecordedCoursesList.length > 0 && (
      <section style={{ width: '100%', marginBottom: '60px' }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 50px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
              <PlayCircle color="#3b82f6" size={28} />
              <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Pre-Recorded Courses</h2>
            </div>
            <div className="grid grid-cols-4" style={{ gap: '20px' }}>
              {preRecordedCoursesList.map(course => {
                const catName = course.category_name || (categories.find(cat => cat.id === (course.category?.id || course.category))?.name) || 'Uncategorized';
                
                return (
                  <div key={course.id} className="glass-card hover-lift" style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s',
                    padding: 0
                  }}>
                    <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                      <img src={course.thumbnail || 'https://via.placeholder.com/400x225'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={course.title} />
                    </div>

                    <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'inline-flex', background: '#f8fafc', color: '#3b82f6', padding: '6px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', border: '1px solid #bfdbfe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                           {catName}
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '20px', lineHeight: '1.4', flex: 1 }}>
                        {course.title}
                      </h3>

                      <div>
                        <Link to={`/course/${course.id}`} style={{ 
                          width: '100%', 
                          padding: '12px',
                          borderRadius: '8px', 
                          textAlign: 'center', 
                          textDecoration: 'none', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '8px',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          background: '#f1f5f9',
                          color: '#0f172a',
                          transition: '0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                        >
                          SEE DETAILS <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      </section>
      )}

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
