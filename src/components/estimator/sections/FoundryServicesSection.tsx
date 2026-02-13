import { useState } from 'react';
import { EstimatorSection } from '../EstimatorSection';
import { ResidualInputs } from '@/types/estimator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Server, ChevronDown, Info, Calculator, Zap, Brain, Eye, MessageSquare, Search, Globe, Shield } from 'lucide-react';

interface FoundryServicesSectionProps {
  inputs: ResidualInputs;
  onChange: <K extends keyof ResidualInputs>(key: K, value: ResidualInputs[K]) => void;
}

function FieldWithTooltip({ label, tooltip, children }: { label: string; tooltip: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>
      {children}
    </div>
  );
}

const AI_SERVICE_CATEGORIES = [
  {
    title: 'Azure AI Services',
    icon: <Brain className="h-4 w-4" />,
    services: [
      'Agent Unit', 'Content Safety', 'Content Understanding', 'Document Intelligence',
      'Search', 'AI Translator', 'BFL Flux Models', 'Cohere Models', 'Grok Models',
      'Metrics Advisor', 'OpenAI', 'OpenAI GPT5', 'OpenAI Media',
      'OpenAI OSS Models', 'OpenAI GPT4s', 'OpenAI Reasoning',
    ],
  },
  {
    title: 'Model Services',
    icon: <Eye className="h-4 w-4" />,
    services: [
      'Computer Vision', 'DeepSeek Models', 'Face', 'Foundry Model Tools',
      'Foundry Observability', 'Kimi-K2-Thinking Model', 'Language',
      'Meta Llama Models', 'Microsoft Discovery', 'Mistral Models',
      'Phi Models', 'Qwen Models', 'Speech', 'Translator Speech',
    ],
  },
];

// Rough average cost per 1M tokens for estimation (blended across models)
const AVG_COST_PER_1M_INPUT_TOKENS = 3.0;  // USD
const AVG_COST_PER_1M_OUTPUT_TOKENS = 12.0; // USD

type UsageMode = 'tpm' | 'rpm' | 'monthly_tokens';

function getRecommendation(monthlySpend: number): { plan: string; badge: 'default' | 'secondary' | 'destructive' | 'outline'; detail: string } {
  if (monthlySpend < 50000) {
    return {
      plan: 'Pay-As-You-Go (PAYG)',
      badge: 'secondary',
      detail: `At ~$${formatCompact(monthlySpend)}/mo, PAYG provides the most flexibility without commitment.`,
    };
  }
  if (monthlySpend <= 500000) {
    return {
      plan: 'PTU Reservations',
      badge: 'default',
      detail: `At ~$${formatCompact(monthlySpend)}/mo, dedicated PTU capacity offers significant savings over PAYG.`,
    };
  }
  // Over $500K — recommend Agent P3 packages
  const tiers = [
    { amount: 1000000, label: '$1M' },
    { amount: 500000, label: '$500K' },
    { amount: 200000, label: '$200K' },
  ];
  let remaining = monthlySpend;
  const packages: string[] = [];
  for (const tier of tiers) {
    while (remaining >= tier.amount) {
      packages.push(tier.label);
      remaining -= tier.amount;
    }
  }
  if (remaining > 0) {
    packages.push(`$${formatCompact(remaining)} overflow (PAYG)`);
  }
  return {
    plan: 'Agent P3 Packages',
    badge: 'destructive',
    detail: `Recommended: ${packages.join(' + ')}`,
  };
}

function formatCompact(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toFixed(0);
}

export function FoundryServicesSection({ inputs, onChange }: FoundryServicesSectionProps) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(true);

  const inputRatio = inputs.foundryInputRatio;
  const outputRatio = 100 - inputRatio;

  // Calculate monthly spend estimate
  let estimatedMonthlySpend = 0;
  if (inputs.foundryUsageMode === 'tpm') {
    // TPM → monthly tokens: tpm * 60 * 24 * 30
    const monthlyTokens = inputs.foundryTpm * 60 * 24 * 30;
    const inputTokens = monthlyTokens * (inputRatio / 100);
    const outputTokens = monthlyTokens * (outputRatio / 100);
    estimatedMonthlySpend =
      (inputTokens / 1_000_000) * AVG_COST_PER_1M_INPUT_TOKENS +
      (outputTokens / 1_000_000) * AVG_COST_PER_1M_OUTPUT_TOKENS;
  } else if (inputs.foundryUsageMode === 'rpm') {
    // RPM → estimate ~1000 tokens per request avg
    const monthlyRequests = inputs.foundryRpm * 60 * 24 * 30;
    const tokensPerRequest = 1000;
    const monthlyTokens = monthlyRequests * tokensPerRequest;
    const inputTokens = monthlyTokens * (inputRatio / 100);
    const outputTokens = monthlyTokens * (outputRatio / 100);
    estimatedMonthlySpend =
      (inputTokens / 1_000_000) * AVG_COST_PER_1M_INPUT_TOKENS +
      (outputTokens / 1_000_000) * AVG_COST_PER_1M_OUTPUT_TOKENS;
  } else {
    // Monthly tokens directly
    const inputTokens = inputs.foundryMonthlyInputTokens;
    const outputTokens = inputs.foundryMonthlyOutputTokens;
    estimatedMonthlySpend =
      (inputTokens / 1_000_000) * AVG_COST_PER_1M_INPUT_TOKENS +
      (outputTokens / 1_000_000) * AVG_COST_PER_1M_OUTPUT_TOKENS;
  }

  const recommendation = getRecommendation(estimatedMonthlySpend);

  return (
    <EstimatorSection
      title="Microsoft Foundry — Azure AI Services"
      description="All Azure AI services covered under Agent P3"
      icon={<Server className="h-4 w-4" />}
      infoText="Microsoft Foundry covers all Azure AI services — from OpenAI models to Document Intelligence, Speech, Vision, and more. All usage decrements the unified P3 ACU pool at a 1:1 USD retail value ratio."
    >
      <div className="space-y-4">
        {/* Existing PTU input */}
        <FieldWithTooltip label="Provisioned PTUs per Month" tooltip="Input the total Provisioned Throughput Units (PTUs) required for Azure AI Foundry models monthly.">
          <Input
            type="number"
            value={inputs.ptuHoursPerMonth}
            onChange={e => onChange('ptuHoursPerMonth', Math.max(0, Number(e.target.value) || 0))}
            min={0}
            placeholder="e.g. 100"
          />
        </FieldWithTooltip>

        {/* Covered Services — collapsible catalog */}
        <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors w-full">
            <Shield className="h-3.5 w-3.5" />
            View All Covered Services ({AI_SERVICE_CATEGORIES.reduce((acc, c) => acc + c.services.length, 0)})
            <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            {AI_SERVICE_CATEGORIES.map(cat => (
              <div key={cat.title}>
                <div className="flex items-center gap-2 mb-2">
                  {cat.icon}
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{cat.title}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.services.map(s => (
                    <Badge key={s} variant="outline" className="text-xs font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground italic">
              All services decrement the P3 ACU pool at a 1:1 USD retail value ratio.
            </p>
          </CollapsibleContent>
        </Collapsible>

        {/* Token-Based Calculator — collapsible */}
        <Collapsible open={calculatorOpen} onOpenChange={setCalculatorOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors w-full">
            <Calculator className="h-3.5 w-3.5" />
            Token-Based Spend Calculator
            <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform duration-200 ${calculatorOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Card className="border-border bg-muted/30">
              <CardContent className="pt-4 space-y-4">
                {/* Input / Output Ratio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Input / Output Token Ratio</Label>
                    <span className="text-sm font-medium text-primary">
                      {inputRatio}% in / {outputRatio}% out
                    </span>
                  </div>
                  <Slider
                    value={[inputRatio]}
                    onValueChange={([v]) => onChange('foundryInputRatio', v)}
                    min={10}
                    max={95}
                    step={5}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>More input tokens</span>
                    <span>More output tokens</span>
                  </div>
                </div>

                {/* Usage Mode Selector */}
                <FieldWithTooltip label="Usage Estimation Method" tooltip="Choose how you want to estimate token usage: Tokens per Minute (TPM), Requests per Minute (RPM), or total monthly tokens.">
                  <Select
                    value={inputs.foundryUsageMode}
                    onValueChange={v => onChange('foundryUsageMode', v as UsageMode)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tpm">Tokens per Minute (TPM)</SelectItem>
                      <SelectItem value="rpm">Requests per Minute (RPM)</SelectItem>
                      <SelectItem value="monthly_tokens">Total Monthly Tokens</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldWithTooltip>

                {/* Mode-specific inputs */}
                {inputs.foundryUsageMode === 'tpm' && (
                  <FieldWithTooltip label="Tokens per Minute (TPM)" tooltip="Average tokens processed per minute across all models.">
                    <Input
                      type="number"
                      value={inputs.foundryTpm}
                      onChange={e => onChange('foundryTpm', Math.max(0, Number(e.target.value) || 0))}
                      min={0}
                      placeholder="e.g. 10000"
                    />
                  </FieldWithTooltip>
                )}

                {inputs.foundryUsageMode === 'rpm' && (
                  <FieldWithTooltip label="Requests per Minute (RPM)" tooltip="Average API requests per minute. Each request is estimated at ~1000 tokens.">
                    <Input
                      type="number"
                      value={inputs.foundryRpm}
                      onChange={e => onChange('foundryRpm', Math.max(0, Number(e.target.value) || 0))}
                      min={0}
                      placeholder="e.g. 100"
                    />
                  </FieldWithTooltip>
                )}

                {inputs.foundryUsageMode === 'monthly_tokens' && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FieldWithTooltip label="Monthly Input Tokens" tooltip="Total input (prompt) tokens expected per month.">
                      <Input
                        type="number"
                        value={inputs.foundryMonthlyInputTokens}
                        onChange={e => onChange('foundryMonthlyInputTokens', Math.max(0, Number(e.target.value) || 0))}
                        min={0}
                        placeholder="e.g. 500000000"
                      />
                    </FieldWithTooltip>
                    <FieldWithTooltip label="Monthly Output Tokens" tooltip="Total output (completion) tokens expected per month.">
                      <Input
                        type="number"
                        value={inputs.foundryMonthlyOutputTokens}
                        onChange={e => onChange('foundryMonthlyOutputTokens', Math.max(0, Number(e.target.value) || 0))}
                        min={0}
                        placeholder="e.g. 100000000"
                      />
                    </FieldWithTooltip>
                  </div>
                )}

                {/* Results */}
                <div className="pt-2 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Monthly Spend</span>
                    <span className="text-lg font-bold text-foreground">
                      ${estimatedMonthlySpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Annual Spend</span>
                    <span className="text-sm font-semibold text-foreground">
                      ${(estimatedMonthlySpend * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Recommendation</span>
                      <Badge variant={recommendation.badge} className="ml-auto text-xs">
                        {recommendation.plan}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {recommendation.detail}
                    </p>
                    {estimatedMonthlySpend > 500000 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">P3 Tiers:</span>{' '}
                        $200K/mo • $500K/mo • $1M/mo
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </EstimatorSection>
  );
}
