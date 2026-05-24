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
      await api.patch(\lms/courses/\/\, {
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
              <textarea placeholder="Project Description (Currently Text)" value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})} rows="3" style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
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
