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
  { id: 'data', label: 'Data Readiness', description: 'Clean, accessible, well-governed data' },
  { id: 'infra', label: 'Technical Infrastructure', description: 'Cloud, APIs, ML platforms, integration capability' },
  { id: 'talent', label: 'Talent & Skills', description: 'AI/ML expertise, data literacy across teams' },
  { id: 'leadership', label: 'Leadership Buy-in', description: 'Executive sponsorship, budget allocation, change management' },
];

export const ADOPTION_LEVELS = [
  { score: 1, label: 'None', description: 'No AI initiatives in this area' },
  { score: 2, label: 'Exploring', description: 'Researching possibilities, no active projects' },
  { score: 3, label: 'Piloting', description: 'Running 1-2 proof of concepts' },
  { score: 4, label: 'Scaling', description: 'Multiple AI solutions in production' },
  { score: 5, label: 'Optimized', description: 'AI deeply embedded, continuously improving' },
];

export const ROADMAP_PHASES = [
  { id: 'quickWins', label: 'Quick Wins', timeframe: '0-3 months', description: 'High maturity, immediate value', color: '#50D8A8' },
  { id: 'mediumTerm', label: 'Medium Term', timeframe: '3-12 months', description: 'Builds on quick wins', color: '#5BC8D4' },
  { id: 'strategic', label: 'Strategic', timeframe: '12+ months', description: 'Transformative, long-term impact', color: '#7B68C4' },
];
