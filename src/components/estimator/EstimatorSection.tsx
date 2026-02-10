import { ReactNode, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EstimatorSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  infoText?: string;
  children: ReactNode;
}

export function EstimatorSection({
  title,
  description,
  icon,
  defaultOpen = true,
  infoText,
  children,
}: EstimatorSectionProps) {
  const [infoOpen, setInfoOpen] = useState(false);

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
          <div className="px-5 pb-5 pt-2 border-t border-border bg-card space-y-4">
            {infoText && (
              <button
                type="button"
                onClick={() => setInfoOpen(!infoOpen)}
                className="flex items-start gap-2 w-full text-left group/info"
              >
                <div className={cn(
                  "mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  infoOpen ? "border-primary bg-primary" : "border-muted-foreground"
                )}>
                  {infoOpen && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-muted-foreground group-hover/info:text-foreground transition-colors flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" />
                    What is this section?
                  </span>
                  {infoOpen && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed bg-muted/40 rounded-md p-3 border border-border">
                      {infoText}
                    </p>
                  )}
                </div>
              </button>
            )}
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
