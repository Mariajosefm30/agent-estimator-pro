import { FourWayComparison } from '@/types/estimator';
import { formatCurrency } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SellerTip } from './SellerTip';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Trophy, Scale, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizationMatrixProps {
  comparison: FourWayComparison;
}

export function OptimizationMatrix({ comparison }: OptimizationMatrixProps) {
  const options = [
    { key: 'purePAYG' as const, data: comparison.purePAYG, icon: '💳' },
    { key: 'specializedSilos' as const, data: comparison.specializedSilos, icon: '🧱' },
    { key: 'unifiedP3' as const, data: comparison.unifiedP3, icon: '🔮' },
  ];

  const cheapest = Math.min(...options.map(o => o.data.annualCost));

  // Determine guidance icon
  const isWin = comparison.winnerKey === 'unifiedP3';
  const isStrategic = comparison.winnerKey === 'specializedSilos' && comparison.winGuidance.startsWith('STRATEGIC');

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-br from-accent to-muted">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          Optimization Matrix
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Four-way comparison: PAYG+ACO vs. Specialized Silos vs. Unified P3
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Comparison Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Option</TableHead>
                <TableHead className="text-xs font-semibold text-right">Annual Cost</TableHead>
                <TableHead className="text-xs font-semibold text-right">vs. Best</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.map(({ key, data, icon }) => {
                const isWinner = key === comparison.winnerKey;
                const diff = cheapest > 0 ? ((data.annualCost - cheapest) / cheapest) * 100 : 0;
                return (
                  <TableRow
                    key={key}
                    className={cn(
                      isWinner && 'bg-primary/5 border-l-2 border-l-primary'
                    )}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <div>
                          <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            {data.label}
                            {isWinner && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-primary">
                                Best
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{data.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <span className={cn(
                        "tabular-nums font-semibold text-sm",
                        isWinner ? "text-primary" : "text-foreground"
                      )}>
                        {formatCurrency(data.annualCost)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      {isWinner ? (
                        <Trophy className="h-4 w-4 text-primary ml-auto" />
                      ) : (
                        <span className="text-xs tabular-nums text-muted-foreground">
                          +{diff.toFixed(1)}%
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Dynamic Win Guidance */}
        <div className={cn(
          "p-3 rounded-lg border flex items-start gap-2",
          isWin
            ? "bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30"
            : isStrategic
              ? "bg-primary/5 border-primary/20"
              : "bg-muted/30 border-border"
        )}>
          {isWin ? (
            <Trophy className="h-4 w-4 text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
          ) : isStrategic ? (
            <Scale className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}
          <p className="text-xs text-foreground leading-relaxed">
            <span className="font-semibold">{comparison.winGuidance.split(':')[0]}:</span>
            {comparison.winGuidance.substring(comparison.winGuidance.indexOf(':') + 1)}
          </p>
        </div>

        {/* ACO vs P3 Discount Alert */}
        {comparison.acoHigherThanP3 && (
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-start gap-2">
            <SellerTip tip="If the P3 Tier discount is lower than the ACO discount, P3 must be sold on Flexibility and MACC Burn, not just price. Emphasize the unified ACU pool and upfront MACC drawdown." />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Note:</span> The customer's ACO discount exceeds the P3 tier discount. Position P3 on <strong>flexibility</strong> and <strong>MACC acceleration</strong>, not price alone.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
