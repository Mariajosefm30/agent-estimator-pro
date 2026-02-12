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
  maccBurnTarget: number;
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
}

export const DEFAULT_RESIDUAL_INPUTS: ResidualInputs = {
  activeUsers: 1000,
  queriesPerUserPerMonth: 20,
  ptuHoursPerMonth: 100,
  existingCopilotCredits: 0,
  existingPtuReservations: 0,
  hasMACC: false,
  maccBurnTarget: 0,
};

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

