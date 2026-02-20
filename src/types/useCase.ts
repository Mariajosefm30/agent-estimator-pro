import { ResidualInputs } from './estimator';

export type Segment = 'smb' | 'smc' | 'enterprise';
export type Industry = 'financial_services' | 'healthcare' | 'manufacturing' | 'retail' | 'energy' | 'telecom' | 'professional_services' | 'public_sector' | 'technology' | 'other';
export type UseCaseCategory = 'operations' | 'customer' | 'finance' | 'content' | 'industry';

export interface UseCase {
  id: string;
  label: string;
  shortLabel: string;
  category: UseCaseCategory;
  icon: string;
  hook: string;
  industries: Industry[];
  segments: Segment[];
  avgFTEEquivalent: number;
  avgCycleTimeReductionPct: number;
  avgErrorReductionPct: number;
  estimatorDefaults: Partial<ResidualInputs>;
}

export interface DiscoveryState {
  segment: Segment | null;
  industry: Industry | null;
  selectedUseCaseIds: string[];
  aiMaturity: 'early' | 'scaling' | 'mature' | null;
  avgFTECost: number;
  fteRecoverablePct: number;
}

export const DEFAULT_DISCOVERY_STATE: DiscoveryState = {
  segment: null,
  industry: null,
  selectedUseCaseIds: [],
  aiMaturity: null,
  avgFTECost: 120000,
  fteRecoverablePct: 60,
};

export const SEGMENT_CONFIG: Record<Segment, { label: string; subtitle: string; icon: string; defaultUsers: number; defaultPTU: number; defaultGitHubSeats: number; defaultFabricSpend: number; defaultQueriesPerUser: number; hasMACC: boolean; acoDiscountPct: number; }> = {
  smb: { label: 'SMB', subtitle: 'Under 300 employees', icon: '🏢', defaultUsers: 100, defaultPTU: 0, defaultGitHubSeats: 10, defaultFabricSpend: 0, defaultQueriesPerUser: 15, hasMACC: false, acoDiscountPct: 5 },
  smc: { label: 'SMC', subtitle: '300 – 2,500 employees', icon: '🏬', defaultUsers: 500, defaultPTU: 20, defaultGitHubSeats: 50, defaultFabricSpend: 1000, defaultQueriesPerUser: 25, hasMACC: false, acoDiscountPct: 10 },
  enterprise: { label: 'Enterprise', subtitle: '2,500+ employees', icon: '🏙️', defaultUsers: 3000, defaultPTU: 100, defaultGitHubSeats: 200, defaultFabricSpend: 5000, defaultQueriesPerUser: 30, hasMACC: true, acoDiscountPct: 15 },
};

export const INDUSTRY_CONFIG: Record<Industry, { label: string; icon: string }> = {
  financial_services: { label: 'Financial Services', icon: '🏦' },
  healthcare: { label: 'Healthcare', icon: '🏥' },
  manufacturing: { label: 'Manufacturing', icon: '🏭' },
  retail: { label: 'Retail & E-Commerce', icon: '🛒' },
  energy: { label: 'Energy & Utilities', icon: '⚡' },
  telecom: { label: 'Telecommunications', icon: '📡' },
  professional_services: { label: 'Professional Services', icon: '💼' },
  public_sector: { label: 'Public Sector', icon: '🏛️' },
  technology: { label: 'Technology', icon: '💻' },
  other: { label: 'Other', icon: '🔷' },
};

export const USE_CASES: UseCase[] = [
  { id: 'order_to_cash', label: 'Order-to-Cash Automation', shortLabel: 'Order-to-Cash', category: 'operations', icon: '📦', hook: 'Cut order processing cycle time by ~40%', industries: ['retail', 'manufacturing', 'professional_services', 'technology'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 3.5, avgCycleTimeReductionPct: 40, avgErrorReductionPct: 55, estimatorDefaults: { activeUsers: 200, queriesPerUserPerMonth: 35, ptuHoursPerMonth: 20 } },
  { id: 'procurement_sourcing', label: 'Procurement & Sourcing', shortLabel: 'Procurement', category: 'operations', icon: '🤝', hook: 'Automate sourcing workflows and vendor management', industries: ['manufacturing', 'retail', 'professional_services', 'energy', 'public_sector'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 2.5, avgCycleTimeReductionPct: 35, avgErrorReductionPct: 40, estimatorDefaults: { activeUsers: 150, queriesPerUserPerMonth: 25, ptuHoursPerMonth: 10 } },
  { id: 'contract_lifecycle', label: 'Contract Lifecycle Management', shortLabel: 'Contract Lifecycle', category: 'operations', icon: '📄', hook: 'Reduce contract review time by ~50%', industries: ['financial_services', 'professional_services', 'manufacturing', 'healthcare'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 2, avgCycleTimeReductionPct: 50, avgErrorReductionPct: 35, estimatorDefaults: { activeUsers: 100, queriesPerUserPerMonth: 20, ptuHoursPerMonth: 10, fabricMonthlySpend: 500 } },
  { id: 'supply_chain', label: 'E2E Supply Chain Operations', shortLabel: 'Supply Chain', category: 'operations', icon: '🔗', hook: 'Real-time visibility and intelligent routing across the chain', industries: ['manufacturing', 'retail', 'energy'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 5, avgCycleTimeReductionPct: 30, avgErrorReductionPct: 45, estimatorDefaults: { activeUsers: 300, queriesPerUserPerMonth: 40, ptuHoursPerMonth: 60, fabricMonthlySpend: 3000 } },
  { id: 'predictive_maintenance', label: 'Predictive Maintenance & Asset Ops', shortLabel: 'Predictive Maintenance', category: 'operations', icon: '🔧', hook: 'Cut unplanned downtime by up to 70%', industries: ['manufacturing', 'energy', 'telecom'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 6, avgCycleTimeReductionPct: 30, avgErrorReductionPct: 70, estimatorDefaults: { activeUsers: 400, queriesPerUserPerMonth: 30, ptuHoursPerMonth: 80, fabricMonthlySpend: 5000 } },
  { id: 'field_operations', label: 'Field Operations Automation', shortLabel: 'Field Ops', category: 'operations', icon: '🔩', hook: 'Empower field workers with real-time AI guidance', industries: ['energy', 'manufacturing', 'telecom'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 3, avgCycleTimeReductionPct: 25, avgErrorReductionPct: 30, estimatorDefaults: { activeUsers: 500, queriesPerUserPerMonth: 20, ptuHoursPerMonth: 30 } },
  { id: 'contact_center', label: 'Contact Center Transformation', shortLabel: 'Contact Center', category: 'customer', icon: '🎧', hook: 'Resolve ~55% more cases without agent escalation', industries: ['retail', 'financial_services', 'telecom', 'healthcare', 'technology'], segments: ['smb', 'smc', 'enterprise'], avgFTEEquivalent: 8, avgCycleTimeReductionPct: 55, avgErrorReductionPct: 30, estimatorDefaults: { activeUsers: 500, queriesPerUserPerMonth: 80, ptuHoursPerMonth: 40 } },
  { id: 'personalized_patient', label: 'Personalized Patient Engagement', shortLabel: 'Patient Engagement', category: 'customer', icon: '🩺', hook: 'Improve patient adherence and reduce no-shows', industries: ['healthcare'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 4, avgCycleTimeReductionPct: 35, avgErrorReductionPct: 25, estimatorDefaults: { activeUsers: 2000, queriesPerUserPerMonth: 10, ptuHoursPerMonth: 15 } },
  { id: 'agentic_commerce', label: 'Agentic Commerce', shortLabel: 'Agentic Commerce', category: 'customer', icon: '🛍️', hook: 'Enable AI-driven shopping through 3rd-party agents', industries: ['retail', 'technology'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 2, avgCycleTimeReductionPct: 20, avgErrorReductionPct: 15, estimatorDefaults: { activeUsers: 5000, queriesPerUserPerMonth: 25, ptuHoursPerMonth: 30 } },
  { id: 'interactive_brand_agent', label: 'Interactive Brand & Product Agent', shortLabel: 'Brand Agent', category: 'customer', icon: '💬', hook: 'Always-on brand ambassador that converts and retains', industries: ['retail', 'technology', 'manufacturing'], segments: ['smb', 'smc', 'enterprise'], avgFTEEquivalent: 3, avgCycleTimeReductionPct: 30, avgErrorReductionPct: 20, estimatorDefaults: { activeUsers: 1000, queriesPerUserPerMonth: 30, ptuHoursPerMonth: 20 } },
  { id: 'loan_application', label: 'Loan Application Processing', shortLabel: 'Loan Processing', category: 'finance', icon: '🏠', hook: 'Reduce loan decisioning time from days to hours', industries: ['financial_services'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 4, avgCycleTimeReductionPct: 70, avgErrorReductionPct: 50, estimatorDefaults: { activeUsers: 200, queriesPerUserPerMonth: 40, ptuHoursPerMonth: 25 } },
  { id: 'fraud_aml', label: 'Fraud & AML Management', shortLabel: 'Fraud & AML', category: 'finance', icon: '🛡️', hook: 'Detect fraud patterns in real time with ~45% fewer false positives', industries: ['financial_services'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 5, avgCycleTimeReductionPct: 60, avgErrorReductionPct: 45, estimatorDefaults: { activeUsers: 100, queriesPerUserPerMonth: 50, ptuHoursPerMonth: 80, fabricMonthlySpend: 4000 } },
  { id: 'claims_processing', label: 'Claims Processing Automation', shortLabel: 'Claims Processing', category: 'finance', icon: '📋', hook: 'Process claims ~65% faster with fewer errors', industries: ['financial_services', 'healthcare'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 5, avgCycleTimeReductionPct: 65, avgErrorReductionPct: 45, estimatorDefaults: { activeUsers: 300, queriesPerUserPerMonth: 45, ptuHoursPerMonth: 30 } },
  { id: 'rev_cycle', label: 'Revenue Cycle Automation', shortLabel: 'Rev Cycle', category: 'finance', icon: '💵', hook: 'Reduce claim denials and accelerate reimbursements', industries: ['healthcare'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 7, avgCycleTimeReductionPct: 45, avgErrorReductionPct: 55, estimatorDefaults: { activeUsers: 250, queriesPerUserPerMonth: 30, ptuHoursPerMonth: 20 } },
  { id: 'regulatory_intelligence', label: 'Regulatory Intelligence', shortLabel: 'Regulatory Intel', category: 'finance', icon: '⚖️', hook: 'Monitor regulatory changes and auto-flag compliance gaps', industries: ['financial_services', 'healthcare', 'energy', 'public_sector'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 3, avgCycleTimeReductionPct: 40, avgErrorReductionPct: 60, estimatorDefaults: { activeUsers: 100, queriesPerUserPerMonth: 20, ptuHoursPerMonth: 15, fabricMonthlySpend: 2000 } },
  { id: 'content_gen_ops', label: 'Content Generation & Operations', shortLabel: 'Content Gen', category: 'content', icon: '✍️', hook: 'Produce on-brand content 10x faster at scale', industries: ['retail', 'technology', 'professional_services', 'telecom'], segments: ['smb', 'smc', 'enterprise'], avgFTEEquivalent: 2, avgCycleTimeReductionPct: 70, avgErrorReductionPct: 20, estimatorDefaults: { activeUsers: 200, queriesPerUserPerMonth: 40, ptuHoursPerMonth: 15 } },
  { id: 'knowledge_mgmt', label: 'Knowledge Management & Preservation', shortLabel: 'Knowledge Mgmt', category: 'content', icon: '🧠', hook: 'Capture institutional knowledge before it walks out the door', industries: ['manufacturing', 'energy', 'professional_services', 'public_sector', 'technology'], segments: ['smb', 'smc', 'enterprise'], avgFTEEquivalent: 2, avgCycleTimeReductionPct: 45, avgErrorReductionPct: 30, estimatorDefaults: { activeUsers: 500, queriesPerUserPerMonth: 20, ptuHoursPerMonth: 10, fabricMonthlySpend: 1000 } },
  { id: 'market_research', label: 'Market Research & Analytics', shortLabel: 'Market Research', category: 'content', icon: '📊', hook: 'Turn weeks of research into hours of insight', industries: ['retail', 'financial_services', 'technology', 'professional_services'], segments: ['smb', 'smc', 'enterprise'], avgFTEEquivalent: 3, avgCycleTimeReductionPct: 60, avgErrorReductionPct: 25, estimatorDefaults: { activeUsers: 100, queriesPerUserPerMonth: 30, ptuHoursPerMonth: 20, fabricMonthlySpend: 2000 } },
  { id: 'frontline_productivity', label: 'Frontline Worker Productivity', shortLabel: 'Frontline Worker', category: 'industry', icon: '👷', hook: 'Give frontline workers expert-level AI guidance on the floor', industries: ['manufacturing', 'retail', 'healthcare', 'energy'], segments: ['smb', 'smc', 'enterprise'], avgFTEEquivalent: 2, avgCycleTimeReductionPct: 25, avgErrorReductionPct: 20, estimatorDefaults: { activeUsers: 1000, queriesPerUserPerMonth: 15, ptuHoursPerMonth: 10 } },
  { id: 'rd_product_design', label: 'R&D and Product Design', shortLabel: 'R&D Acceleration', category: 'industry', icon: '🔬', hook: 'Accelerate discovery and reduce design iteration cycles', industries: ['manufacturing', 'technology', 'healthcare', 'energy'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 4, avgCycleTimeReductionPct: 35, avgErrorReductionPct: 30, estimatorDefaults: { activeUsers: 200, queriesPerUserPerMonth: 25, ptuHoursPerMonth: 50, fabricMonthlySpend: 3000 } },
  { id: 'inventory_planning', label: 'Inventory Planning & Trend Forecast', shortLabel: 'Inventory Planning', category: 'industry', icon: '📦', hook: 'Reduce stockouts and overstock with AI-driven forecasting', industries: ['retail', 'manufacturing'], segments: ['smc', 'enterprise'], avgFTEEquivalent: 3, avgCycleTimeReductionPct: 30, avgErrorReductionPct: 40, estimatorDefaults: { activeUsers: 100, queriesPerUserPerMonth: 20, ptuHoursPerMonth: 30, fabricMonthlySpend: 4000 } },
  { id: 'agentic_capital', label: 'Agentic Capital Planning', shortLabel: 'Capital Planning', category: 'industry', icon: '🏗️', hook: 'Model capital scenarios and optimize portfolio allocation with AI', industries: ['financial_services', 'energy', 'public_sector'], segments: ['enterprise'], avgFTEEquivalent: 3, avgCycleTimeReductionPct: 40, avgErrorReductionPct: 35, estimatorDefaults: { activeUsers: 50, queriesPerUserPerMonth: 30, ptuHoursPerMonth: 40, fabricMonthlySpend: 5000 } },
];

export const CATEGORY_LABELS: Record<UseCaseCategory, string> = {
  operations: 'Operations & Process',
  customer: 'Customer & Patient Engagement',
  finance: 'Finance & Risk',
  content: 'Content & Knowledge',
  industry: 'Industry-Specific',
};
