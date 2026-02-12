import { ResidualOutputs } from '@/types/estimator';
import { formatCurrency, formatPercent } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingDown, Coins, Sparkles, Lightbulb, ShieldCheck, AlertTriangle, CheckCircle2, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResidualOutputPanelProps {
  outputs: ResidualOutputs;
  hasMACC: boolean;
  maccBurnPct: number;
}

export function ResidualOutputPanel({ outputs, hasMACC, maccBurnPct }: ResidualOutputPanelProps) {
  const hasSavings = outputs.p3Savings > 0;
  const residualIsZero = outputs.totalResidualRetailCost <= 0;

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          P3 Value Proposition
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Residual workload analysis &amp; P3 recommendation
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">

        {/* P3 Coverage Explanation */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Understanding P3 Coverage:</span>{' '}
              P3 provides a unified pool of Agent Commit Units (ACUs) for{' '}
              <strong>Microsoft Copilot Studio</strong> and <strong>Azure AI Foundry</strong>.
              Other services like Fabric and GitHub are managed separately and do not decrement P3 ACUs.
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Cost Breakdown
          </div>
          <div className="space-y-1.5">
            <SummaryRow label="Total Estimated AI Consumption (PAYG)" value={formatCurrency(outputs.totalEstimatedRetailCost)} />
            <SummaryRow label="Covered by Existing Commitments" value={`−${formatCurrency(outputs.totalCoveredByExisting)}`} muted />
            <div className="h-px bg-border my-2" />
            <SummaryRow label="Residual Workload for P3" value={formatCurrency(outputs.totalResidualRetailCost)} bold />
          </div>
        </div>

        {/* P3 Recommendation */}
        {!residualIsZero && outputs.recommendedTier && (
          <>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  PAYG (Residual)
                </div>
                <div className="text-xl font-bold text-foreground tabular-nums">
                  {formatCurrency(outputs.totalResidualRetailCost)}
                </div>
                <div className="text-xs text-muted-foreground">/year</div>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/30 space-y-1">
                <div className="text-xs font-medium text-primary uppercase tracking-wider flex items-center gap-1">
                  P3 Tier
                  <Badge variant="default" className="bg-primary text-[10px] px-1.5 py-0">
                    Tier {outputs.recommendedTier.tier}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-foreground tabular-nums">
                  {formatCurrency(outputs.p3Cost)}
                </div>
                <div className="text-xs text-muted-foreground">/year</div>
              </div>
            </div>
          </>
        )}

        {/* Savings Callout */}
        {hasSavings && (
          <div className="p-3 rounded-lg bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-[hsl(var(--success))]" />
              <div>
                <div className="text-sm font-semibold text-[hsl(var(--success))]">
                  Estimated Savings with P3: {formatCurrency(outputs.p3Savings)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPercent(outputs.p3DiscountPct)} discount vs. PAYG for residual workload
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MACC Contribution */}
        {hasMACC && outputs.maccBurnAmount > 0 && (
          <>
            <div className="h-px bg-border" />
            <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Coins className="h-4 w-4 text-primary" />
                MACC Impact
              </div>
              <p className="text-sm text-foreground">
                This P3 purchase contributes{' '}
                <span className="font-semibold">{formatCurrency(outputs.maccBurnAmount)}</span>{' '}
                ({maccBurnPct}% of P3 cost) towards your MACC commitment, helping you strategically draw down your annual spend.
              </p>
            </div>
          </>
        )}

        {/* Dynamic Recommendation */}
        <div className="h-px bg-border" />
        <DynamicRecommendation outputs={outputs} />

        {/* Flexibility Note */}
        <div className="p-3 rounded-lg bg-accent/50 border border-border">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Flexibility tip:</span>{' '}
              P3's unified ACU pool means the customer doesn't over-buy for one service.
              ACUs flex across Copilot Studio messages <em>and</em> Azure AI Foundry tokens.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center italic pt-1">
          This estimate is directional only and does not represent a binding offer.
        </p>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={cn("text-muted-foreground", bold && "text-foreground font-medium")}>{label}</span>
      <span className={cn(
        "tabular-nums font-medium",
        bold ? "text-foreground text-base" : muted ? "text-muted-foreground" : "text-foreground"
      )}>{value}</span>
    </div>
  );
}

function DynamicRecommendation({ outputs }: { outputs: ResidualOutputs }) {
  const residual = outputs.totalResidualRetailCost;
  const smallestTierACUs = outputs.recommendedTier?.acus ?? 20000;

  if (residual <= 0) {
    return (
      <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-medium">Guidance:</span> Your current commitments fully cover your estimated AI usage.
          P3 is not needed at this time. Focus on maximizing your existing Foundry PTU Reservations and Copilot Credit
          Pre-Purchase Plan benefits. This scenario indicates excellent optimization of current resources.
        </p>
      </div>
    );
  }

  if (residual < smallestTierACUs * 0.25) {
    return (
      <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-medium">Guidance:</span> Your existing commitments cover most of your AI usage.
          P3 may not be the most cost-effective option for the small residual workload. Consider using PAYG for
          the remaining amount, or re-evaluate P3 if future usage is expected to increase significantly.
          Always compare the P3 tier cost against the PAYG cost of the residual to ensure optimal value.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
      <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
      <p className="text-xs text-foreground leading-relaxed">
        <span className="font-medium">Guidance:</span> P3 is highly recommended here. It efficiently covers your
        remaining AI workload, maximizes savings by consolidating Copilot and Foundry usage, and provides a
        predictable way to draw down your MACC commitment. This is ideal for customers scaling their AI initiatives
        across both platforms, offering both cost efficiency and operational simplicity.
      </p>
    </div>
  );
}
