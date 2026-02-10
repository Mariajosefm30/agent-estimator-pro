import { EstimatorSection } from '../EstimatorSection';
import { InputField } from '../InputField';
import { EstimatorInputs } from '@/types/estimator';
import { BookOpen } from 'lucide-react';

interface KnowledgeSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

export function KnowledgeSection({ inputs, onChange }: KnowledgeSectionProps) {
  return (
    <EstimatorSection
      title="Agent Knowledge"
      description="Configure knowledge grounding and generative answers"
      icon={<BookOpen className="h-4 w-4" />}
      infoText="Knowledge grounding determines how the agent retrieves and uses enterprise data to answer queries. Tenant graph grounding (Microsoft Graph) costs 10 credits per query plus 2 generative answer credits, while non-tenant grounding costs 2 credits per query. The split between these two affects total Copilot Credit consumption significantly."
    >
      <div className="grid gap-6">
        <InputField
          label="Responses from knowledge"
          description="Percentage of responses that use knowledge grounding"
          value={inputs.knowledgePct}
          onChange={(v) => onChange({ knowledgePct: v })}
          type="slider"
          min={0}
          max={100}
          step={5}
          suffix="%"
        />
        <InputField
          label="Using tenant graph grounding"
          description="Of knowledge responses, percentage using Microsoft Graph (tenant data)"
          value={inputs.tenantGraphPct}
          onChange={(v) => onChange({ tenantGraphPct: v })}
          type="slider"
          min={0}
          max={100}
          step={5}
          suffix="%"
        />
      </div>
      
      <div className="mt-4 p-3 rounded-md bg-muted/50 text-sm space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tenant graph grounding</span>
          <span className="font-medium text-foreground">10 credits/query + 2 generative answers</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Non-tenant grounding</span>
          <span className="font-medium text-foreground">2 credits/query</span>
        </div>
      </div>
    </EstimatorSection>
  );
}
