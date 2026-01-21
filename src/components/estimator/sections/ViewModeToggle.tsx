import { ViewMode } from '@/types/estimator';
import { cn } from '@/lib/utils';
import { Users, Briefcase } from 'lucide-react';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
      <button
        onClick={() => onChange('seller')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
          value === 'seller' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
        )}
      >
        <Briefcase className="h-4 w-4" />
        Seller Mode
      </button>
      <button
        onClick={() => onChange('customer')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
          value === 'customer' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
        )}
      >
        <Users className="h-4 w-4" />
        Customer Mode
      </button>
    </div>
  );
}
