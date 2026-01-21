import { EstimatorInputs, SCENARIO_PRESETS, DEFAULT_GUARDRAILS, DEFAULT_USAGE_VARIABILITY, DEFAULT_CUSTOMER_CONTEXT } from '@/types/estimator';
import { Sparkles, Rocket, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScenarioPresetsSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

const presetIcons: Record<string, React.ElementType> = {
  pilot: Rocket,
  finance_safe: ShieldCheck,
  power_users: Zap,
};

export function ScenarioPresetsSection({ inputs, onChange }: ScenarioPresetsSectionProps) {
  const applyPreset = (presetId: string) => {
    const preset = SCENARIO_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const newInputs: Partial<EstimatorInputs> = {
      customerContext: {
        ...DEFAULT_CUSTOMER_CONTEXT,
        ...preset.customerContext,
      },
      usageVariability: {
        ...DEFAULT_USAGE_VARIABILITY,
        ...preset.usageVariability,
      },
      guardrails: {
        ...DEFAULT_GUARDRAILS,
        ...preset.guardrails,
      },
    };

    if (preset.trafficOverrides) {
      Object.assign(newInputs, preset.trafficOverrides);
    }

    onChange(newInputs);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Quick Presets</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SCENARIO_PRESETS.map((preset) => {
          const Icon = presetIcons[preset.id] || Sparkles;
          return (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset.id)}
              className={cn(
                "gap-2 transition-all",
                "hover:border-primary hover:bg-primary/5"
              )}
            >
              <Icon className="h-4 w-4" />
              {preset.name}
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Apply a preset to quickly configure typical scenarios. You can adjust values after.
      </p>
    </div>
  );
}
