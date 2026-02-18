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
