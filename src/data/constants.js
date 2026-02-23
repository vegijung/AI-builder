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
      { id: 'data_governance', label: 'Data Governance', description: 'Clear data ownership, policies, and compliance processes',
        guide: { low: 'No formal data policies; ownership unclear; compliance ad-hoc', mid: 'Some policies exist but inconsistently applied; ownership partially defined', high: 'Clear policies, defined owners, automated compliance checks' } },
      { id: 'data_accessibility', label: 'Data Accessibility', description: 'Integrated systems, APIs, and a single source of truth',
        guide: { low: 'Data siloed in disconnected systems; no APIs; manual exports', mid: 'Some integrations exist; partial API coverage; multiple sources of truth', high: 'Unified data platform; comprehensive APIs; single source of truth' } },
      { id: 'data_quality', label: 'Data Quality', description: 'Clean, consistent, and well-labeled datasets',
        guide: { low: 'Frequent data errors; inconsistent formats; no labeling standards', mid: 'Basic quality checks in place; some inconsistencies remain; partial labeling', high: 'Automated quality pipelines; consistent standards; well-labeled and documented' } },
    ],
  },
  {
    id: 'infra', label: 'Technical Infrastructure',
    subQuestions: [
      { id: 'infra_cloud', label: 'Cloud & Compute', description: 'Cloud-native, scalable compute infrastructure',
        guide: { low: 'On-premise only; no cloud strategy; limited compute capacity', mid: 'Partial cloud adoption; some scalable resources; migration underway', high: 'Cloud-native architecture; auto-scaling; GPU/TPU available on demand' } },
      { id: 'infra_integration', label: 'Integration Capability', description: 'APIs, middleware, and system interoperability',
        guide: { low: 'Manual file transfers between systems; no middleware; point-to-point integrations', mid: 'Some API-based integrations; middleware for core systems; gaps remain', high: 'Event-driven architecture; comprehensive API layer; seamless interoperability' } },
      { id: 'infra_ml', label: 'ML/AI Platforms', description: 'Tooling, MLOps pipelines, and model serving',
        guide: { low: 'No ML tools; models run in notebooks or local scripts only', mid: 'Some ML tools adopted; basic pipelines; manual model deployment', high: 'Full MLOps platform; automated training pipelines; model monitoring in production' } },
    ],
  },
  {
    id: 'talent', label: 'Talent & Skills',
    subQuestions: [
      { id: 'talent_expertise', label: 'AI/ML Expertise', description: 'Dedicated data science or AI engineering team',
        guide: { low: 'No dedicated AI/ML staff; relying on general IT or external consultants', mid: '1-2 data scientists or ML engineers; skills concentrated in one team', high: 'Established AI team with diverse specializations; active research and development' } },
      { id: 'talent_literacy', label: 'Data Literacy', description: 'Organization-wide understanding of data-driven decisions',
        guide: { low: 'Most staff unfamiliar with data concepts; decisions rarely data-driven', mid: 'Key teams use data for decisions; training programs starting; uneven adoption', high: 'Data-literate culture; self-service analytics widespread; data informs all major decisions' } },
      { id: 'talent_change', label: 'Change Management', description: 'Ability to adopt new tools and processes across teams',
        guide: { low: 'High resistance to new tools; no change management process; past rollouts struggled', mid: 'Some change management practices; mixed adoption rates; learning from past efforts', high: 'Proven change management framework; high adoption rates; culture embraces innovation' } },
    ],
  },
  {
    id: 'leadership', label: 'Leadership & Strategy',
    subQuestions: [
      { id: 'leadership_sponsor', label: 'Executive Sponsorship', description: 'C-level champion actively driving AI initiatives',
        guide: { low: 'No executive interest in AI; AI not discussed at leadership level', mid: 'Leadership aware and supportive but not actively championing AI', high: 'C-level sponsor actively driving AI agenda; regular board-level AI updates' } },
      { id: 'leadership_budget', label: 'Budget Allocation', description: 'Dedicated AI/innovation budget secured',
        guide: { low: 'No dedicated AI budget; projects funded ad-hoc from departmental budgets', mid: 'Some budget earmarked for AI/innovation; competes with other priorities', high: 'Dedicated multi-year AI budget; clear investment roadmap approved' } },
      { id: 'leadership_alignment', label: 'Strategic Alignment', description: 'AI initiatives tied directly to business strategy',
        guide: { low: 'AI not part of corporate strategy; initiatives disconnected from business goals', mid: 'AI mentioned in strategy but loosely connected to specific business outcomes', high: 'AI embedded in corporate strategy; clear KPIs linking AI to business value' } },
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
  { score: 1, label: 'None', description: 'No AI initiatives in this area',
    examples: ['No AI tools or pilots', 'AI not on the agenda', 'No data strategy for this area'] },
  { score: 2, label: 'Exploring', description: 'Researching possibilities, no active projects',
    examples: ['Evaluating AI vendors or tools', 'Discussing AI in leadership meetings', 'Identifying potential use cases'] },
  { score: 3, label: 'Piloting', description: 'Running 1-2 proof of concepts',
    examples: ['1-2 AI projects in testing', 'Small team experimenting', 'Initial results being evaluated'] },
  { score: 4, label: 'Scaling', description: 'Multiple AI solutions in production',
    examples: ['3+ AI tools in daily use', 'Dedicated team managing AI', 'Measurable ROI from AI'] },
  { score: 5, label: 'Optimized', description: 'AI deeply embedded, continuously improving',
    examples: ['AI integral to core workflows', 'Continuous model retraining', 'Organization-wide AI literacy'] },
];

export const READINESS_RATING_LABELS = ['None', 'Basic', 'Developing', 'Strong', 'Leading'];

export const CATEGORY_READINESS_MAP = {
  'Understanding & Summarization': { dims: ['data', 'infra'], reason: 'Summarization and search AI relies on well-structured, accessible data and integration with existing systems.' },
  'Extraction & Structuring': { dims: ['data'], reason: 'Extraction AI needs clean, well-governed data sources to produce reliable results.' },
  'Generation & Creativity': { dims: ['infra', 'talent'], reason: 'Generative AI requires scalable compute infrastructure and teams ready to adopt new creative workflows.' },
  'Prediction & Optimization': { dims: ['data', 'infra'], reason: 'Predictive models depend on high-quality historical data and robust compute infrastructure.' },
  'Interaction & Assistance': { dims: ['data', 'talent'], reason: 'Conversational AI needs a solid knowledge base and organization-wide readiness to adopt new interaction patterns.' },
  'Automation & Execution': { dims: ['infra', 'talent'], reason: 'Automation requires strong system integration and change management capacity across teams.' },
  'Coding & Development': { dims: ['infra', 'talent'], reason: 'AI development tools need modern toolchains and technical teams ready to integrate them.' },
};

export const MMG_EXPERTISE = {
  tagline: 'From strategy to production -- MMG delivers end-to-end AI transformation.',
  stats: { engagements: '50+', industries: 6, avgTimeToValue: '8-12 weeks' },
  industryCredentials: {
    'Financial Services': 'Guided 12+ financial institutions through AI-powered risk and compliance automation.',
    'Manufacturing': 'Delivered predictive maintenance and supply chain optimization for 3 leading manufacturers.',
    'Retail & E-Commerce': 'Implemented AI-driven personalization and demand forecasting for major retail brands.',
    'Healthcare': 'Enabled clinical decision support and operational efficiency through AI for 5 healthcare organizations.',
    'Technology': 'Helped 10+ tech companies integrate AI into their product offerings and internal operations.',
    'Professional Services': 'Deployed knowledge management and automation solutions for leading consulting and legal firms.',
    'Energy & Utilities': 'Built predictive asset management and grid optimization models for energy providers.',
    'Public Sector': 'Supported government agencies in responsible AI adoption for citizen services and operations.',
    'Other': 'Delivered AI strategy and implementation across diverse industries.',
  },
  readinessTierMessages: {
    low: 'MMG specializes in building AI foundations -- data governance, team enablement, and change management -- to help organizations like yours become AI-ready.',
    mid: 'MMG helps organizations at your stage prioritize the right use cases, run successful pilots, and build internal capabilities for scale.',
    high: 'Your organization is ready to scale. MMG accelerates implementation with proven frameworks, technical delivery, and organizational change support.',
  },
  categoryStrengths: {
    'Understanding & Summarization': 'MMG has deployed NLP and document intelligence solutions across 10+ enterprise clients.',
    'Extraction & Structuring': 'MMG has automated data extraction pipelines for finance, legal, and operations teams.',
    'Generation & Creativity': 'MMG has implemented generative AI workflows for content, design, and product development.',
    'Prediction & Optimization': 'MMG has built 15+ predictive models across finance, logistics, and operations.',
    'Interaction & Assistance': 'MMG has launched conversational AI and knowledge assistants for customer-facing and internal teams.',
    'Automation & Execution': 'MMG has delivered end-to-end process automation combining AI with RPA and workflow engines.',
    'Coding & Development': 'MMG has integrated AI-powered development tools to accelerate engineering productivity.',
  },
  nextSteps: [
    { title: 'Free Assessment Review', description: 'An MMG consultant reviews your results and prepares a tailored briefing.' },
    { title: '30-Min Strategy Call', description: 'We walk through your top opportunities and discuss feasibility for your context.' },
    { title: 'Custom Roadmap', description: 'Receive a detailed implementation plan with timelines, resources, and quick wins.' },
  ],
};

export const ROADMAP_PHASES = [
  { id: 'quickWins', label: 'Quick Wins', timeframe: '0-3 months', description: 'High maturity, immediate value', color: '#50D8A8' },
  { id: 'mediumTerm', label: 'Medium Term', timeframe: '3-12 months', description: 'Builds on quick wins', color: '#5BC8D4' },
  { id: 'strategic', label: 'Strategic', timeframe: '12+ months', description: 'Transformative, long-term impact', color: '#7B68C4' },
];
