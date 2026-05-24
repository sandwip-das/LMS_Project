// --- 0. All Courses Section ---
const AllCoursesSection = ({ courses, categories }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedCourses = React.useMemo(() => {
    return [...courses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [courses]);

  const liveCourses = sortedCourses.filter(c => c.course_type !== 'pre_recorded');
  const preRecordedCourses = sortedCourses.filter(c => c.course_type === 'pre_recorded');

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const start = new Date(dateStr);
    const diffTime = start - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Pre-recorded Courses (Cards) */}
      <div className="glass-card" style={{ background: 'white', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' }}>Pre-Recorded Courses</h3>
        </div>
        {preRecordedCourses.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No pre-recorded courses found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {preRecordedCourses.map(c => {
              const catName = c.category_name || (categories.find(cat => cat.id === (c.category?.id || c.category))?.name) || 'Uncategorized';
              return (
                <div key={c.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '160px', background: '#f1f5f9', position: 'relative' }}>
                    {c.thumbnail || c.cover_image ? (
                      <img src={c.thumbnail || c.cover_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={c.title} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}><ImageIcon size={48} /></div>
                    )}
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{catName}</div>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.4' }}>{c.title}</h4>
                    <div style={{ marginTop: 'auto' }}>
                      <button onClick={() => window.open(\/course/\\, '_blank')} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--black-accent)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', transition: '0.2s' }}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Courses (Table) */}
      <div className="glass-card" style={{ background: 'white', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' }}>Live Courses</h3>
        </div>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '0.8rem', color: '#475569' }}>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Course Name</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Batch</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Start Date</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Price</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Seats</th>
                <th style={{ padding: '10px 15px', fontWeight: '800' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {liveCourses.map(c => {
                const startDate = c.start_date ? new Date(c.start_date) : null;
                const isUpcoming = startDate && startDate >= today;
                const daysLeft = getDaysUntil(c.start_date);

                return (
                  <tr key={c.id} onClick={() => window.open(\/course/\\, '_blank')} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', background: isUpcoming ? 'rgba(99, 102, 241, 0.02)' : 'transparent', cursor: 'pointer' }}>
                    <td style={{ padding: '15px', fontWeight: '800', color: '#0f172a' }}>{c.title}</td>
                    <td style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Batch {c.batch_no || '01'}</td>
                    <td style={{ padding: '15px', color: '#0f172a', fontWeight: '500' }}>
                      {c.start_date ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{formatDate(c.start_date)}</span>
                          {isUpcoming && (
                            <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: '600' }}>({daysLeft} days to go)</span>
                          )}
                        </div>
                      ) : 'TBA'}
                    </td>
                    <td style={{ padding: '15px', fontWeight: '800', color: '#0f172a' }}>?{c.price || '0'}</td>
                    <td style={{ padding: '15px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontWeight: '700' }}>{c.enrolled_count || 0}</span><span style={{ color: '#94a3b8' }}>/</span><span>{c.total_seats || 0}</span></div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      {isUpcoming ? (
                        <span style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>Upcoming</span>
                      ) : (
                        <span style={{ background: 'rgba(74, 222, 128, 0.12)', color: '#15803d', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>Ongoing / Past</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {liveCourses.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No live courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
