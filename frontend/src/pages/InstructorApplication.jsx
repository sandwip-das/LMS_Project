import React, { useState } from 'react';
import api from '../api';
import { Upload, Send, CheckCircle } from 'lucide-react';

const InstructorApplication = () => {
  const [formData, setFormData] = useState({
    experience_years: '',
    portfolio_url: '',
    resume: null
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('experience_years', formData.experience_years);
    data.append('portfolio_url', formData.portfolio_url);
    if (formData.resume) data.append('resume', formData.resume);

    try {
      await api.post('users/instructor-applications/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit application. Make sure you are logged in.');
    }
  };

  if (submitted) {
    return (
      <div className="animate-fade-in glass-card" style={{ maxWidth: '600px', margin: '5rem auto', textAlign: 'center', padding: '4rem' }}>
        <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
        <h2>Application Submitted!</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Our team will review your profile and get back to you within 3-5 business days.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Join Our Instructor Community</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Share your expertise with thousands of students worldwide.</p>
      </div>

      <div className="glass-card">
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Years of Experience</label>
          <input 
            type="number" 
            placeholder="How many years have you been in the industry?"
            value={formData.experience_years}
            onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
            required
          />

          <label>Portfolio/LinkedIn URL</label>
          <input 
            type="url" 
            placeholder="https://yourportfolio.com"
            value={formData.portfolio_url}
            onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
          />

          <label>Resume (PDF)</label>
          <div style={{ border: '2px dashed var(--glass-border)', padding: '2rem', textAlign: 'center', borderRadius: '8px', marginBottom: '2rem' }}>
            <Upload style={{ marginBottom: '10px', color: 'var(--text-secondary)' }} />
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFormData({ ...formData, resume: e.target.files[0] })}
              style={{ display: 'block', margin: '0 auto' }}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>
            <Send size={18} /> Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default InstructorApplication;
