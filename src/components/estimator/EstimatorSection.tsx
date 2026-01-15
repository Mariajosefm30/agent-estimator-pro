import { ReactNode } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EstimatorSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function EstimatorSection({
  title,
  description,
  icon,
  defaultOpen = true,
  children,
}: EstimatorSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group">
      <div className="bg-card rounded-lg border border-border fluent-shadow-sm overflow-hidden">
        <CollapsibleTrigger className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                {icon}
              </div>
            )}
            <div className="text-left">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <ChevronDown 
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              "group-data-[state=open]:rotate-180"
            )} 
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 pt-2 border-t border-border bg-card">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
