import { EstimatorOutputs, ViewMode, Guardrails } from '@/types/estimator';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Clock, 
  DollarSign, 
  Zap, 
  TrendingDown,
  Info,
  AlertTriangle,
  Shield,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TotalsPanelProps {
  outputs: EstimatorOutputs;
  viewMode: ViewMode;
  guardrails: Guardrails;
}

function VolatilityBadge({ score }: { score: string }) {
  const colors = {
    low: 'bg-green-500/10 text-green-600 border-green-500/30',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    high: 'bg-red-500/10 text-red-600 border-red-500/30',
  };
  
  return (
    <Badge variant="outline" className={cn("capitalize", colors[score as keyof typeof colors])}>
      {score} Volatility
    </Badge>
  );
}

function CostRangeBar({ p50: _p50, p90: _p90, capped }: { p50: number; p90: number; capped?: number | null }) {
  const displayP90 = capped ?? _p90;
  const maxVal = Math.max(_p90, displayP90);
  const p50Width = ((_p50 / maxVal) * 100);
  const p90Width = ((displayP90 / maxVal) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>P50: {formatCurrency(_p50)}</span>
        <span>P90: {formatCurrency(displayP90)}{capped ? ' (capped)' : ''}</span>
      </div>
      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-primary/30 rounded-full"
          style={{ width: `${p90Width}%` }}
        />
        <div 
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          style={{ width: `${p50Width}%` }}
        />
      </div>
    </div>
  );
}

export function TotalsPanel({ outputs, viewMode, guardrails }: TotalsPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const hasSavings = outputs.estimatedSavings > 0;
  const hasMACC = outputs.maccFundedAmountP50 > 0 || outputs.maccFundedAmountP90 > 0;
  const isSeller = viewMode === 'seller';

  // Count enabled guardrails
  const enabledGuardrails = [
    guardrails.monthlyCapEnabled && 'Monthly cap',
    guardrails.dailyCapEnabled && 'Daily cap',
    guardrails.rbacEnabled && 'RBAC',
    guardrails.throttlingEnabled && 'Throttling',
    guardrails.environmentSeparation && 'Env separation',
  ].filter(Boolean);

  return (
    <Card className="fluent-shadow-lg border-2 border-primary/20 sticky top-4">
      <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Estimate Summary
          </div>
          <VolatilityBadge score={outputs.volatilityScore} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Financial Summary - P50/P90 Range */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <DollarSign className="h-4 w-4" />
            Monthly Cost Range
          </div>
          <CostRangeBar 
            p50={outputs.p50MonthlyCost} 
            p90={outputs.p90MonthlyCost}
            capped={outputs.cappedP90MonthlyCost}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">P50 Annual ACU</div>
            <div className="font-semibold text-foreground">{formatNumber(outputs.p50ACU)}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">P90 Annual ACU</div>
            <div className="font-semibold text-foreground">{formatNumber(outputs.p90ACU)}</div>
          </div>
        </div>

        {/* MACC Impact */}
        {hasMACC && (
          <>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Coins className="h-4 w-4" />
                MACC Impact
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Covered by MACC</div>
                  <div className="font-medium text-green-600">
                    {formatCurrency(outputs.maccFundedAmountP50)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Net New Cost</div>
                  <div className="font-medium text-foreground">
                    {formatCurrency(outputs.netNewCashP50)}
                  </div>
                </div>
              </div>
              {outputs.monthsOfRunwayFromMACC && (
                <div className="text-xs text-muted-foreground">
                  ~{outputs.monthsOfRunwayFromMACC} months runway from MACC
                </div>
              )}
            </div>
          </>
        )}

        {/* Budget Predictability Panel (Seller Only) */}
        {isSeller && enabledGuardrails.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="h-4 w-4" />
                Guardrails Active
              </div>
              <div className="flex flex-wrap gap-1">
                {enabledGuardrails.map((g) => (
                  <Badge key={g as string} variant="secondary" className="text-xs gap-1">
                    <Check className="h-3 w-3" />
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Worst-case Uncapped (Seller Only or Advanced) */}
        {isSeller && outputs.cappedP90MonthlyCost && (
          <div className="p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 text-xs text-yellow-700">
              <AlertTriangle className="h-3 w-3" />
              <span>Worst-case uncapped: {formatCurrency(outputs.worstCaseUncapped)}/mo</span>
            </div>
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Legacy metrics */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Annual Copilot Credits</span>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {formatNumber(outputs.annualCopilotCredits)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Annual Foundry PTU Hours</span>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {formatNumber(outputs.annualPtuHours)}
          </span>
        </div>

        <div className="h-px bg-border" />

        {/* PAYG Cost */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Estimated PAYG Cost</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>Pay-as-you-go retail cost before any pre-purchase discounts.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {formatCurrency(outputs.totalPaygCostUsd)}
          </span>
        </div>

        {/* ACUs Required */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">ACUs Required</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>Azure Consumption Units equal to USD retail cost. 1 ACU = $1 USD.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {formatNumber(outputs.acusRequired)}
          </span>
        </div>

        <div className="h-px bg-border" />

        {/* Recommended Tier */}
        {outputs.recommendedTier && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Recommended Tier</span>
              <Badge variant="default" className="bg-primary">
                Tier {outputs.recommendedTier.tier}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatNumber(outputs.recommendedTier.acus)} ACUs
              </span>
              <span className="font-semibold text-foreground">
                {formatCurrency(outputs.recommendedTier.estimated_cost)}
              </span>
            </div>
            
            {hasSavings && (
              <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                <div className="flex items-center gap-1.5 text-success">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Estimated Savings</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-success">
                    {formatCurrency(outputs.estimatedSavings)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    (~{formatPercent(outputs.estimatedDiscountPct)})
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced (Customer Mode) */}
        {!isSeller && outputs.cappedP90MonthlyCost && (
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                advancedOpen && "rotate-180"
              )} />
              Advanced
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2 text-xs text-yellow-700">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Worst-case uncapped: {formatCurrency(outputs.worstCaseUncapped)}/mo</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Objection Handling Microcopy */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground text-center italic">
            {isSeller 
              ? "ACU drawdown depends on workload intensity, turns, and tool-calling. This estimator models variability via P50/P90 to support budgeting and avoids false precision."
              : "Your usage can vary. We show a typical and high-usage range to help you plan safely."
            }
          </p>
        </div>

        {/* Disclaimer */}
        <div className="pt-1">
          <p className="text-xs text-muted-foreground text-center italic">
            This estimate is directional only and does not represent a binding offer.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
