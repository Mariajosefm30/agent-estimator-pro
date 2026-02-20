import { useState } from 'react';
import { Lightbulb } from 'lucide-react';

interface SellerTipProps {
  tip: string;
}

export function SellerTip({ tip }: SellerTipProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <Lightbulb className="h-4 w-4" />
        <span>{open ? 'Hide Seller Tip' : 'Seller Tip'}</span>
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground/80 leading-relaxed animate-fade-in">
          💡 {tip}
        </div>
      )}
    </div>
  );
}
