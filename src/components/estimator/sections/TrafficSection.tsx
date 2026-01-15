import { EstimatorSection } from '../EstimatorSection';
import { InputField } from '../InputField';
import { EstimatorInputs } from '@/types/estimator';
import { Users } from 'lucide-react';

interface TrafficSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

export function TrafficSection({ inputs, onChange }: TrafficSectionProps) {
  return (
    <EstimatorSection
      title="Traffic"
      description="Define your expected user base and query volume"
      icon={<Users className="h-4 w-4" />}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <InputField
          label="Monthly active users"
          description="Number of users accessing your agent per month"
          value={inputs.monthlyUsers}
          onChange={(v) => onChange({ monthlyUsers: v })}
          min={0}
          max={10000000}
          step={100}
        />
        <InputField
          label="Queries per user per month"
          description="Average number of queries each user makes"
          value={inputs.queriesPerUserPerMonth}
          onChange={(v) => onChange({ queriesPerUserPerMonth: v })}
          min={0}
          max={1000}
          step={1}
        />
      </div>
      
      <div className="mt-4 p-3 rounded-md bg-muted/50 text-sm">
        <span className="text-muted-foreground">Calculated: </span>
        <span className="font-medium text-foreground">
          {(inputs.monthlyUsers * inputs.queriesPerUserPerMonth).toLocaleString()} monthly queries
        </span>
        <span className="text-muted-foreground"> • </span>
        <span className="font-medium text-foreground">
          {(inputs.monthlyUsers * inputs.queriesPerUserPerMonth * 12).toLocaleString()} annual queries
        </span>
      </div>
    </EstimatorSection>
  );
}
