import { EstimatorSection } from '../EstimatorSection';
import { InputField } from '../InputField';
import { EstimatorInputs } from '@/types/estimator';
import { Zap } from 'lucide-react';

interface TriggersSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

export function TriggersSection({ inputs, onChange }: TriggersSectionProps) {
  return (
    <EstimatorSection
      title="Autonomous Triggers"
      description="Configure event-driven autonomous agent triggers"
      icon={<Zap className="h-4 w-4" />}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <InputField
          label="Triggers configured"
          description="Number of autonomous triggers set up"
          value={inputs.triggersCount}
          onChange={(v) => onChange({ triggersCount: v })}
          min={0}
          max={50}
          step={1}
        />
        <InputField
          label="Trigger runs per month"
          description="Total monthly trigger executions"
          value={inputs.triggerRunsPerMonth}
          onChange={(v) => onChange({ triggerRunsPerMonth: v })}
          min={0}
          max={100000}
          step={100}
        />
      </div>
      
      <div className="mt-4 p-3 rounded-md bg-muted/50 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Annual trigger runs</span>
          <span className="font-medium text-foreground">
            {(inputs.triggerRunsPerMonth * 12).toLocaleString()}
          </span>
        </div>
      </div>
    </EstimatorSection>
  );
}
