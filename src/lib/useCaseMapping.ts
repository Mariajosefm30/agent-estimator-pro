import { Industry, Segment, USE_CASES, UseCase, DiscoveryState, SEGMENT_CONFIG } from '@/types/useCase';
import { ResidualInputs } from '@/types/estimator';

export function getFilteredUseCases(industry: Industry | null, segment: Segment | null): UseCase[] {
  return USE_CASES.filter((uc) => {
    if (industry && !uc.industries.includes(industry)) return false;
    if (segment && !uc.segments.includes(segment)) return false;
    return true;
  });
}

export interface ValueCard {
  useCase: UseCase;
  estimatedFTESaved: number;
  estimatedHoursSavedPerMonth: number;
  cycleTimeLabel: string;
  errorReductionLabel: string;
  estimatedLaborValueRecaptured: number;
}

export function calculateValueCards(discovery: DiscoveryState): ValueCard[] {
  const selected = USE_CASES.filter((uc) => discovery.selectedUseCaseIds.includes(uc.id));
  const recoverablePct = (discovery.fteRecoverablePct ?? 60) / 100;
  const fteCost = discovery.avgFTECost ?? 120000;

  return selected.map((uc) => {
    const adjustedFTE = uc.avgFTEEquivalent * recoverablePct;
    const hoursSavedPerMonth = Math.round(adjustedFTE * 160); // ~160 work hours/month per FTE
    const laborValue = Math.round(adjustedFTE * fteCost);

    return {
      useCase: uc,
      estimatedFTESaved: adjustedFTE,
      estimatedHoursSavedPerMonth: hoursSavedPerMonth,
      cycleTimeLabel: `-${uc.avgCycleTimeReductionPct}%`,
      errorReductionLabel: `-${uc.avgErrorReductionPct}%`,
      estimatedLaborValueRecaptured: laborValue,
    };
  });
}

export function mapDiscoveryToResidualInputs(discovery: DiscoveryState): Partial<ResidualInputs> {
  const segCfg = discovery.segment ? SEGMENT_CONFIG[discovery.segment] : null;
  const selected = USE_CASES.filter((uc) => discovery.selectedUseCaseIds.includes(uc.id));

  // Aggregate defaults from selected use cases
  let totalUsers = 0;
  let totalQueries = 0;
  let totalPTU = 0;
  let totalFabric = 0;

  selected.forEach((uc) => {
    const d = uc.estimatorDefaults;
    totalUsers += d.activeUsers ?? 0;
    totalQueries += (d.activeUsers ?? 0) * (d.queriesPerUserPerMonth ?? 20);
    totalPTU += d.ptuHoursPerMonth ?? 0;
    totalFabric += d.fabricMonthlySpend ?? 0;
  });

  const avgQueriesPerUser = totalUsers > 0 ? Math.round(totalQueries / totalUsers) : segCfg?.defaultQueriesPerUser ?? 20;

  return {
    activeUsers: totalUsers || segCfg?.defaultUsers || 500,
    queriesPerUserPerMonth: avgQueriesPerUser,
    ptuHoursPerMonth: totalPTU || segCfg?.defaultPTU || 0,
    fabricMonthlySpend: totalFabric || segCfg?.defaultFabricSpend || 0,
  };
}

export function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}
