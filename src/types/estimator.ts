export interface EstimatorInputs {
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
  
  // Costs
  copilotPaygCost: number;
  foundryPaygCost: number;
  totalPaygCostUsd: number;
  
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

export const DEFAULT_INPUTS: EstimatorInputs = {
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
