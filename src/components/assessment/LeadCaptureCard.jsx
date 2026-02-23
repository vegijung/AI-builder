import { useState } from 'react';
import { theme } from '../../styles/theme';
import { submitAssessmentLead } from '../../services/dataService';
import { isSupabaseConfigured } from '../../services/supabase';
import { INDUSTRIES, COMPANY_SIZES } from '../../data/constants';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

async function sendEmailNotification(leadData) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) return;
  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          lead_name: leadData.name,
          lead_email: leadData.email,
          lead_company: leadData.company,
          lead_industry: leadData.industry || 'Not specified',
          lead_company_size: leadData.companySize || 'Not specified',
          lead_score: leadData.overallScore?.toFixed(1) || '\u2014',
        },
      }),
    });
  } catch {
    // best-effort
  }
}

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: theme.radii.lg,
  border: '1px solid ' + theme.colors.borderMedium, background: theme.colors.surface,
  fontSize: theme.typography.sizes.xl, fontFamily: theme.typography.fontFamily,
  color: theme.colors.textPrimary, outline: 'none', boxSizing: 'border-box',
  transition: `border-color ${theme.transitions.fast}`,
};

const labelStyle = {
  display: 'block', fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold,
  color: '#a0a0a0', marginBottom: 4,
};

export function LeadCaptureCard({
  selectedAreas, areaRatings, readinessRatings, overallScore, companyProfile,
  priorities, leadSubmitted, onLeadSubmitted,
  recommendationCount, topUseCaseName, lowestDimension,
}) {
  const [form, setForm] = useState({
    name: '', email: '', company: '',
    industry: companyProfile?.industry || '',
    companySize: companyProfile?.companySize || '',
  });
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
      const leadData = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        company: form.company.trim(),
        industry: form.industry || null,
        companySize: form.companySize || null,
        selectedAreas,
        areaRatings,
        readinessRatings,
        overallScore,
        priorities: priorities || [],
      };
      await submitAssessmentLead(leadData);
      sendEmailNotification(leadData);
      onLeadSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const recCount = recommendationCount || 0;

  if (leadSubmitted) return null;

  const headline = recCount > 3
    ? `We found ${recCount} AI opportunities for your organization`
    : 'Want to discuss these results with an AI expert?';

  let subtitle;
  if (lowestDimension && lowestDimension.score < 3.0 && recCount > 3) {
    subtitle = `Your ${lowestDimension.label} score (${lowestDimension.score.toFixed(1)}/5) is limiting several of your recommended use cases. Unlock all results to see the full picture.`;
  } else if (topUseCaseName && recCount > 3) {
    subtitle = `Unlock all recommendations and get a detailed implementation plan. Your biggest opportunity: ${topUseCaseName}.`;
  } else {
    subtitle = 'Leave your details and one of our consultants will reach out with a personalized recommendation based on your assessment.';
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.colors.textPrimary}, #3a3530)`,
      borderRadius: theme.radii.xl, padding: 28, marginBottom: 28,
      boxShadow: theme.shadows.elevated, animation: 'fadeIn 0.3s ease-out',
    }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.primary }}>
        {headline}
      </h3>
      <p style={{ fontSize: theme.typography.sizes.xxl, color: '#ccc8c4', margin: '0 0 20px 0', lineHeight: 1.5 }}>
        {subtitle}
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input type="text" value={form.name} onChange={handleChange('name')} placeholder="Your name"
              style={inputStyle} maxLength={200} required />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" value={form.email} onChange={handleChange('email')} placeholder="you@company.com"
              style={inputStyle} maxLength={200} required />
          </div>
          <div>
            <label style={labelStyle}>Company *</label>
            <input type="text" value={form.company} onChange={handleChange('company')} placeholder="Company name"
              style={inputStyle} maxLength={200} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Industry</label>
            <select value={form.industry} onChange={handleChange('industry')}
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}>
              <option value="">Select industry...</option>
              {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Company Size</label>
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
              {submitting ? 'Sending...' : 'Unlock All Results'}
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
