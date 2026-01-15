import { EstimatorOutputs } from '@/types/estimator';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Clock, 
  DollarSign, 
  Zap, 
  TrendingDown,
  Info 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TotalsPanelProps {
  outputs: EstimatorOutputs;
}

export function TotalsPanel({ outputs }: TotalsPanelProps) {
  const hasSavings = outputs.estimatedSavings > 0;

  return (
    <Card className="fluent-shadow-lg border-2 border-primary/20 sticky top-4">
      <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Estimate Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Annual Copilot Credits */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Annual Copilot Credits</span>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {formatNumber(outputs.annualCopilotCredits)}
          </span>
        </div>

        {/* Annual PTU Hours */}
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

        {/* Disclaimer */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground text-center italic">
            This estimate is directional only and does not represent a binding offer.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
