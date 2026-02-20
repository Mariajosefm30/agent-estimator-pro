import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Pencil, X } from 'lucide-react';
import { SEGMENT_CONFIG, INDUSTRY_CONFIG, USE_CASES } from '@/types/useCase';
import { formatCurrencyShort } from '@/lib/useCaseMapping';

interface ValueContext {
  segment: string | null;
  industry: string | null;
  useCaseIds: string[];
  totalAnnualValue: number;
}

interface ValueContextBarProps {
  onDismiss?: () => void;
}

export function ValueContextBar({ onDismiss }: ValueContextBarProps) {
  const navigate = useNavigate();

  const raw = sessionStorage.getItem('value_context');
  if (!raw) return null;

  let ctx: ValueContext;
  try {
    ctx = JSON.parse(raw);
  } catch {
    return null;
  }

  const segConfig = ctx.segment ? SEGMENT_CONFIG[ctx.segment as keyof typeof SEGMENT_CONFIG] : null;
  const indConfig = ctx.industry ? INDUSTRY_CONFIG[ctx.industry as keyof typeof INDUSTRY_CONFIG] : null;
  const useCases = USE_CASES.filter((uc) => ctx.useCaseIds.includes(uc.id));

  return (
    <div className="rounded-xl border border-border bg-muted px-5 py-3 flex items-center justify-between gap-4 flex-wrap">

      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <TrendingUp className="h-4 w-4 text-primary" />
        Value Context
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {segConfig && (
          <Badge variant="secondary" className="text-xs">
            {segConfig.icon} {segConfig.label}
          </Badge>
        )}
        {indConfig && (
          <Badge variant="secondary" className="text-xs">
            {indConfig.icon} {indConfig.label}
          </Badge>
        )}
        {useCases.map((uc) => (
          <Badge key={uc.id} variant="outline" className="text-xs text-primary border-primary/30">
            {uc.icon} {uc.shortLabel}
          </Badge>
        ))}
        {ctx.totalAnnualValue > 0 && (
          <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
            ~{formatCurrencyShort(ctx.totalAnnualValue)} / yr potential value
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/value')}
          className="text-primary hover:text-primary/80 h-7 px-2 text-xs gap-1"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
        {onDismiss && (
          <Button variant="ghost" size="icon" onClick={onDismiss} className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent">
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
