import { EstimatorSection } from '../EstimatorSection';
import { InputField } from '../InputField';
import { EstimatorInputs, WorkloadType, WorkloadIntensity } from '@/types/estimator';
import { Activity, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface UsageProfileSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

const workloadTypes: { id: WorkloadType; label: string; description: string }[] = [
  { id: 'qa', label: 'Q&A', description: 'Simple question answering' },
  { id: 'summarization', label: 'Summarization', description: 'Document summarization' },
  { id: 'extraction', label: 'Extraction', description: 'Data/info extraction' },
  { id: 'multi_step_agent', label: 'Multi-step Agent', description: 'Complex reasoning chains' },
  { id: 'rag', label: 'RAG', description: 'Retrieval-augmented generation' },
];

const intensityLevels: { id: WorkloadIntensity; label: string; color: string }[] = [
  { id: 'light', label: 'Light', color: 'text-green-600' },
  { id: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { id: 'heavy', label: 'Heavy', color: 'text-red-600' },
];

export function UsageProfileSection({ inputs, onChange }: UsageProfileSectionProps) {
  const { usageVariability } = inputs;

  const handleChange = (field: keyof typeof usageVariability, value: string | number) => {
    onChange({
      usageVariability: {
        ...usageVariability,
        [field]: value,
      },
    });
  };

  return (
    <EstimatorSection
      title="Usage Profile (Ranges)"
      description="Configure workload patterns for P50/P90 estimates"
      icon={<Activity className="h-4 w-4" />}
    >
      <div className="space-y-6">
        {/* Workload Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Workload Type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {workloadTypes.map(({ id, label, description }) => (
              <button
                key={id}
                onClick={() => handleChange('workloadType', id)}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all",
                  usageVariability.workloadType === id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <div className={cn(
                  "text-sm font-medium",
                  usageVariability.workloadType === id ? "text-primary" : "text-foreground"
                )}>
                  {label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Workload Intensity */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Workload Intensity</Label>
          <RadioGroup
            value={usageVariability.workloadIntensity}
            onValueChange={(v) => handleChange('workloadIntensity', v)}
            className="flex gap-4"
          >
            {intensityLevels.map(({ id, label, color }) => (
              <div key={id} className="flex items-center gap-2">
                <RadioGroupItem value={id} id={`intensity-${id}`} />
                <Label 
                  htmlFor={`intensity-${id}`} 
                  className={cn("font-medium cursor-pointer", color)}
                >
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Usage Parameters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InputField
            label="Avg Turns per Task"
            description="Average conversation turns"
            value={usageVariability.avgTurnsPerTask}
            onChange={(v) => handleChange('avgTurnsPerTask', v)}
            min={1}
            max={20}
            step={1}
          />
          <InputField
            label="Tasks per User/Week"
            description="Weekly tasks per active user"
            value={usageVariability.tasksPerUserPerWeek}
            onChange={(v) => handleChange('tasksPerUserPerWeek', v)}
            min={1}
            max={100}
            step={1}
          />
          <InputField
            label="Active User %"
            description="Percent of licensed users active"
            value={usageVariability.activeUserPercent}
            onChange={(v) => handleChange('activeUserPercent', v)}
            type="slider"
            min={10}
            max={100}
            step={5}
            suffix="%"
          />
          <InputField
            label="Tool Calling %"
            description="Queries invoking external tools"
            value={usageVariability.toolCallingPercent}
            onChange={(v) => handleChange('toolCallingPercent', v)}
            type="slider"
            min={0}
            max={100}
            step={5}
            suffix="%"
          />
          <InputField
            label="Long Context %"
            description="Queries with large context windows"
            value={usageVariability.longContextPercent}
            onChange={(v) => handleChange('longContextPercent', v)}
            type="slider"
            min={0}
            max={100}
            step={5}
            suffix="%"
          />
        </div>

        <Alert className="bg-muted/30 border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Agent usage varies by prompt length, turns, and tool-calling. We show P50 (typical) and P90 (high-usage) to help finance plan.
          </AlertDescription>
        </Alert>
      </div>
    </EstimatorSection>
  );
}
