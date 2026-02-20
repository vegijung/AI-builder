import { useState } from 'react';
import { theme } from '../../styles/theme';
import { submitAssessmentLead } from '../../services/dataService';
import { isSupabaseConfigured } from '../../services/supabase';

const INDUSTRIES = [
  'Financial Services', 'Manufacturing', 'Retail & E-Commerce', 'Healthcare',
  'Technology', 'Professional Services', 'Energy & Utilities', 'Public Sector', 'Other',
];

const COMPANY_SIZES = ['1-50', '51-200', '201-1,000', '1,001-5,000', '5,000+'];

const BOOKING_URL = import.meta.env.VITE_BOOKING_URL || null;

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: theme.radii.lg,
  border: '1px solid ' + theme.colors.borderMedium, background: theme.colors.surface,
  fontSize: theme.typography.sizes.xl, fontFamily: theme.typography.fontFamily,
  color: theme.colors.textPrimary, outline: 'none', boxSizing: 'border-box',
  transition: `border-color ${theme.transitions.fast}`,
};

const labelStyle = {
  display: 'block', fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold,
  color: theme.colors.textSecondary, marginBottom: 4,
};

export function LeadCaptureCard({ selectedAreas, areaRatings, readinessRatings, overallScore, leadSubmitted, onLeadSubmitted }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', industry: '', companySize: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isSupabaseConfigured()) return null;

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const canSubmit = form.name.trim() && form.email.trim() && form.company.trim() && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitAssessmentLead({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        company: form.company.trim(),
        industry: form.industry || null,
        companySize: form.companySize || null,
        selectedAreas,
        areaRatings,
        readinessRatings,
        overallScore,
      });
      onLeadSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (leadSubmitted) {
    return (
      <div style={{
        background: `linear-gradient(135deg, ${theme.colors.textPrimary}, #3a3530)`,
        borderRadius: theme.radii.xl, padding: 28, marginBottom: 28,
        boxShadow: theme.shadows.elevated, animation: 'fadeIn 0.3s ease-out',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>&#10003;</span>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.primary }}>
            Thank you for your interest!
          </h3>
        </div>
        <p style={{ fontSize: theme.typography.sizes.xxl, color: '#ccc8c4', margin: '0 0 16px 0', lineHeight: 1.5 }}>
          One of our AI consultants will review your assessment and reach out with personalized recommendations.
        </p>
        {BOOKING_URL ? (
          <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: theme.radii.xl,
            background: theme.colors.primary, color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold,
            textDecoration: 'none', transition: `opacity ${theme.transitions.fast}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Book a Free 30-Min Sparring Session &rarr;
          </a>
        ) : (
          <a href="mailto:info@mmgmc.ch?subject=AI%20Assessment%20Follow-up" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: theme.radii.xl,
            background: theme.colors.primary, color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold,
            textDecoration: 'none', transition: `opacity ${theme.transitions.fast}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Get in Touch &rarr;
          </a>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.colors.textPrimary}, #3a3530)`,
      borderRadius: theme.radii.xl, padding: 28, marginBottom: 28,
      boxShadow: theme.shadows.elevated, animation: 'fadeIn 0.3s ease-out',
    }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.primary }}>
        Want to discuss these results with an AI expert?
      </h3>
      <p style={{ fontSize: theme.typography.sizes.xxl, color: '#ccc8c4', margin: '0 0 20px 0', lineHeight: 1.5 }}>
        Leave your details and one of our consultants will reach out with a personalized recommendation based on your assessment.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ ...labelStyle, color: '#a0a0a0' }}>Name *</label>
            <input type="text" value={form.name} onChange={handleChange('name')} placeholder="Your name"
              style={inputStyle} maxLength={200} required />
          </div>
          <div>
            <label style={{ ...labelStyle, color: '#a0a0a0' }}>Email *</label>
            <input type="email" value={form.email} onChange={handleChange('email')} placeholder="you@company.com"
              style={inputStyle} maxLength={200} required />
          </div>
          <div>
            <label style={{ ...labelStyle, color: '#a0a0a0' }}>Company *</label>
            <input type="text" value={form.company} onChange={handleChange('company')} placeholder="Company name"
              style={inputStyle} maxLength={200} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ ...labelStyle, color: '#a0a0a0' }}>Industry</label>
            <select value={form.industry} onChange={handleChange('industry')}
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}>
              <option value="">Select industry...</option>
              {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <div>
            <label style={{ ...labelStyle, color: '#a0a0a0' }}>Company Size</label>
            <select value={form.companySize} onChange={handleChange('companySize')}
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}>
              <option value="">Select size...</option>
              {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={!canSubmit} style={{
              width: '100%', padding: '10px 24px', borderRadius: theme.radii.lg, border: 'none',
              background: canSubmit ? theme.colors.primary : theme.colors.borderMedium,
              color: canSubmit ? theme.colors.textPrimary : theme.colors.textDisabled,
              fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold,
              cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: theme.typography.fontFamily,
              transition: `all ${theme.transitions.fast}`,
            }}
              onMouseEnter={e => { if (canSubmit) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {submitting ? 'Sending...' : 'Get Expert Feedback'}
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: '#D94070', fontSize: theme.typography.sizes.lg, margin: 0 }}>{error}</p>
        )}

        <p style={{ fontSize: theme.typography.sizes.base, color: '#8a8580', margin: 0 }}>
          We respect your privacy. Your data will only be used to provide you with AI consulting insights.
        </p>
      </form>
    </div>
  );
}
