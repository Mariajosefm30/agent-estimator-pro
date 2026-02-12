import { EstimatorOutputs, Guardrails } from '@/types/estimator';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Coins,
  DollarSign,
  TrendingDown,
  Info,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TotalsPanelProps {
  outputs: EstimatorOutputs;
  guardrails: Guardrails;
}

export function TotalsPanel({ outputs, guardrails }: TotalsPanelProps) {
  const hasSavings = outputs.estimatedSavings > 0;
  const hasMACC = outputs.maccFundedAmountP50 > 0 || outputs.maccFundedAmountP90 > 0;

  return (
    <Card className="border-2 border-primary/20 sticky top-4 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Your P3 Recommendation
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Compare pay-as-you-go vs. pre-purchase savings
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">

        {/* Phase 3: Side-by-side comparison */}
        <div className="grid grid-cols-2 gap-3">
          {/* PAYG Side */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pay-As-You-Go
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums">
              {formatCurrency(outputs.totalPaygCostUsd)}
            </div>
            <div className="text-xs text-muted-foreground">/year</div>
          </div>

          {/* P3 Side */}
          <div className={cn(
            "p-3 rounded-lg border space-y-1",
            "bg-primary/5 border-primary/30"
          )}>
            <div className="text-xs font-medium text-primary uppercase tracking-wider flex items-center gap-1">
              P3 Tier
              {outputs.recommendedTier && (
                <Badge variant="default" className="bg-primary text-[10px] px-1.5 py-0">
                  Tier {outputs.recommendedTier.tier}
                </Badge>
              )}
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums">
              {formatCurrency(outputs.estimatedPlanCost)}
            </div>
            <div className="text-xs text-muted-foreground">/year</div>
          </div>
        </div>

        {/* Savings Callout */}
        {hasSavings && (
          <div className="p-3 rounded-lg bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-[hsl(var(--success))]" />
              <div>
                <div className="text-sm font-semibold text-[hsl(var(--success))]">
                  Estimated Annual Savings: {formatCurrency(outputs.estimatedSavings)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPercent(outputs.estimatedDiscountPct)} discount vs. pay-as-you-go
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MACC Impact */}
        {hasMACC && (
          <>
            <div className="h-px bg-border" />
            <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Coins className="h-4 w-4 text-primary" />
                MACC Impact
              </div>
              <p className="text-sm text-foreground">
                This purchase draws down{' '}
                <span className="font-semibold">
                  {formatCurrency(outputs.maccFundedAmountP50)}
                </span>{' '}
                of your MACC commitment.
              </p>
              {outputs.netNewCashP50 > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3" />
                  Net new cash required: {formatCurrency(outputs.netNewCashP50)}
                </div>
              )}
              {outputs.monthsOfRunwayFromMACC != null && outputs.monthsOfRunwayFromMACC > 0 && (
                <div className="text-xs text-muted-foreground">
                  ~{outputs.monthsOfRunwayFromMACC} months runway from remaining MACC
                </div>
              )}
            </div>
          </>
        )}

        {/* Key Metrics */}
        <div className="h-px bg-border" />
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-0.5">ACUs Required</div>
            <div className="font-semibold text-foreground tabular-nums">
              {formatNumber(outputs.acusRequired)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
              Monthly (P50–P90)
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p>P50 = typical month. P90 = peak month. Based on workload intensity and complexity.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="font-semibold text-foreground tabular-nums text-xs">
              {formatCurrency(outputs.p50MonthlyCost)} – {formatCurrency(outputs.p90MonthlyCost)}
            </div>
          </div>
        </div>

        {/* Flexibility Note */}
        <div className="p-3 rounded-lg bg-accent/50 border border-border">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Flexibility tip:</span>{' '}
              P3's unified ACU pool means your customer doesn't have to worry about "over-buying" for just one service. 
              ACUs flex across Copilot Studio messages <em>and</em> Azure AI Foundry tokens.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-1">
          <p className="text-[10px] text-muted-foreground text-center italic">
            This estimate is directional only and does not represent a binding offer.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
