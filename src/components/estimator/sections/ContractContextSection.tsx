import { EstimatorSection } from '../EstimatorSection';
import { InputField } from '../InputField';
import { EstimatorInputs } from '@/types/estimator';
import { FileText, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContractContextSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

export function ContractContextSection({ inputs, onChange }: ContractContextSectionProps) {
  const { customerContext } = inputs;
  const showMACCFields = customerContext.hasMACC;
  const showCopilotIndicator = customerContext.hasCopilot;

  const handleContextChange = (field: string, value: number | string | undefined) => {
    onChange({
      customerContext: {
        ...customerContext,
        [field]: value,
      },
    });
  };

  return (
    <EstimatorSection
      title="Contract Context (MACC / Copilot)"
      description="Define existing Microsoft commitments"
      icon={<FileText className="h-4 w-4" />}
    >
      <div className="space-y-4">
        {showMACCFields && (
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="MACC Remaining"
              description="Remaining MACC balance in USD"
              value={customerContext.maccRemaining || 0}
              onChange={(v) => handleContextChange('maccRemaining', v)}
              min={0}
              max={10000000}
              step={10000}
              suffix="USD"
            />
            <InputField
              label="Current Monthly Burn"
              description="Current Azure consumption per month"
              value={customerContext.currentMonthlyBurn || 0}
              onChange={(v) => handleContextChange('currentMonthlyBurn', v)}
              min={0}
              max={1000000}
              step={1000}
              suffix="USD"
            />
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">MACC End Date</Label>
              <Input
                type="date"
                value={customerContext.maccEndDate || ''}
                onChange={(e) => handleContextChange('maccEndDate', e.target.value || undefined)}
              />
            </div>
            <InputField
              label="Discount Percent"
              description="Negotiated MACC discount rate"
              value={customerContext.discountPercent || 0}
              onChange={(v) => handleContextChange('discountPercent', v)}
              min={0}
              max={50}
              step={1}
              suffix="%"
            />
          </div>
        )}

        {showCopilotIndicator && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 text-primary">
              <Info className="h-4 w-4" />
              <span className="font-medium text-sm">Copilot License Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Customer has existing Microsoft Copilot license. Credits may overlap.
            </p>
          </div>
        )}

        {!showMACCFields && !showCopilotIndicator && (
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              Select a starting point above to configure contract context.
            </p>
          </div>
        )}

        <Alert className="bg-muted/30 border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Results will show net-new cash vs MACC-funded usage when applicable.
          </AlertDescription>
        </Alert>
      </div>
    </EstimatorSection>
  );
}
