import { SurveyAnswers } from '@/types/survey';
import { EstimatorInputs, DEFAULT_INPUTS } from '@/types/estimator';

/**
 * Maps survey answers to estimator input defaults.
 * This pre-configures the estimator based on the user's profile and use case.
 */
export function mapSurveyToInputs(answers: SurveyAnswers): EstimatorInputs {
  const inputs = { ...DEFAULT_INPUTS };

  // Map org size → monthly users estimate
  const orgSizeMap: Record<string, number> = {
    '500-749': 200,
    '750-999': 350,
    '1000-2499': 600,
    '2500-4999': 1200,
    '5000-9999': 2500,
    '10000-19999': 5000,
    '20000-49999': 10000,
    '50000+': 20000,
  };
  inputs.monthlyUsers = orgSizeMap[answers.org_size] ?? DEFAULT_INPUTS.monthlyUsers;

  // Map volume → queries per user per month
  const volumeMap: Record<string, number> = {
    '0-1000': 5,
    '1000-10000': 15,
    '10000-50000': 30,
    '50000-200000': 50,
    '200000+': 80,
  };
  inputs.queriesPerUserPerMonth = volumeMap[answers.volume] ?? DEFAULT_INPUTS.queriesPerUserPerMonth;

  // Map complexity → workload intensity & type
  if (answers.complexity === 'low') {
    inputs.usageVariability = {
      ...inputs.usageVariability,
      workloadType: 'qa',
      workloadIntensity: 'light',
      avgTurnsPerTask: 2,
      toolCallingPercent: 5,
      longContextPercent: 5,
    };
  } else if (answers.complexity === 'high') {
    inputs.usageVariability = {
      ...inputs.usageVariability,
      workloadType: 'multi_step_agent',
      workloadIntensity: 'heavy',
      avgTurnsPerTask: 6,
      toolCallingPercent: 50,
      longContextPercent: 35,
    };
  } else {
    inputs.usageVariability = {
      ...inputs.usageVariability,
      workloadType: 'summarization',
      workloadIntensity: 'medium',
      avgTurnsPerTask: 3,
      toolCallingPercent: 20,
      longContextPercent: 15,
    };
  }

  // Map use case → knowledge/actions split
  const useCaseConfig: Record<string, { knowledgePct: number; actionsPct: number; flowsConfigured: number }> = {
    it_ops: { knowledgePct: 40, actionsPct: 60, flowsConfigured: 8 },
    customer_support: { knowledgePct: 70, actionsPct: 30, flowsConfigured: 5 },
    employee_support: { knowledgePct: 60, actionsPct: 40, flowsConfigured: 4 },
    security_compliance: { knowledgePct: 50, actionsPct: 50, flowsConfigured: 6 },
    finance_proc: { knowledgePct: 45, actionsPct: 55, flowsConfigured: 7 },
    custom_workflows: { knowledgePct: 30, actionsPct: 70, flowsConfigured: 10 },
  };
  const ucConfig = useCaseConfig[answers.use_case];
  if (ucConfig) {
    inputs.knowledgePct = ucConfig.knowledgePct;
    inputs.actionsPct = ucConfig.actionsPct;
    inputs.flowsConfigured = ucConfig.flowsConfigured;
  }

  // Map AI maturity → active user percent & guardrails
  if (answers.ai_maturity === 'early') {
    inputs.usageVariability.activeUserPercent = 30;
    inputs.guardrails = {
      ...inputs.guardrails,
      monthlyCapEnabled: true,
      monthlyCapAmount: 5000,
      rbacEnabled: true,
    };
  } else if (answers.ai_maturity === 'mature') {
    inputs.usageVariability.activeUserPercent = 75;
  }

  // Regulated industries → more guardrails
  if (answers.industry === 'financial_services' || answers.industry === 'healthcare') {
    inputs.guardrails = {
      ...inputs.guardrails,
      rbacEnabled: true,
      environmentSeparation: true,
      throttlingEnabled: true,
    };
  }

  // Always seller mode
  inputs.viewMode = 'seller';

  // Map use case to trigger/flow estimates
  const triggerMap: Record<string, { triggersCount: number; triggerRunsPerMonth: number }> = {
    it_ops: { triggersCount: 5, triggerRunsPerMonth: 500 },
    customer_support: { triggersCount: 3, triggerRunsPerMonth: 200 },
    employee_support: { triggersCount: 2, triggerRunsPerMonth: 100 },
    security_compliance: { triggersCount: 4, triggerRunsPerMonth: 300 },
    finance_proc: { triggersCount: 3, triggerRunsPerMonth: 250 },
    custom_workflows: { triggersCount: 6, triggerRunsPerMonth: 400 },
  };
  const triggerConfig = triggerMap[answers.use_case];
  if (triggerConfig) {
    inputs.triggersCount = triggerConfig.triggersCount;
    inputs.triggerRunsPerMonth = triggerConfig.triggerRunsPerMonth;
  }

  // Map volume to flow runs
  const flowRunMap: Record<string, number> = {
    '0-1000': 100,
    '1000-10000': 500,
    '10000-50000': 2000,
    '50000-200000': 5000,
    '200000+': 10000,
  };
  inputs.flowRunsPerMonth = flowRunMap[answers.volume] ?? DEFAULT_INPUTS.flowRunsPerMonth;

  // Map complexity to prompt tools
  if (answers.complexity === 'high') {
    inputs.usePromptTools = true;
    inputs.promptModelType = 'premium';
    inputs.promptResponsesPerMonth = Math.round(inputs.monthlyUsers * inputs.queriesPerUserPerMonth * 0.1);
  } else if (answers.complexity === 'medium') {
    inputs.usePromptTools = true;
    inputs.promptModelType = 'standard';
    inputs.promptResponsesPerMonth = Math.round(inputs.monthlyUsers * inputs.queriesPerUserPerMonth * 0.05);
  }

  return inputs;
}
