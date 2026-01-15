import { EstimatorSection } from '../EstimatorSection';
import { InputField } from '../InputField';
import { EstimatorInputs } from '@/types/estimator';
import { Workflow } from 'lucide-react';

interface ActionsSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

export function ActionsSection({ inputs, onChange }: ActionsSectionProps) {
  return (
    <EstimatorSection
      title="Agent Actions & Topics"
      description="Configure actions, flows, and Power Automate integrations"
      icon={<Workflow className="h-4 w-4" />}
    >
      <div className="grid gap-6">
        <InputField
          label="Consumption from topics/actions"
          description="Percentage of queries that trigger topics or actions"
          value={inputs.actionsPct}
          onChange={(v) => onChange({ actionsPct: v })}
          type="slider"
          min={0}
          max={100}
          step={5}
          suffix="%"
        />
        
        <div className="grid gap-6 sm:grid-cols-2">
          <InputField
            label="Flows configured"
            description="Number of Power Automate flows connected"
            value={inputs.flowsConfigured}
            onChange={(v) => onChange({ flowsConfigured: v })}
            min={0}
            max={100}
            step={1}
          />
          <InputField
            label="Flow runs per month"
            description="Total monthly flow executions"
            value={inputs.flowRunsPerMonth}
            onChange={(v) => onChange({ flowRunsPerMonth: v })}
            min={0}
            max={100000}
            step={100}
          />
        </div>
      </div>
      
      <div className="mt-4 p-3 rounded-md bg-muted/50 text-sm space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Actions per query (average)</span>
          <span className="font-medium text-foreground">5 actions</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Credits per action</span>
          <span className="font-medium text-foreground">Configured in assumptions</span>
        </div>
      </div>
    </EstimatorSection>
  );
}
