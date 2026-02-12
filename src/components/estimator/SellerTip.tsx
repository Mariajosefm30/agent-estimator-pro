import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Lightbulb } from 'lucide-react';

interface SellerTipProps {
  tip: string;
}

export function SellerTip({ tip }: SellerTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Lightbulb className="h-4 w-4 text-primary" />
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-sm text-xs leading-relaxed">
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}
