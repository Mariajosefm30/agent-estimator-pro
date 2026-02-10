import { EstimatorSection } from '../EstimatorSection';
import { EstimatorInputs, CustomerStartingPoint } from '@/types/estimator';
import { cn } from '@/lib/utils';
import { Check, Building2, CreditCard, Bot, Layers, UserCheck } from 'lucide-react';

interface CustomerStartingPointSectionProps {
  inputs: EstimatorInputs;
  onChange: (updates: Partial<EstimatorInputs>) => void;
}

const startingPoints: { 
  id: CustomerStartingPoint; 
  label: string; 
  description: string;
  icon: React.ElementType;
}[] = [
  { 
    id: 'greenfield', 
    label: 'Greenfield', 
    description: 'No Copilot, No MACC',
    icon: Building2,
  },
  { 
    id: 'macc_only', 
    label: 'MACC Only', 
    description: 'Has MACC commitment',
    icon: CreditCard,
  },
  { 
    id: 'copilot_only', 
    label: 'Copilot Only', 
    description: 'Has Copilot license',
    icon: Bot,
  },
  { 
    id: 'copilot_macc', 
    label: 'Copilot + MACC', 
    description: 'Both Copilot and MACC',
    icon: Layers,
  },
];

export function CustomerStartingPointSection({ inputs, onChange }: CustomerStartingPointSectionProps) {
  const handleChange = (startingPoint: CustomerStartingPoint) => {
    const hasMACC = startingPoint === 'macc_only' || startingPoint === 'copilot_macc';
    const hasCopilot = startingPoint === 'copilot_only' || startingPoint === 'copilot_macc';
    
    onChange({
      customerContext: {
        ...inputs.customerContext,
        startingPoint,
        hasMACC,
        hasCopilot,
      },
    });
  };

  return (
    <EstimatorSection
      title="Customer Starting Point"
      description="Select the customer's current Microsoft relationship"
      icon={<UserCheck className="h-4 w-4" />}
      infoText="This section determines the customer's existing Microsoft commitments (MACC and/or Copilot). It shapes how costs are calculated — MACC-funded usage offsets net-new cash requirements, and Copilot credits may overlap with Agent P3 consumption. Select the option that best matches the customer's current state."
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {startingPoints.map(({ id, label, description, icon: Icon }) => {
          const isSelected = inputs.customerContext.startingPoint === id;
          return (
            <button
              key={id}
              onClick={() => handleChange(id)}
              className={cn(
                "relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all text-left",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
              <Icon className={cn(
                "h-5 w-5",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <div>
                <div className={cn(
                  "font-medium text-sm",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </EstimatorSection>
  );
}
