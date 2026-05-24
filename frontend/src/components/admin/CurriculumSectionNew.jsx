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
  const [toolForm, setToolForm] = useState({ name: '' });
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

      const summaryText = \This course consists of \ intensive modules spanning over \ weeks of professional training.\;
      
      await api.patch(\lms/courses/\/\, {
        modules: modules.map(m => ({ 
          id: m.id,
          name: m.name, 
          duration_weeks: parseInt(m.duration) || 1, 
          instructor: resolveId(m.instructor) 
        })),
        moderators: moderatorId ? [resolveId(moderatorId)] : [],
        teaching_assistants: taIds.filter(id => id).map(id => resolveId(id)),
        tools: tools.filter(t => t.name),
        requirements: requirements.filter(r => r.description),
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
  const addTool = () => { if(toolForm.name) { setTools([...tools, toolForm]); setToolForm({ name: '' }); } };
  const addReq = () => { if(reqForm.description) { setRequirements([...requirements, reqForm]); setReqForm({ description: '' }); } };

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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr><th style={{ padding: '8px', textAlign: 'left' }}>Module Name</th><th style={{ padding: '8px', textAlign: 'left' }}>Weeks</th><th style={{ padding: '8px', textAlign: 'left' }}>Instructor</th><th style={{ padding: '8px', width: '50px' }}>Action</th></tr>
                </thead>
                <tbody>
                  {modules.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px' }}>{m.name}</td>
                      <td style={{ padding: '8px' }}>{m.duration}</td>
                      <td style={{ padding: '8px' }}>{m.instructor || 'Unassigned'}</td>
                      <td style={{ padding: '8px' }}>
                        <button onClick={() => { setModForm(m); setModules(modules.filter((_, idx) => idx !== i)); }} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}><Edit size={14}/></button>
                        <button onClick={() => setModules(modules.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <button onClick={addTool} style={{ padding: '6px 15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'600' }}>Add Tool</button>
            </div>
            {tools.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr><th style={{ padding: '8px', textAlign: 'left' }}>Tool Name</th><th style={{ padding: '8px', width: '50px' }}>Action</th></tr>
                </thead>
                <tbody>
                  {tools.map((t, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px' }}>{t.name}</td>
                      <td style={{ padding: '8px' }}>
                        <button onClick={() => { setToolForm(t); setTools(tools.filter((_, idx) => idx !== i)); }} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}><Edit size={14}/></button>
                        <button onClick={() => setTools(tools.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <SectionSubHeader title="Basic Requirements" icon={CheckCircle} />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input placeholder="Requirement Description" value={reqForm.description} onChange={e => setReqForm({...reqForm, description: e.target.value})} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize:'0.85rem' }} />
              <button onClick={addReq} style={{ padding: '6px 15px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'600' }}>Add Req</button>
            </div>
            {requirements.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr><th style={{ padding: '8px', textAlign: 'left' }}>Requirement</th><th style={{ padding: '8px', width: '50px' }}>Action</th></tr>
                </thead>
                <tbody>
                  {requirements.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px' }}>{r.description}</td>
                      <td style={{ padding: '8px' }}>
                        <button onClick={() => { setReqForm(r); setRequirements(requirements.filter((_, idx) => idx !== i)); }} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}><Edit size={14}/></button>
                        <button onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '12px', background: 'var(--black-accent)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', marginTop: '10px', fontSize: '1rem', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Curriculum'}</button>
        </>
      )}
    </div>
  );
};
