import { USE_CASES } from './useCases';

export const MATURITY_LABELS = ['', 'Experimental', 'Emerging', 'Established', 'Mature', 'Commodity'];
export const MATURITY_COLORS = ['', '#D94070', '#F47B20', '#FBB740', '#5BC8D4', '#50D8A8'];

export const VALUE_CHAIN_SHORT_LABELS = {
  'Business Direction / Management': 'Management',
  'Firm Infrastructure': 'Infrastructure',
  'Human Ressource Management': 'HR',
  Technology: 'Technology',
  Procurement: 'Procurement',
  'Legal / Compliance': 'Legal / Compliance',
  'Marketing / Sales': 'Marketing & Sales',
  Service: 'Service',
  'Product Management': 'Product Management',
  Logistics: 'Logistics',
  Operations: 'Operations',
};

export const VALUE_CHAIN_AREAS = [...new Set(USE_CASES.map(uc => uc.valueChainArea))].sort();

export const READINESS_DIMENSIONS = [
  {
    id: 'data', label: 'Data Readiness',
    subQuestions: [
      { id: 'data_governance', label: 'Data Governance', description: 'Clear data ownership, policies, and compliance processes' },
      { id: 'data_accessibility', label: 'Data Accessibility', description: 'Integrated systems, APIs, and a single source of truth' },
      { id: 'data_quality', label: 'Data Quality', description: 'Clean, consistent, and well-labeled datasets' },
    ],
  },
  {
    id: 'infra', label: 'Technical Infrastructure',
    subQuestions: [
      { id: 'infra_cloud', label: 'Cloud & Compute', description: 'Cloud-native, scalable compute infrastructure' },
      { id: 'infra_integration', label: 'Integration Capability', description: 'APIs, middleware, and system interoperability' },
      { id: 'infra_ml', label: 'ML/AI Platforms', description: 'Tooling, MLOps pipelines, and model serving' },
    ],
  },
  {
    id: 'talent', label: 'Talent & Skills',
    subQuestions: [
      { id: 'talent_expertise', label: 'AI/ML Expertise', description: 'Dedicated data science or AI engineering team' },
      { id: 'talent_literacy', label: 'Data Literacy', description: 'Organization-wide understanding of data-driven decisions' },
      { id: 'talent_change', label: 'Change Management', description: 'Ability to adopt new tools and processes across teams' },
    ],
  },
  {
    id: 'leadership', label: 'Leadership & Strategy',
    subQuestions: [
      { id: 'leadership_sponsor', label: 'Executive Sponsorship', description: 'C-level champion actively driving AI initiatives' },
      { id: 'leadership_budget', label: 'Budget Allocation', description: 'Dedicated AI/innovation budget secured' },
      { id: 'leadership_alignment', label: 'Strategic Alignment', description: 'AI initiatives tied directly to business strategy' },
    ],
  },
];

export const ALL_READINESS_KEYS = READINESS_DIMENSIONS.flatMap(d => d.subQuestions.map(sq => sq.id));

export const STRATEGIC_PRIORITIES = [
  { id: 'cost', label: 'Cost Reduction & Efficiency', description: 'Automate manual work, reduce operational costs, streamline processes', areas: ['Firm Infrastructure', 'Operations', 'Logistics', 'Procurement'], categories: ['Automation & Execution'] },
  { id: 'revenue', label: 'Revenue Growth & New Business', description: 'Find new customers, increase sales, expand market reach', areas: ['Marketing / Sales', 'Product Management', 'Business Direction / Management'], categories: ['Prediction & Optimization', 'Generation & Creativity'] },
  { id: 'cx', label: 'Customer Experience & Retention', description: 'Improve service quality, personalize interactions, reduce churn', areas: ['Service', 'Marketing / Sales'], categories: ['Interaction & Assistance', 'Understanding & Summarization'] },
  { id: 'ops', label: 'Operational Excellence & Quality', description: 'Improve consistency, reduce errors, enhance monitoring', areas: ['Operations', 'Firm Infrastructure', 'Technology'], categories: ['Prediction & Optimization', 'Extraction & Structuring'] },
  { id: 'innovation', label: 'Innovation & Speed to Market', description: 'Accelerate product development, experiment faster, stay ahead', areas: ['Technology', 'Product Management'], categories: ['Coding & Development', 'Generation & Creativity'] },
];

export const INDUSTRIES = [
  'Financial Services', 'Manufacturing', 'Retail & E-Commerce', 'Healthcare',
  'Technology', 'Professional Services', 'Energy & Utilities', 'Public Sector', 'Other',
];

export const COMPANY_SIZES = ['1-50', '51-200', '201-1,000', '1,001-5,000', '5,000+'];

export const ADOPTION_LEVELS = [
  { score: 1, label: 'None', description: 'No AI initiatives in this area' },
  { score: 2, label: 'Exploring', description: 'Researching possibilities, no active projects' },
  { score: 3, label: 'Piloting', description: 'Running 1-2 proof of concepts' },
  { score: 4, label: 'Scaling', description: 'Multiple AI solutions in production' },
  { score: 5, label: 'Optimized', description: 'AI deeply embedded, continuously improving' },
];

export const CATEGORY_READINESS_MAP = {
  'Understanding & Summarization': { dims: ['data', 'infra'], reason: 'Summarization and search AI relies on well-structured, accessible data and integration with existing systems.' },
  'Extraction & Structuring': { dims: ['data'], reason: 'Extraction AI needs clean, well-governed data sources to produce reliable results.' },
  'Generation & Creativity': { dims: ['infra', 'talent'], reason: 'Generative AI requires scalable compute infrastructure and teams ready to adopt new creative workflows.' },
  'Prediction & Optimization': { dims: ['data', 'infra'], reason: 'Predictive models depend on high-quality historical data and robust compute infrastructure.' },
  'Interaction & Assistance': { dims: ['data', 'talent'], reason: 'Conversational AI needs a solid knowledge base and organization-wide readiness to adopt new interaction patterns.' },
  'Automation & Execution': { dims: ['infra', 'talent'], reason: 'Automation requires strong system integration and change management capacity across teams.' },
  'Coding & Development': { dims: ['infra', 'talent'], reason: 'AI development tools need modern toolchains and technical teams ready to integrate them.' },
};

export const ROADMAP_PHASES = [
  { id: 'quickWins', label: 'Quick Wins', timeframe: '0-3 months', description: 'High maturity, immediate value', color: '#50D8A8' },
  { id: 'mediumTerm', label: 'Medium Term', timeframe: '3-12 months', description: 'Builds on quick wins', color: '#5BC8D4' },
  { id: 'strategic', label: 'Strategic', timeframe: '12+ months', description: 'Transformative, long-term impact', color: '#7B68C4' },
];
