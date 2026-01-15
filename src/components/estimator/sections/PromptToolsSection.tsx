import { EstimatorSection } from '../EstimatorSection';
import { InputField } from '../InputField';
import { EstimatorInputs } from '@/types/estimator';
import { MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PromptToolsSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

export function PromptToolsSection({ inputs, onChange }: PromptToolsSectionProps) {
  return (
    <EstimatorSection
      title="Optional Modifiers: Prompt Tools"
      description="Configure AI prompt tools and model tiers"
      icon={<MessageSquare className="h-4 w-4" />}
      defaultOpen={false}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="use-prompt-tools" className="text-sm font-medium">
              Enable prompt tools
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use AI prompt capabilities in your agent
            </p>
          </div>
          <Switch
            id="use-prompt-tools"
            checked={inputs.usePromptTools}
            onCheckedChange={(checked) => onChange({ usePromptTools: checked })}
          />
        </div>

        {inputs.usePromptTools && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Prompt model type</Label>
              <RadioGroup
                value={inputs.promptModelType}
                onValueChange={(v) => onChange({ promptModelType: v as 'basic' | 'standard' | 'premium' })}
                className="grid gap-2"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="basic" id="basic" />
                  <div className="flex-1">
                    <Label htmlFor="basic" className="font-medium cursor-pointer">Basic</Label>
                    <p className="text-xs text-muted-foreground">1 credit per 10 responses</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="standard" id="standard" />
                  <div className="flex-1">
                    <Label htmlFor="standard" className="font-medium cursor-pointer">Standard</Label>
                    <p className="text-xs text-muted-foreground">15 credits per 10 responses</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="premium" id="premium" />
                  <div className="flex-1">
                    <Label htmlFor="premium" className="font-medium cursor-pointer">Premium</Label>
                    <p className="text-xs text-muted-foreground">100 credits per 10 responses</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <InputField
              label="Prompt responses per month"
              description="Number of AI-generated responses monthly"
              value={inputs.promptResponsesPerMonth}
              onChange={(v) => onChange({ promptResponsesPerMonth: v })}
              min={0}
              max={1000000}
              step={100}
            />
          </>
        )}
      </div>
    </EstimatorSection>
  );
}
