import { EstimatorInputs, StrategicScenario } from '@/types/estimator';
import { cn } from '@/lib/utils';
import { Check, Layers, Coins, ArrowUpDown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScenarioSelectionSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

const scenarios: {
  id: StrategicScenario;
  label: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'hybrid_builder',
    label: 'The Hybrid Builder',
    subtitle: 'Copilot Studio + Azure AI Foundry',
    description: 'Your customer is building agents that span both Copilot Studio and Azure AI Foundry. P3 unifies consumption into a single ACU pool — no need to manage two separate budgets.',
    icon: Layers,
  },
  {
    id: 'macc_optimizer',
    label: 'The MACC Optimizer',
    subtitle: 'Predictable MACC burn-down',
    description: 'Your customer has an existing MACC commitment and wants a predictable, discounted way to consume it. P3 draws down MACC while locking in savings vs. pay-as-you-go.',
    icon: Coins,
  },
  {
    id: 'scaler',
    label: 'The Scaler',
    subtitle: 'Flexible messages + tokens',
    description: 'Your customer needs a budget that flexes across both message-based and token-based workloads. P3\'s unified ACUs mean they never over-buy for just one service.',
    icon: ArrowUpDown,
  },
];

export function ScenarioSelectionSection({ inputs, onChange }: ScenarioSelectionSectionProps) {
  const handleSelect = (scenario: StrategicScenario) => {
    // Auto-set customer starting point based on scenario
    let startingPoint = inputs.customerContext.startingPoint;
    if (scenario === 'macc_optimizer') {
      startingPoint = 'macc_only';
    } else if (scenario === 'hybrid_builder') {
      startingPoint = 'copilot_macc';
    }

    const hasMACC = startingPoint === 'macc_only' || startingPoint === 'copilot_macc';
    const hasCopilot = startingPoint === 'copilot_only' || startingPoint === 'copilot_macc';

    onChange({
      strategicScenario: scenario,
      customerContext: {
        ...inputs.customerContext,
        startingPoint,
        hasMACC,
        hasCopilot,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Which scenario best describes your customer?
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Select the scenario that most closely matches your customer's situation. This helps us tailor the estimate and highlight the right value proposition.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {scenarios.map(({ id, label, subtitle, description, icon: Icon }) => {
          const isSelected = inputs.strategicScenario === id;
          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={cn(
                "relative flex flex-col items-start gap-3 p-5 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className={cn(
                  "font-semibold",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {label}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {subtitle}
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </button>
          );
        })}
      </div>

      {/* P3 Recommendation Badge */}
      {inputs.strategicScenario && (
        <div className="flex justify-center pt-2">
          <Badge className="gap-1.5 px-4 py-2 text-sm bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-0">
            <Sparkles className="h-4 w-4" />
            P3 is a Strong Fit for This Customer
          </Badge>
        </div>
      )}
    </div>
  );
}
