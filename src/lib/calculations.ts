import { EstimatorInputs, EstimatorOutputs, Assumptions, AgentP3Tier } from '@/types/estimator';

export function calculateOutputs(inputs: EstimatorInputs, assumptions: Assumptions): EstimatorOutputs {
  // Section A - Traffic calculations
  const monthlyQueries = inputs.monthlyUsers * inputs.queriesPerUserPerMonth;
  const annualQueries = monthlyQueries * 12;

  // Section B - Knowledge calculations
  const knowledgePctDecimal = inputs.knowledgePct / 100;
  const tenantGraphPctDecimal = inputs.tenantGraphPct / 100;
  
  const annualKnowledgeQueries = annualQueries * knowledgePctDecimal;
  const annualTenantGraphQueries = annualKnowledgeQueries * tenantGraphPctDecimal;
  const annualNonTenantQueries = annualKnowledgeQueries - annualTenantGraphQueries;
  
  // Tenant graph query credits = 10 + 2 (tenant grounding + generative answers)
  const tenantGraphCreditsPerQuery = 
    assumptions.tenant_graph_grounding_credits + assumptions.generative_answer_credits;
  
  const creditsKnowledge = 
    (annualTenantGraphQueries * tenantGraphCreditsPerQuery) + 
    (annualNonTenantQueries * assumptions.non_tenant_grounding_credits);

  // Section C - Actions & Topics calculations
  const actionsPctDecimal = inputs.actionsPct / 100;
  const annualActionQueries = annualQueries * actionsPctDecimal;
  const annualActions = annualActionQueries * assumptions.avg_actions_per_query;
  const creditsActions = annualActions * assumptions.credits_per_action;
  const creditsFlows = inputs.flowRunsPerMonth * 12 * assumptions.credits_per_flow_run;

  // Section D - Autonomous Triggers calculations
  const creditsTriggers = inputs.triggerRunsPerMonth * 12 * assumptions.credits_per_trigger_run;

  // Section E - Prompt Tools calculations
  let creditsPrompts = 0;
  if (inputs.usePromptTools && inputs.promptResponsesPerMonth > 0) {
    const annualPromptResponses = inputs.promptResponsesPerMonth * 12;
    let promptCostPer10 = assumptions.prompt_standard_per_10;
    
    switch (inputs.promptModelType) {
      case 'basic':
        promptCostPer10 = assumptions.prompt_basic_per_10;
        break;
      case 'standard':
        promptCostPer10 = assumptions.prompt_standard_per_10;
        break;
      case 'premium':
        promptCostPer10 = assumptions.prompt_premium_per_10;
        break;
    }
    
    creditsPrompts = annualPromptResponses * (promptCostPer10 / 10);
  }

  // Total Copilot Credits
  const annualCopilotCredits = creditsKnowledge + creditsActions + creditsFlows + creditsTriggers + creditsPrompts;

  // Section F - Foundry PTU
  const annualPtuHours = inputs.ptuHoursPerMonth * 12;

  // Cost calculations
  const copilotPaygCost = annualCopilotCredits * assumptions.copilot_credit_usd;
  const foundryPaygCost = annualPtuHours * assumptions.ptu_usd_per_hour;
  const totalPaygCostUsd = copilotPaygCost + foundryPaygCost;

  // ACUs required (rounded up)
  const acusRequired = Math.ceil(totalPaygCostUsd);

  // Find recommended tier
  const tiers = assumptions.agent_p3_tiers.sort((a, b) => a.acus - b.acus);
  let recommendedTier: AgentP3Tier | null = null;
  
  for (const tier of tiers) {
    if (tier.acus >= acusRequired) {
      recommendedTier = tier;
      break;
    }
  }
  
  // If no tier is large enough, recommend the largest one
  if (!recommendedTier && tiers.length > 0) {
    recommendedTier = tiers[tiers.length - 1];
  }

  // Calculate savings
  const estimatedPlanCost = recommendedTier?.estimated_cost ?? totalPaygCostUsd;
  const estimatedSavings = totalPaygCostUsd - estimatedPlanCost;
  const estimatedDiscountPct = totalPaygCostUsd > 0 
    ? (estimatedSavings / totalPaygCostUsd) * 100 
    : 0;

  return {
    monthlyQueries,
    annualQueries,
    annualKnowledgeQueries,
    annualTenantGraphQueries,
    annualNonTenantQueries,
    creditsKnowledge,
    annualActionQueries,
    annualActions,
    creditsActions,
    creditsFlows,
    creditsTriggers,
    creditsPrompts,
    annualCopilotCredits,
    annualPtuHours,
    copilotPaygCost,
    foundryPaygCost,
    totalPaygCostUsd,
    acusRequired,
    recommendedTier,
    estimatedPlanCost,
    estimatedSavings,
    estimatedDiscountPct,
  };
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
