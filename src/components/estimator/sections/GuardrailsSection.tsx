import { EstimatorSection } from '../EstimatorSection';
import { InputField } from '../InputField';
import { EstimatorInputs } from '@/types/estimator';
import { Shield, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface GuardrailsSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

export function GuardrailsSection({ inputs, onChange }: GuardrailsSectionProps) {
  const { guardrails } = inputs;

  const handleToggle = (field: keyof typeof guardrails, value: boolean) => {
    onChange({
      guardrails: {
        ...guardrails,
        [field]: value,
      },
    });
  };

  const handleAmountChange = (field: keyof typeof guardrails, value: number) => {
    onChange({
      guardrails: {
        ...guardrails,
        [field]: value,
      },
    });
  };

  const enabledCount = [
    guardrails.monthlyCapEnabled,
    guardrails.dailyCapEnabled,
    guardrails.rbacEnabled,
    guardrails.throttlingEnabled,
    guardrails.environmentSeparation,
  ].filter(Boolean).length;

  return (
    <EstimatorSection
      title="Budget Guardrails"
      description="Configure spending controls and access policies"
      icon={<Shield className="h-4 w-4" />}
      infoText="Budget guardrails let you cap ACU consumption at monthly or daily limits, enable role-based access control (RBAC), throttle request rates, and isolate dev/prod environments. When caps are enabled, the P90 cost estimate is clamped to the cap amount, giving finance teams a hard ceiling for budget planning. These controls directly reduce the volatility score shown in the summary."
    >
      <div className="space-y-4">
        {enabledCount > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20 w-fit">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {enabledCount} guardrail{enabledCount !== 1 ? 's' : ''} enabled
            </span>
          </div>
        )}

        {/* Monthly Cap */}
        <div className="space-y-3 p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-foreground">Monthly Spending Cap</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Limit maximum monthly ACU consumption
              </p>
            </div>
            <Switch
              checked={guardrails.monthlyCapEnabled}
              onCheckedChange={(v) => handleToggle('monthlyCapEnabled', v)}
            />
          </div>
          {guardrails.monthlyCapEnabled && (
            <InputField
              label="Monthly Cap Amount"
              value={guardrails.monthlyCapAmount || 0}
              onChange={(v) => handleAmountChange('monthlyCapAmount', v)}
              min={0}
              max={100000}
              step={1000}
              suffix="USD"
            />
          )}
        </div>

        {/* Daily Cap */}
        <div className="space-y-3 p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-foreground">Daily Spending Cap</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Limit daily burst consumption
              </p>
            </div>
            <Switch
              checked={guardrails.dailyCapEnabled}
              onCheckedChange={(v) => handleToggle('dailyCapEnabled', v)}
            />
          </div>
          {guardrails.dailyCapEnabled && (
            <InputField
              label="Daily Cap Amount"
              value={guardrails.dailyCapAmount || 0}
              onChange={(v) => handleAmountChange('dailyCapAmount', v)}
              min={0}
              max={10000}
              step={100}
              suffix="USD"
            />
          )}
        </div>

        {/* Other Guardrails */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border transition-colors",
            guardrails.rbacEnabled ? "border-primary/30 bg-primary/5" : "border-border"
          )}>
            <div>
              <Label className="text-sm font-medium text-foreground">RBAC</Label>
              <p className="text-xs text-muted-foreground">Role-based access</p>
            </div>
            <Switch
              checked={guardrails.rbacEnabled}
              onCheckedChange={(v) => handleToggle('rbacEnabled', v)}
            />
          </div>

          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border transition-colors",
            guardrails.throttlingEnabled ? "border-primary/30 bg-primary/5" : "border-border"
          )}>
            <div>
              <Label className="text-sm font-medium text-foreground">Throttling</Label>
              <p className="text-xs text-muted-foreground">Rate limiting</p>
            </div>
            <Switch
              checked={guardrails.throttlingEnabled}
              onCheckedChange={(v) => handleToggle('throttlingEnabled', v)}
            />
          </div>

          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border transition-colors",
            guardrails.environmentSeparation ? "border-primary/30 bg-primary/5" : "border-border"
          )}>
            <div>
              <Label className="text-sm font-medium text-foreground">Env Separation</Label>
              <p className="text-xs text-muted-foreground">Dev/Prod isolation</p>
            </div>
            <Switch
              checked={guardrails.environmentSeparation}
              onCheckedChange={(v) => handleToggle('environmentSeparation', v)}
            />
          </div>
        </div>
      </div>
    </EstimatorSection>
  );
}
