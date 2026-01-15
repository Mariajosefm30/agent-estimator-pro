import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface InputFieldProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  type?: 'number' | 'slider';
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
}

export function InputField({
  label,
  description,
  value,
  onChange,
  type = 'number',
  min = 0,
  max = 100,
  step = 1,
  suffix,
  className,
}: InputFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {type === 'slider' && (
          <span className="text-sm font-medium text-primary">
            {value}{suffix}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {type === 'number' ? (
        <div className="relative">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            className="pr-12"
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
      ) : (
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          className="py-2"
        />
      )}
    </div>
  );
}
