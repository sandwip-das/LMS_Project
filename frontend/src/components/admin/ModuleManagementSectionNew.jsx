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

      await api.patch(\lms/courses/\/\, { modules: updatedModules });
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
                {courses.find(c => c.id == selectedCourseId)?.modules?.map((m, i) => <option key={i} value={i}>{m.name || \Module \\}</option>)}
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
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Wk</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Topic Title</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Live Classes</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Quizzes</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '10px', width: '80px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((w, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{w.week_number}</td>
                      <td style={{ padding: '10px' }}>{w.topic_title}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{w.live_classes?.length || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{w.quiz_count}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{w.is_disabled ? <span style={{ color: '#ef4444' }}>Disabled</span> : <span style={{ color: '#22c55e' }}>Active</span>}</td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => { setWeekForm(w); setWeeks(weeks.filter((_, idx) => idx !== i)); }} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}><Edit size={16}/></button>
                        <button onClick={() => setWeeks(weeks.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
