import { EstimatorSection } from '../EstimatorSection';
import { InputField } from '../InputField';
import { EstimatorInputs } from '@/types/estimator';
import { Cpu } from 'lucide-react';

interface PtuSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

export function PtuSection({ inputs, onChange }: PtuSectionProps) {
  return (
    <EstimatorSection
      title="Foundry PTU Usage"
      description="Azure AI Foundry Provisioned Throughput Units"
      icon={<Cpu className="h-4 w-4" />}
      infoText="Provisioned Throughput Units (PTU) provide dedicated model capacity in Azure AI Foundry. Unlike pay-as-you-go, PTU hours represent reserved compute. When Microsoft applies benefits, PTU reservations are applied first before Copilot Credit P3 and Agent pre-purchase plans. Include PTU hours if the customer plans to use dedicated model deployments."
    >
      <div className="grid gap-6">
        <InputField
          label="PTU hours per month"
          description="Provisioned throughput unit hours consumed monthly"
          value={inputs.ptuHoursPerMonth}
          onChange={(v) => onChange({ ptuHoursPerMonth: v })}
          min={0}
          max={100000}
          step={10}
          suffix="hrs"
        />
      </div>
      
      <div className="mt-4 p-3 rounded-md bg-muted/50 text-sm space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Annual PTU hours</span>
          <span className="font-medium text-foreground">
            {(inputs.ptuHoursPerMonth * 12).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">PTU rate</span>
          <span className="font-medium text-foreground">Configured in assumptions</span>
        </div>
      </div>
    </EstimatorSection>
  );
}
