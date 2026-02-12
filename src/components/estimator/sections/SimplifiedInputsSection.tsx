import { EstimatorSection } from '../EstimatorSection';
import { EstimatorInputs, UserScale, AgentComplexity, FoundryUsage } from '@/types/estimator';
import { cn } from '@/lib/utils';
import { Users, Brain, Server, Check } from 'lucide-react';

interface SimplifiedInputsSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

const userScaleOptions: { id: UserScale; label: string; range: string; users: number; queries: number }[] = [
  { id: 'small', label: 'Small', range: '< 500 users', users: 250, queries: 15 },
  { id: 'medium', label: 'Medium', range: '500 – 5,000 users', users: 2000, queries: 20 },
  { id: 'enterprise', label: 'Enterprise', range: '5,000+ users', users: 10000, queries: 25 },
];

const complexityOptions: {
  id: AgentComplexity;
  label: string;
  description: string;
  knowledgePct: number;
  actionsPct: number;
  toolCallingPct: number;
  promptModel: 'basic' | 'standard' | 'premium';
  workloadType: 'qa' | 'rag' | 'multi_step_agent';
  intensity: 'light' | 'medium' | 'heavy';
}[] = [
  {
    id: 'basic_qa',
    label: 'Basic Q&A',
    description: 'Simple question-answer bots with minimal knowledge lookup',
    knowledgePct: 30, actionsPct: 10, toolCallingPct: 5,
    promptModel: 'basic', workloadType: 'qa', intensity: 'light',
  },
  {
    id: 'knowledge_rag',
    label: 'Knowledge / RAG',
    description: 'Agents grounded in enterprise data with retrieval-augmented generation',
    knowledgePct: 60, actionsPct: 30, toolCallingPct: 20,
    promptModel: 'standard', workloadType: 'rag', intensity: 'medium',
  },
  {
    id: 'advanced_tooling',
    label: 'Advanced / Tool-calling',
    description: 'Multi-step agents with connectors, flows, and external tool invocations',
    knowledgePct: 50, actionsPct: 60, toolCallingPct: 50,
    promptModel: 'premium', workloadType: 'multi_step_agent', intensity: 'heavy',
  },
];

const foundryOptions: { id: FoundryUsage; label: string; description: string; ptuHours: number }[] = [
  { id: 'none', label: 'None', description: 'No Azure AI Foundry usage', ptuHours: 0 },
  { id: 'experimental', label: 'Experimental', description: 'Testing or pilot workloads', ptuHours: 50 },
  { id: 'production', label: 'Production-scale', description: 'Full production deployment', ptuHours: 500 },
];

function OptionGroup<T extends string>({
  label,
  icon: Icon,
  options,
  selected,
  onSelect,
}: {
  label: string;
  icon: React.ElementType;
  options: { id: T; label: string; description?: string; range?: string }[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={cn(
                "relative flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <span className={cn(
                "text-sm font-medium",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {opt.label}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {opt.range || opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SimplifiedInputsSection({ inputs, onChange }: SimplifiedInputsSectionProps) {
  const handleUserScale = (scale: UserScale) => {
    const opt = userScaleOptions.find((o) => o.id === scale)!;
    onChange({
      userScale: scale,
      monthlyUsers: opt.users,
      queriesPerUserPerMonth: opt.queries,
    });
  };

  const handleComplexity = (complexity: AgentComplexity) => {
    const opt = complexityOptions.find((o) => o.id === complexity)!;
    onChange({
      agentComplexity: complexity,
      knowledgePct: opt.knowledgePct,
      actionsPct: opt.actionsPct,
      usePromptTools: complexity !== 'basic_qa',
      promptModelType: opt.promptModel,
      promptResponsesPerMonth: complexity === 'basic_qa' ? 0 : 500,
      usageVariability: {
        ...inputs.usageVariability,
        workloadType: opt.workloadType,
        workloadIntensity: opt.intensity,
        toolCallingPercent: opt.toolCallingPct,
      },
    });
  };

  const handleFoundry = (usage: FoundryUsage) => {
    const opt = foundryOptions.find((o) => o.id === usage)!;
    onChange({
      foundryUsage: usage,
      ptuHoursPerMonth: opt.ptuHours,
    });
  };

  return (
    <EstimatorSection
      title="Usage Profile"
      description="Tell us about scale, complexity, and Foundry usage"
      icon={<Users className="h-4 w-4" />}
      infoText="These three selectors map to the underlying consumption formulas. User Scale sets monthly users and query volume. Agent Complexity drives knowledge lookup %, action %, tool-calling %, and model tier. Foundry Usage sets provisioned throughput hours."
    >
      <div className="space-y-5">
        <OptionGroup
          label="User Scale"
          icon={Users}
          options={userScaleOptions}
          selected={inputs.userScale}
          onSelect={handleUserScale}
        />
        <OptionGroup
          label="Agent Complexity"
          icon={Brain}
          options={complexityOptions}
          selected={inputs.agentComplexity}
          onSelect={handleComplexity}
        />
        <OptionGroup
          label="Azure AI Foundry Usage"
          icon={Server}
          options={foundryOptions}
          selected={inputs.foundryUsage}
          onSelect={handleFoundry}
        />
      </div>
    </EstimatorSection>
  );
}
