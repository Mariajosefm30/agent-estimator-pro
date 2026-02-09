export interface SurveyAnswers {
  org_size: string;
  industry: string;
  role_type: string;
  decision_rights: string;
  ai_goal: string;
  eval_method: string[];
  threshold_type: string;
  ai_maturity: string;
  use_case: string;
  volume: string;
  complexity: string;
  analysis_type: string;
  horizon: string;
  discount_rate: string;
}

export const DEFAULT_SURVEY_ANSWERS: SurveyAnswers = {
  org_size: '',
  industry: '',
  role_type: '',
  decision_rights: '',
  ai_goal: '',
  eval_method: [],
  threshold_type: '',
  ai_maturity: '',
  use_case: '',
  volume: '',
  complexity: '',
  analysis_type: '',
  horizon: '',
  discount_rate: '',
};

export interface SurveyQuestion {
  id: keyof SurveyAnswers;
  section: string;
  sectionNumber: number;
  label: string;
  subtitle?: string;
  options: { value: string; label: string }[];
  multiSelect?: boolean;
  condition?: (answers: SurveyAnswers) => boolean;
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // SECTION 1 — Organization Profile
  {
    id: 'org_size',
    section: 'Organization Profile',
    sectionNumber: 1,
    label: 'What is the size of your organization (global headcount)?',
    options: [
      { value: '500-749', label: '500–749' },
      { value: '750-999', label: '750–999' },
      { value: '1000-2499', label: '1,000–2,499' },
      { value: '2500-4999', label: '2,500–4,999' },
      { value: '5000-9999', label: '5,000–9,999' },
      { value: '10000-19999', label: '10,000–19,999' },
      { value: '20000-49999', label: '20,000–49,999' },
      { value: '50000+', label: '50,000+' },
    ],
  },
  {
    id: 'industry',
    section: 'Organization Profile',
    sectionNumber: 1,
    label: 'Which industry best represents your organization?',
    options: [
      { value: 'financial_services', label: 'Financial Services' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'retail_cpg', label: 'Retail & CPG' },
      { value: 'automotive', label: 'Automotive / Transportation' },
      { value: 'energy', label: 'Energy & Utilities' },
      { value: 'telecom', label: 'Telecommunications' },
      { value: 'education', label: 'Education' },
      { value: 'technology', label: 'Technology' },
      { value: 'media', label: 'Media & Entertainment' },
      { value: 'other', label: 'Other' },
    ],
  },
  // SECTION 2 — Role & Decision Influence
  {
    id: 'role_type',
    section: 'Role & Decision Influence',
    sectionNumber: 2,
    label: 'Which best describes your role?',
    options: [
      { value: 'it_infra', label: 'IT / Infrastructure' },
      { value: 'data_ai', label: 'Data / AI' },
      { value: 'cybersecurity', label: 'Cybersecurity' },
      { value: 'finance_procurement', label: 'Finance / Procurement' },
      { value: 'operations_lob', label: 'Operations / Line of Business' },
      { value: 'executive', label: 'Executive leadership' },
    ],
  },
  {
    id: 'decision_rights',
    section: 'Role & Decision Influence',
    sectionNumber: 2,
    label: 'What is your level of influence on AI investment decisions?',
    options: [
      { value: 'final_enterprise', label: 'Final decision maker enterprise‑wide' },
      { value: 'final_bu', label: 'Final decision maker for my business unit' },
      { value: 'accountable', label: 'Accountable, but not final decision maker' },
      { value: 'consulted', label: 'Consulted (advisory role)' },
      { value: 'informed', label: 'Informed only' },
    ],
  },
  // SECTION 3 — AI Maturity & Planning
  {
    id: 'ai_goal',
    section: 'AI Maturity & Planning',
    sectionNumber: 3,
    label: 'What is your main objective with AI right now?',
    options: [
      { value: 'reduce_costs', label: 'Reduce operational costs' },
      { value: 'improve_productivity', label: 'Improve productivity' },
      { value: 'increase_revenue', label: 'Increase revenue' },
      { value: 'automate_tasks', label: 'Automate manual tasks' },
      { value: 'risk_compliance', label: 'Manage risk & compliance' },
      { value: 'innovation', label: 'Increase innovation' },
      { value: 'not_sure', label: 'Not sure' },
    ],
  },
  {
    id: 'eval_method',
    section: 'AI Maturity & Planning',
    sectionNumber: 3,
    label: 'How do you typically evaluate new AI initiatives?',
    subtitle: 'Select all that apply',
    multiSelect: true,
    options: [
      { value: 'traditional_roi', label: 'Traditional ROI' },
      { value: 'payback_period', label: 'Payback period' },
      { value: 'tco', label: 'Total cost of ownership (TCO)' },
      { value: 'cba', label: 'Cost‑benefit analysis' },
      { value: 'value_complexity', label: 'Value vs. complexity' },
      { value: 'none', label: 'No formal method' },
    ],
  },
  {
    id: 'threshold_type',
    section: 'AI Maturity & Planning',
    sectionNumber: 3,
    label: 'Does your organization require AI initiatives to meet a specific financial threshold before approval?',
    options: [
      { value: 'formal', label: 'Yes, formal ROI or cost target' },
      { value: 'informal', label: 'Yes, but informal' },
      { value: 'case_by_case', label: 'No threshold, case‑by‑case' },
      { value: 'none', label: 'No defined approval criteria' },
    ],
  },
  {
    id: 'ai_maturity',
    section: 'AI Maturity & Planning',
    sectionNumber: 3,
    label: 'How mature is your organization in using AI systems operationally?',
    options: [
      { value: 'early', label: 'Early stage (pilots only)' },
      { value: 'scaling', label: 'Scaling (multiple use cases in production)' },
      { value: 'mature', label: 'Mature (AI integrated deeply in workflows)' },
    ],
  },
  // SECTION 4 — Use Case Scoping
  {
    id: 'use_case',
    section: 'Use Case Scoping',
    sectionNumber: 4,
    label: 'Which area are you considering automating with agents?',
    options: [
      { value: 'it_ops', label: 'IT Operations (incident resolution, triage)' },
      { value: 'customer_support', label: 'Customer support' },
      { value: 'employee_support', label: 'Employee support / internal helpdesk' },
      { value: 'security_compliance', label: 'Security / compliance workflows' },
      { value: 'finance_proc', label: 'Finance / procurement processes' },
      { value: 'custom_workflows', label: 'Custom multi-step workflows' },
    ],
  },
  {
    id: 'volume',
    section: 'Use Case Scoping',
    sectionNumber: 4,
    label: 'Approximately how many tasks/tickets/interactions per month does this workflow handle?',
    options: [
      { value: '0-1000', label: '0–1,000' },
      { value: '1000-10000', label: '1,000–10,000' },
      { value: '10000-50000', label: '10,000–50,000' },
      { value: '50000-200000', label: '50,000–200,000' },
      { value: '200000+', label: '200,000+' },
    ],
  },
  {
    id: 'complexity',
    section: 'Use Case Scoping',
    sectionNumber: 4,
    label: 'How complex are the tasks the agent will perform?',
    options: [
      { value: 'low', label: 'Low (information lookup, routing)' },
      { value: 'medium', label: 'Medium (multi‑step problem solving)' },
      { value: 'high', label: 'High (orchestration, tool use, integrations)' },
    ],
  },
  // SECTION 5 — Calculation Preferences
  {
    id: 'analysis_type',
    section: 'Calculation Preferences',
    sectionNumber: 5,
    label: 'What type of analysis would you like to see?',
    options: [
      { value: 'cost_estimate', label: 'Cost estimate only' },
      { value: 'cost_savings', label: 'Cost savings' },
      { value: 'breakeven', label: 'Break‑even point' },
      { value: 'payback', label: 'Payback period' },
      { value: 'roi', label: 'ROI' },
      { value: 'npv', label: 'NPV (discounted cash flow)' },
    ],
  },
  {
    id: 'horizon',
    section: 'Calculation Preferences',
    sectionNumber: 5,
    label: 'Preferred time horizon for ROI modeling?',
    options: [
      { value: '1', label: '1 year' },
      { value: '3', label: '3 years' },
      { value: '5', label: '5 years' },
    ],
  },
  {
    id: 'discount_rate',
    section: 'Calculation Preferences',
    sectionNumber: 5,
    label: 'Discount rate for NPV calculation?',
    condition: (answers) => answers.analysis_type === 'npv',
    options: [
      { value: 'default', label: 'Use default industry value (8–10%)' },
      { value: 'custom', label: 'Custom (enter a number)' },
    ],
  },
];
