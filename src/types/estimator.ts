// View Mode (seller only for now)
export type ViewMode = 'seller';

// Strategic Scenario (Phase 1)
export type StrategicScenario = 'hybrid_builder' | 'macc_optimizer' | 'scaler';

// Simplified Selectors (Phase 2)
export type UserScale = 'small' | 'medium' | 'enterprise';
export type AgentComplexity = 'basic_qa' | 'knowledge_rag' | 'advanced_tooling';
export type FoundryUsage = 'none' | 'experimental' | 'production';

// Customer Starting Point
export type CustomerStartingPoint = 'greenfield' | 'macc_only' | 'copilot_only' | 'copilot_macc';

// Workload Types
export type WorkloadType = 'qa' | 'summarization' | 'extraction' | 'multi_step_agent' | 'rag';
export type WorkloadIntensity = 'light' | 'medium' | 'heavy';
export type VolatilityScore = 'low' | 'medium' | 'high';

// Customer Context
export interface CustomerContext {
  startingPoint: CustomerStartingPoint;
  hasMACC: boolean;
  maccRemaining?: number;
  maccEndDate?: string;
  discountPercent?: number;
  hasCopilot: boolean;
  currentMonthlyBurn?: number;
}

// Usage Variability
export interface UsageVariability {
  workloadType: WorkloadType;
  workloadIntensity: WorkloadIntensity;
  avgTurnsPerTask: number;
  tasksPerUserPerWeek: number;
  activeUserPercent: number;
  toolCallingPercent: number;
  longContextPercent: number;
}

// Guardrails
export interface Guardrails {
  monthlyCapEnabled: boolean;
  monthlyCapAmount?: number;
  dailyCapEnabled: boolean;
  dailyCapAmount?: number;
  environmentSeparation: boolean;
  rbacEnabled: boolean;
  throttlingEnabled: boolean;
}

export interface EstimatorInputs {
  // View Mode
  viewMode: ViewMode;
  
  // Phase 1 - Strategic Intent
  strategicScenario?: StrategicScenario;
  
  // Phase 2 - Simplified Selectors
  userScale: UserScale;
  agentComplexity: AgentComplexity;
  foundryUsage: FoundryUsage;
  showAdvanced: boolean;
  
  // Customer Context
  customerContext: CustomerContext;
  
  // Usage Variability
  usageVariability: UsageVariability;
  
  // Guardrails
  guardrails: Guardrails;

  // Section A - Traffic
  monthlyUsers: number;
  queriesPerUserPerMonth: number;
  
  // Section B - Knowledge
  knowledgePct: number;
  tenantGraphPct: number;
  
  // Section C - Actions & Topics
  actionsPct: number;
  flowsConfigured: number;
  flowRunsPerMonth: number;
  
  // Section D - Autonomous Triggers
  triggersCount: number;
  triggerRunsPerMonth: number;
  
  // Section E - Prompt Tools
  usePromptTools: boolean;
  promptModelType: 'basic' | 'standard' | 'premium';
  promptResponsesPerMonth: number;
  
  // Section F - Foundry PTU
  ptuHoursPerMonth: number;
}

export interface EstimatorOutputs {
  // Intermediate calculations
  monthlyQueries: number;
  annualQueries: number;
  
  // Knowledge calculations
  annualKnowledgeQueries: number;
  annualTenantGraphQueries: number;
  annualNonTenantQueries: number;
  creditsKnowledge: number;
  
  // Actions calculations
  annualActionQueries: number;
  annualActions: number;
  creditsActions: number;
  creditsFlows: number;
  
  // Triggers calculations
  creditsTriggers: number;
  
  // Prompts calculations
  creditsPrompts: number;
  
  // Totals
  annualCopilotCredits: number;
  annualPtuHours: number;
  
  // Costs - now with ranges
  copilotPaygCost: number;
  foundryPaygCost: number;
  totalPaygCostUsd: number;
  
  // P50/P90 Range Outputs
  p50ACU: number;
  p90ACU: number;
  p50MonthlyCost: number;
  p90MonthlyCost: number;
  volatilityScore: VolatilityScore;
  
  // MACC Coverage Outputs
  maccFundedAmountP50: number;
  maccFundedAmountP90: number;
  netNewCashP50: number;
  netNewCashP90: number;
  monthsOfRunwayFromMACC: number | null;
  
  // Capped Outputs (when guardrails enabled)
  cappedP90MonthlyCost: number | null;
  worstCaseUncapped: number;
  
  // ACUs and tier recommendation
  acusRequired: number;
  recommendedTier: AgentP3Tier | null;
  estimatedPlanCost: number;
  estimatedSavings: number;
  estimatedDiscountPct: number;
}

export interface AgentP3Tier {
  tier: number;
  acus: number;
  estimated_cost: number;
  discount_pct: number;
}

export interface Assumptions {
  id: string;
  copilot_credit_usd: number;
  ptu_usd_per_hour: number;
  tenant_graph_grounding_credits: number;
  generative_answer_credits: number;
  non_tenant_grounding_credits: number;
  prompt_basic_per_10: number;
  prompt_standard_per_10: number;
  prompt_premium_per_10: number;
  avg_actions_per_query: number;
  credits_per_action: number;
  credits_per_flow_run: number;
  credits_per_trigger_run: number;
  agent_p3_tiers: AgentP3Tier[];
  use_api_pricing: boolean;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  name: string;
  inputs: EstimatorInputs;
  outputs: EstimatorOutputs;
  created_at: string;
  updated_at: string;
}

// Residual Workload Inputs (new simplified flow)
export interface ResidualInputs {
  activeUsers: number;
  queriesPerUserPerMonth: number;
  ptuHoursPerMonth: number;
  existingCopilotCredits: number;
  existingPtuReservations: number;
  hasMACC: boolean;
  maccBurnPct: number;
  // Other AI Services (context only, not P3 decrement)
  fabricCapacityUnits: number;
  githubCopilotLicenses: number;
}

export interface ResidualOutputs {
  // Consumption
  totalCopilotQueries: number;
  estimatedCopilotRetailCost: number;
  estimatedFoundryRetailCost: number;
  totalEstimatedRetailCost: number;
  // Existing coverage
  foundryCoveredByReservation: number;
  remainingFoundryRetailCost: number;
  copilotCoveredByCredits: number;
  remainingCopilotRetailCost: number;
  totalCoveredByExisting: number;
  // Residual
  totalResidualRetailCost: number;
  requiredP3ACUs: number;
  // P3 recommendation
  recommendedTier: AgentP3Tier | null;
  p3Cost: number;
  p3Savings: number;
  p3DiscountPct: number;
  // MACC
  maccBurnAmount: number;
}

export const DEFAULT_RESIDUAL_INPUTS: ResidualInputs = {
  activeUsers: 1000,
  queriesPerUserPerMonth: 20,
  ptuHoursPerMonth: 100,
  existingCopilotCredits: 0,
  existingPtuReservations: 0,
  hasMACC: false,
  maccBurnPct: 100,
  fabricCapacityUnits: 0,
  githubCopilotLicenses: 0,
};

// Pre-set industry scenarios
export interface PresetScenario {
  id: string;
  name: string;
  industry: string;
  icon: string;
  description: string;
  inputs: ResidualInputs;
  guidance: string;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'healthcare',
    name: 'AI-Powered Patient Engagement',
    industry: 'Healthcare',
    icon: '🏥',
    description: 'A healthcare provider using Copilot Studio for patient chatbots and Azure AI Foundry for custom care recommendation models, with Fabric for data integration.',
    inputs: {
      activeUsers: 5000,
      queriesPerUserPerMonth: 10,
      ptuHoursPerMonth: 20,
      existingCopilotCredits: 0,
      existingPtuReservations: 0,
      hasMACC: true,
      maccBurnPct: 100,
      fabricCapacityUnits: 100,
      githubCopilotLicenses: 50,
    },
    guidance: 'Strategic Insight for Healthcare: P3 is an excellent fit. It provides a unified budget for patient-facing Copilot agents and backend Foundry models, simplifying cost management and contributing to MACC. The flexibility of ACUs ensures AI initiatives can evolve without separate procurements for each core AI service.',
  },
  {
    id: 'financial',
    name: 'Intelligent Financial Advisory',
    industry: 'Financial Services',
    icon: '🏦',
    description: 'A financial services firm deploying AI-powered advisory agents for wealth management clients, with Foundry-based risk analysis models.',
    inputs: {
      activeUsers: 2000,
      queriesPerUserPerMonth: 30,
      ptuHoursPerMonth: 50,
      existingCopilotCredits: 5000,
      existingPtuReservations: 10,
      hasMACC: true,
      maccBurnPct: 80,
      fabricCapacityUnits: 200,
      githubCopilotLicenses: 100,
    },
    guidance: 'Strategic Insight for Financial Services: With existing copilot credits partially covering agent usage, P3 efficiently handles the residual Foundry workload. The MACC contribution provides predictable spend, which is critical for regulated industries requiring auditable cost management.',
  },
  {
    id: 'retail',
    name: 'Omnichannel Customer Service',
    industry: 'Retail & E-Commerce',
    icon: '🛒',
    description: 'A retailer deploying AI agents across web, mobile, and in-store kiosks for product recommendations, order tracking, and customer support.',
    inputs: {
      activeUsers: 10000,
      queriesPerUserPerMonth: 15,
      ptuHoursPerMonth: 30,
      existingCopilotCredits: 0,
      existingPtuReservations: 0,
      hasMACC: false,
      maccBurnPct: 100,
      fabricCapacityUnits: 50,
      githubCopilotLicenses: 25,
    },
    guidance: 'Strategic Insight for Retail: High user volume makes P3\'s volume discount highly attractive. The unified ACU pool flexes across seasonal demand spikes without over-provisioning. Even without a MACC, P3 delivers significant savings over PAYG at this scale.',
  },
  {
    id: 'manufacturing',
    name: 'Predictive Maintenance & Operations',
    industry: 'Manufacturing',
    icon: '🏭',
    description: 'A manufacturer using Foundry for predictive maintenance models and Copilot agents for technician assistance and supply chain queries.',
    inputs: {
      activeUsers: 500,
      queriesPerUserPerMonth: 40,
      ptuHoursPerMonth: 80,
      existingCopilotCredits: 2000,
      existingPtuReservations: 20,
      hasMACC: true,
      maccBurnPct: 100,
      fabricCapacityUnits: 300,
      githubCopilotLicenses: 30,
    },
    guidance: 'Strategic Insight for Manufacturing: Foundry-heavy workloads benefit greatly from P3\'s unified coverage. Existing PTU reservations are applied first, and P3 efficiently covers the remaining Copilot and Foundry residual. This optimizes total AI spend while drawing down the MACC commitment.',
  },
];

// Default values
export const DEFAULT_CUSTOMER_CONTEXT: CustomerContext = {
  startingPoint: 'greenfield',
  hasMACC: false,
  hasCopilot: false,
};

export const DEFAULT_USAGE_VARIABILITY: UsageVariability = {
  workloadType: 'qa',
  workloadIntensity: 'medium',
  avgTurnsPerTask: 3,
  tasksPerUserPerWeek: 10,
  activeUserPercent: 60,
  toolCallingPercent: 20,
  longContextPercent: 15,
};

export const DEFAULT_GUARDRAILS: Guardrails = {
  monthlyCapEnabled: false,
  dailyCapEnabled: false,
  environmentSeparation: false,
  rbacEnabled: false,
  throttlingEnabled: false,
};

export const DEFAULT_INPUTS: EstimatorInputs = {
  viewMode: 'seller',
  strategicScenario: undefined,
  userScale: 'medium',
  agentComplexity: 'knowledge_rag',
  foundryUsage: 'none',
  showAdvanced: false,
  customerContext: DEFAULT_CUSTOMER_CONTEXT,
  usageVariability: DEFAULT_USAGE_VARIABILITY,
  guardrails: DEFAULT_GUARDRAILS,
  monthlyUsers: 1000,
  queriesPerUserPerMonth: 20,
  knowledgePct: 50,
  tenantGraphPct: 30,
  actionsPct: 40,
  flowsConfigured: 5,
  flowRunsPerMonth: 500,
  triggersCount: 3,
  triggerRunsPerMonth: 100,
  usePromptTools: false,
  promptModelType: 'standard',
  promptResponsesPerMonth: 0,
  ptuHoursPerMonth: 100,
};

