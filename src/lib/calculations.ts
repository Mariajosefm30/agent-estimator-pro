import { 
  EstimatorInputs, 
  EstimatorOutputs, 
  Assumptions, 
  AgentP3Tier,
  VolatilityScore,
  ResidualInputs,
  ResidualOutputs,
} from '@/types/estimator';

// Multipliers for P50/P90 based on workload intensity and type
function getVariabilityMultipliers(inputs: EstimatorInputs): { p50: number; p90: number } {
  const { workloadIntensity, workloadType, toolCallingPercent, longContextPercent } = inputs.usageVariability;
  
  // Base multipliers by intensity
  let p50Base = 1.0;
  let p90Base = 1.0;
  
  switch (workloadIntensity) {
    case 'light':
      p50Base = 0.85;
      p90Base = 1.15;
      break;
    case 'medium':
      p50Base = 1.0;
      p90Base = 1.4;
      break;
    case 'heavy':
      p50Base = 1.15;
      p90Base = 1.8;
      break;
  }
  
  // Adjustments by workload type
  switch (workloadType) {
    case 'qa':
      // Simple Q&A is predictable
      break;
    case 'summarization':
      p90Base *= 1.1;
      break;
    case 'extraction':
      p90Base *= 1.15;
      break;
    case 'multi_step_agent':
      p50Base *= 1.2;
      p90Base *= 1.5;
      break;
    case 'rag':
      p90Base *= 1.25;
      break;
  }
  
  // Tool calling adds variability
  const toolCallMultiplier = 1 + (toolCallingPercent / 100) * 0.3;
  p90Base *= toolCallMultiplier;
  
  // Long context adds variability
  const longContextMultiplier = 1 + (longContextPercent / 100) * 0.2;
  p90Base *= longContextMultiplier;
  
  return { p50: p50Base, p90: p90Base };
}

function calculateVolatilityScore(inputs: EstimatorInputs): VolatilityScore {
  const { workloadIntensity, workloadType, toolCallingPercent, longContextPercent } = inputs.usageVariability;
  
  let score = 0;
  
  // Intensity contribution
  switch (workloadIntensity) {
    case 'light': score += 1; break;
    case 'medium': score += 2; break;
    case 'heavy': score += 3; break;
  }
  
  // Workload type contribution
  switch (workloadType) {
    case 'qa': score += 0; break;
    case 'summarization': score += 1; break;
    case 'extraction': score += 1; break;
    case 'multi_step_agent': score += 3; break;
    case 'rag': score += 2; break;
  }
  
  // Tool calling and context contribution
  if (toolCallingPercent > 40) score += 2;
  else if (toolCallingPercent > 20) score += 1;
  
  if (longContextPercent > 30) score += 1;
  
  // Guardrails reduce effective volatility concern
  if (inputs.guardrails.monthlyCapEnabled) score -= 1;
  if (inputs.guardrails.throttlingEnabled) score -= 1;
  
  if (score <= 3) return 'low';
  if (score <= 6) return 'medium';
  return 'high';
}

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

  // Base cost calculations
  const copilotPaygCost = annualCopilotCredits * assumptions.copilot_credit_usd;
  const foundryPaygCost = annualPtuHours * assumptions.ptu_usd_per_hour;
  const totalPaygCostUsd = copilotPaygCost + foundryPaygCost;

  // Get variability multipliers
  const { p50, p90 } = getVariabilityMultipliers(inputs);
  
  // Calculate P50/P90 ranges (monthly costs)
  const baseMonthly = totalPaygCostUsd / 12;
  const p50MonthlyCost = baseMonthly * p50;
  const p90MonthlyCost = baseMonthly * p90;
  
  // ACUs (annual) with ranges
  const acusRequired = Math.ceil(totalPaygCostUsd);
  const p50ACU = Math.ceil(totalPaygCostUsd * p50);
  const p90ACU = Math.ceil(totalPaygCostUsd * p90);
  
  // Volatility score
  const volatilityScore = calculateVolatilityScore(inputs);
  
  // MACC Coverage calculations
  let maccFundedAmountP50 = 0;
  let maccFundedAmountP90 = 0;
  let netNewCashP50 = p50MonthlyCost * 12;
  let netNewCashP90 = p90MonthlyCost * 12;
  let monthsOfRunwayFromMACC: number | null = null;
  
  if (inputs.customerContext.hasMACC && inputs.customerContext.maccRemaining) {
    const maccRemaining = inputs.customerContext.maccRemaining;
    const annualP50 = p50MonthlyCost * 12;
    const annualP90 = p90MonthlyCost * 12;
    
    // MACC can fund up to the remaining amount
    maccFundedAmountP50 = Math.min(maccRemaining, annualP50);
    maccFundedAmountP90 = Math.min(maccRemaining, annualP90);
    
    // Net new cash = what's left after MACC
    netNewCashP50 = Math.max(0, annualP50 - maccRemaining);
    netNewCashP90 = Math.max(0, annualP90 - maccRemaining);
    
    // Calculate runway
    if (inputs.customerContext.currentMonthlyBurn && inputs.customerContext.currentMonthlyBurn > 0) {
      const totalMonthlyBurn = inputs.customerContext.currentMonthlyBurn + p50MonthlyCost;
      monthsOfRunwayFromMACC = Math.floor(maccRemaining / totalMonthlyBurn);
    } else {
      monthsOfRunwayFromMACC = Math.floor(maccRemaining / p50MonthlyCost);
    }
  }
  
  // Guardrail capping
  let cappedP90MonthlyCost: number | null = null;
  const worstCaseUncapped = p90MonthlyCost;
  
  if (inputs.guardrails.monthlyCapEnabled && inputs.guardrails.monthlyCapAmount) {
    cappedP90MonthlyCost = Math.min(p90MonthlyCost, inputs.guardrails.monthlyCapAmount);
  }

  // Find recommended tier
  const tiers = [...assumptions.agent_p3_tiers].sort((a, b) => a.acus - b.acus);
  let recommendedTier: AgentP3Tier | null = null;
  
  for (const tier of tiers) {
    if (tier.acus >= acusRequired) {
      recommendedTier = tier;
      break;
    }
  }
  
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
    p50ACU,
    p90ACU,
    p50MonthlyCost,
    p90MonthlyCost,
    volatilityScore,
    maccFundedAmountP50,
    maccFundedAmountP90,
    netNewCashP50,
    netNewCashP90,
    monthsOfRunwayFromMACC,
    cappedP90MonthlyCost,
    worstCaseUncapped,
    acusRequired,
    recommendedTier,
    estimatedPlanCost,
    estimatedSavings,
    estimatedDiscountPct,
  };
}

export function calculateResidualOutputs(inputs: ResidualInputs, assumptions: Assumptions): ResidualOutputs {
  // Step 1: Total estimated retail consumption (annual)
  const totalCopilotQueries = inputs.activeUsers * inputs.queriesPerUserPerMonth * 12;
  const estimatedCopilotRetailCost = totalCopilotQueries * assumptions.copilot_credit_usd;
  const estimatedFoundryRetailCost = inputs.ptuHoursPerMonth * 12 * assumptions.ptu_usd_per_hour;
  const totalEstimatedRetailCost = estimatedCopilotRetailCost + estimatedFoundryRetailCost;

  // Step 2: Apply Foundry PTU Reservations (Precedence 1)
  const existingPtuCoverage = inputs.existingPtuReservations * 12 * assumptions.ptu_usd_per_hour;
  const foundryCoveredByReservation = Math.min(estimatedFoundryRetailCost, existingPtuCoverage);
  const remainingFoundryRetailCost = estimatedFoundryRetailCost - foundryCoveredByReservation;

  // Step 3: Apply Copilot Credit Pre-Purchase (Precedence 2) — 1 CCCU = $1 retail
  const copilotCoveredByCredits = Math.min(estimatedCopilotRetailCost, inputs.existingCopilotCredits);
  const remainingCopilotRetailCost = estimatedCopilotRetailCost - copilotCoveredByCredits;

  const totalCoveredByExisting = foundryCoveredByReservation + copilotCoveredByCredits;

  // Step 4: Residual for P3
  const totalResidualRetailCost = remainingFoundryRetailCost + remainingCopilotRetailCost;
  const requiredP3ACUs = Math.ceil(totalResidualRetailCost);

  // Step 5: Find optimal P3 tier
  const tiers = [...assumptions.agent_p3_tiers].sort((a, b) => a.acus - b.acus);
  let recommendedTier: AgentP3Tier | null = null;

  if (requiredP3ACUs > 0) {
    for (const tier of tiers) {
      if (tier.acus >= requiredP3ACUs) {
        recommendedTier = tier;
        break;
      }
    }
    if (!recommendedTier && tiers.length > 0) {
      recommendedTier = tiers[tiers.length - 1];
    }
  }

  const p3Cost = recommendedTier
    ? recommendedTier.estimated_cost
    : totalResidualRetailCost;
  const p3Savings = totalResidualRetailCost - p3Cost;
  const p3DiscountPct = totalResidualRetailCost > 0
    ? (p3Savings / totalResidualRetailCost) * 100
    : 0;

  // MACC burn calculation
  const maccBurnAmount = inputs.hasMACC
    ? p3Cost * (inputs.maccBurnPct / 100)
    : 0;

  return {
    totalCopilotQueries,
    estimatedCopilotRetailCost,
    estimatedFoundryRetailCost,
    totalEstimatedRetailCost,
    foundryCoveredByReservation,
    remainingFoundryRetailCost,
    copilotCoveredByCredits,
    remainingCopilotRetailCost,
    totalCoveredByExisting,
    totalResidualRetailCost,
    requiredP3ACUs,
    recommendedTier,
    p3Cost,
    p3Savings,
    p3DiscountPct,
    maccBurnAmount,
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
