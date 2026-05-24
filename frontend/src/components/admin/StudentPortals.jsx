import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, User, X, BookOpen, Clock, Mail, Phone, Calendar, GraduationCap } from 'lucide-react';
import api from '../../api';

const StudentPortals = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showPortal, setShowPortal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filter States
  const [selCat, setSelCat] = useState('');
  const [selCourse, setSelCourse] = useState('');
  const [selBatch, setSelBatch] = useState('');
  const [enrolledStatus, setEnrolledStatus] = useState('all'); // all, enrolled, not_enrolled

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, courseRes, batchRes, studentRes, enrollRes] = await Promise.all([
        api.get('lms/categories/'),
        api.get('lms/courses/'),
        api.get('lms/batches/'),
        api.get('users/students/'),
        api.get('lms/enrollments/')
      ]);
      
      setCategories(catRes.data.results || catRes.data);
      setCourses(courseRes.data.results || courseRes.data);
      setBatches(batchRes.data.results || batchRes.data);
      
      const rawStudents = studentRes.data.results || studentRes.data;
      setStudents(rawStudents);
      
      setEnrollments(enrollRes.data.results || enrollRes.data);
    } catch (err) {
      console.error("Error fetching student portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filteredData = students.filter(student => {
    const studentEnrollments = enrollments.filter(e => e.student === student.id);
    const isEnrolled = studentEnrollments.length > 0;

    const matchesSearch = student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.mobile_number?.includes(searchQuery) ||
                         student.username?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (enrolledStatus === 'enrolled' && !isEnrolled) return false;
    if (enrolledStatus === 'not_enrolled' && isEnrolled) return false;

    if (selCat || selCourse || selBatch) {
      if (!isEnrolled) return false;
      
      const hasMatch = studentEnrollments.some(e => {
        let match = true;
        if (selCourse && e.course !== parseInt(selCourse)) match = false;
        if (selBatch && e.batch !== parseInt(selBatch)) match = false;
        
        if (selCat) {
          const course = courses.find(c => c.id === e.course);
          if (course?.category !== parseInt(selCat)) match = false;
        }
        return match;
      });
      if (!hasMatch) return false;
    }

    return true;
  });

  const getStudentDisplayInfo = (student) => {
    const studentEnrollments = enrollments.filter(e => e.student === student.id);
    
    let activeEnrollment = null;
    if (selBatch) activeEnrollment = studentEnrollments.find(e => e.batch === parseInt(selBatch));
    else if (selCourse) activeEnrollment = studentEnrollments.find(e => e.course === parseInt(selCourse));
    else if (selCat) {
      activeEnrollment = studentEnrollments.find(e => {
        const course = courses.find(c => c.id === e.course);
        return course?.category === parseInt(selCat);
      });
    } else {
      activeEnrollment = studentEnrollments[0]; 
    }

    return activeEnrollment;
  };

  const handleOpenPortal = (student) => {
    setSelectedStudent(student);
    setShowPortal(true);
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>Loading Student Records...</div>;

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ marginBottom: '10px' }}>
        <h2 style={{ marginBottom: '10px', fontWeight: '900', color: '#0f172a' }}>Student Portals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
            <input 
              type="text" 
              placeholder="Search Student..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <select value={selCat} onChange={e => { setSelCat(e.target.value); setSelCourse(''); setSelBatch(''); }} style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '0.85rem', outline: 'none' }}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>

          <select value={selCourse} onChange={e => { setSelCourse(e.target.value); setSelBatch(''); }} style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '0.85rem', outline: 'none' }}>
            <option value="">All Courses</option>
            {courses.filter(c => !selCat || c.category === parseInt(selCat)).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>

          <select value={selBatch} onChange={e => setSelBatch(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '0.85rem', outline: 'none' }}>
            <option value="">All Batches</option>
            {batches.filter(b => !selCourse || b.course === parseInt(selCourse)).map(b => <option key={b.id} value={b.id}>{b.batch_no}</option>)}
          </select>

          <select value={enrolledStatus} onChange={e => setEnrolledStatus(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', outline: 'none' }}>
            <option value="all">All Students</option>
            <option value="enrolled">Enrolled Only</option>
            <option value="not_enrolled">Not Enrolled</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
              <th style={{ padding: '5px' }}>Student Name</th>
              <th style={{ padding: '5px' }}>Contact Details</th>
              <th style={{ padding: '5px' }}>Active Course</th>
              <th style={{ padding: '5px' }}>Batch</th>
              <th style={{ padding: '5px' }}>Progress</th>
              <th style={{ padding: '5px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(student => {
              const enrollment = getStudentDisplayInfo(student);
              return (
                <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s' }}>
                  <td style={{ padding: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                         <User size={16} />
                      </div>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{student.full_name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '5px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>{student.email}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.mobile_number}</div>
                  </td>
                  <td style={{ padding: '5px', color: enrollment ? '#1e293b' : '#94a3b8', fontWeight: enrollment ? '600' : '400', fontSize: '0.85rem' }}>
                    {enrollment ? enrollment.course_title : 'No Active Course'}
                  </td>
                  <td style={{ padding: '5px', color: enrollment ? '#1e293b' : '#94a3b8', fontSize: '0.85rem' }}>
                    {enrollment ? enrollment.batch_no : 'N/A'}
                  </td>
                  <td style={{ padding: '5px' }}>
                    {enrollment ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${enrollment.progress || 0}%`, height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981' }}>{enrollment.progress || 0}%</span>
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>Not Enrolled</span>
                    )}
                  </td>
                  <td style={{ padding: '5px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleOpenPortal(student)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', background: '#eff6ff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                    >
                      Portal <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Portal Modal (Read-Only) */}
      {showPortal && selectedStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
           <div style={{ background: 'white', width: '700px', maxWidth: '95%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              {/* Modal Header */}
              <div style={{ padding: '25px 30px', background: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <GraduationCap size={28} />
                    </div>
                    <div>
                       <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedStudent.full_name}</h2>
                       <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem' }}>Student Portal View (Read-Only)</p>
                    </div>
                 </div>
                 <button onClick={() => setShowPortal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '30px', maxHeight: '70vh', overflowY: 'auto' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Basic Info */}
                    <section>
                       <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={18} color="#2563eb" /> Basic Information</h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <InfoItem icon={Mail} label="Email Address" value={selectedStudent.email} />
                          <InfoItem icon={Phone} label="Mobile Number" value={selectedStudent.mobile_number} />
                          <InfoItem icon={Calendar} label="Joined On" value={new Date(selectedStudent.date_joined).toLocaleDateString()} />
                          <InfoItem icon={GraduationCap} label="Student ID" value={selectedStudent.user_id_custom || 'N/A'} />
                       </div>
                    </section>

                    {/* Active Enrollments */}
                    <section>
                       <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={18} color="#10b981" /> Course Progress</h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {enrollments.filter(e => e.student === selectedStudent.id).map(en => (
                             <div key={en.id} style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontWeight: '800', marginBottom: '5px', fontSize: '0.9rem' }}>{en.course_title}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>Batch: {en.batch_no}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                   <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                      <div style={{ width: `${en.progress || 0}%`, height: '100%', background: '#10b981' }}></div>
                                   </div>
                                   <span style={{ fontWeight: '900', color: '#10b981', fontSize: '0.85rem' }}>{en.progress || 0}%</span>
                                </div>
                             </div>
                          ))}
                          {enrollments.filter(e => e.student === selectedStudent.id).length === 0 && (
                             <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #f1f5f9', borderRadius: '12px' }}>No active enrollments.</div>
                          )}
                       </div>
                    </section>
                 </div>
              </div>
              
              {/* Modal Footer */}
              <div style={{ padding: '20px 30px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
                 <button onClick={() => setShowPortal(false)} style={{ padding: '10px 25px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Close Portal</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
     <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color="#64748b" />
     </div>
     <div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '600' }}>{value}</div>
     </div>
  </div>
);

export default StudentPortals;
