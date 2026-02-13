import { useState } from 'react';
import { EstimatorSection } from '../EstimatorSection';
import { ResidualInputs } from '@/types/estimator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Server, ChevronDown, Info, Calculator, Zap, Brain, Eye, Shield, Check } from 'lucide-react';

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

// ── Model catalog with per-model pricing (USD per 1M tokens) ──
// Prices sourced from Azure Retail Prices API / public pricing pages
export interface FoundryModel {
  id: string;
  name: string;
  category: 'azure_ai' | 'model_service';
  inputPricePer1M: number;   // USD per 1M input tokens
  outputPricePer1M: number;  // USD per 1M output tokens
  description: string;
}

const FOUNDRY_MODELS: FoundryModel[] = [
  // Azure AI Services
  { id: 'openai-gpt4o', name: 'OpenAI GPT-4o', category: 'azure_ai', inputPricePer1M: 2.50, outputPricePer1M: 10.00, description: 'Latest GPT-4o multimodal model' },
  { id: 'openai-gpt4o-mini', name: 'OpenAI GPT-4o mini', category: 'azure_ai', inputPricePer1M: 0.15, outputPricePer1M: 0.60, description: 'Cost-efficient GPT-4o variant' },
  { id: 'openai-gpt5', name: 'OpenAI GPT-5', category: 'azure_ai', inputPricePer1M: 5.00, outputPricePer1M: 15.00, description: 'Next-gen reasoning model' },
  { id: 'openai-o3', name: 'OpenAI o3 (Reasoning)', category: 'azure_ai', inputPricePer1M: 10.00, outputPricePer1M: 40.00, description: 'Advanced reasoning model' },
  { id: 'openai-o4-mini', name: 'OpenAI o4-mini (Reasoning)', category: 'azure_ai', inputPricePer1M: 1.10, outputPricePer1M: 4.40, description: 'Efficient reasoning model' },
  { id: 'openai-media', name: 'OpenAI Media (DALL·E)', category: 'azure_ai', inputPricePer1M: 0, outputPricePer1M: 0, description: 'Image generation — priced per image' },
  { id: 'cohere-command-r-plus', name: 'Cohere Command R+', category: 'azure_ai', inputPricePer1M: 2.50, outputPricePer1M: 10.00, description: 'Enterprise RAG-optimized model' },
  { id: 'cohere-embed', name: 'Cohere Embed v3', category: 'azure_ai', inputPricePer1M: 0.10, outputPricePer1M: 0, description: 'Embedding model for search' },
  { id: 'grok-3', name: 'Grok 3', category: 'azure_ai', inputPricePer1M: 3.00, outputPricePer1M: 15.00, description: 'xAI Grok via Azure Foundry' },
  { id: 'bfl-flux', name: 'BFL Flux Models', category: 'azure_ai', inputPricePer1M: 0, outputPricePer1M: 0, description: 'Image generation — priced per image' },
  { id: 'content-safety', name: 'Content Safety', category: 'azure_ai', inputPricePer1M: 1.00, outputPricePer1M: 0, description: 'Content moderation API' },
  { id: 'content-understanding', name: 'Content Understanding', category: 'azure_ai', inputPricePer1M: 1.50, outputPricePer1M: 0, description: 'Multimodal content analysis' },
  { id: 'doc-intelligence', name: 'Document Intelligence', category: 'azure_ai', inputPricePer1M: 1.50, outputPricePer1M: 0, description: 'OCR and document extraction' },
  { id: 'ai-search', name: 'AI Search', category: 'azure_ai', inputPricePer1M: 0, outputPricePer1M: 0, description: 'Cognitive search — priced per unit' },
  { id: 'ai-translator', name: 'AI Translator', category: 'azure_ai', inputPricePer1M: 10.00, outputPricePer1M: 0, description: 'Text translation per 1M characters' },
  { id: 'metrics-advisor', name: 'Metrics Advisor', category: 'azure_ai', inputPricePer1M: 0.75, outputPricePer1M: 0, description: 'Anomaly detection for time series' },
  { id: 'agent-unit', name: 'Agent Unit', category: 'azure_ai', inputPricePer1M: 0, outputPricePer1M: 0, description: 'Foundry agent orchestration' },
  // Model Services
  { id: 'deepseek-r1', name: 'DeepSeek R1', category: 'model_service', inputPricePer1M: 0.55, outputPricePer1M: 2.19, description: 'Open-weight reasoning model' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', category: 'model_service', inputPricePer1M: 0.27, outputPricePer1M: 1.10, description: 'Efficient open-weight model' },
  { id: 'meta-llama-405b', name: 'Meta Llama 3.1 405B', category: 'model_service', inputPricePer1M: 5.33, outputPricePer1M: 16.00, description: 'Largest open-weight Llama model' },
  { id: 'meta-llama-70b', name: 'Meta Llama 3.1 70B', category: 'model_service', inputPricePer1M: 0.268, outputPricePer1M: 0.354, description: 'Mid-tier Llama for balanced perf' },
  { id: 'meta-llama-8b', name: 'Meta Llama 3.1 8B', category: 'model_service', inputPricePer1M: 0.03, outputPricePer1M: 0.061, description: 'Lightweight Llama for high volume' },
  { id: 'mistral-large', name: 'Mistral Large', category: 'model_service', inputPricePer1M: 2.00, outputPricePer1M: 6.00, description: 'Enterprise-grade Mistral model' },
  { id: 'mistral-small', name: 'Mistral Small', category: 'model_service', inputPricePer1M: 0.10, outputPricePer1M: 0.30, description: 'Cost-efficient Mistral model' },
  { id: 'phi-4', name: 'Phi-4', category: 'model_service', inputPricePer1M: 0.07, outputPricePer1M: 0.14, description: 'Microsoft SLM for edge/mobile' },
  { id: 'phi-4-mini', name: 'Phi-4 mini', category: 'model_service', inputPricePer1M: 0.013, outputPricePer1M: 0.05, description: 'Ultra-light Microsoft SLM' },
  { id: 'qwen-72b', name: 'Qwen 2.5 72B', category: 'model_service', inputPricePer1M: 0.27, outputPricePer1M: 0.354, description: 'Alibaba large language model' },
  { id: 'kimi-k2', name: 'Kimi-K2-Thinking', category: 'model_service', inputPricePer1M: 0.60, outputPricePer1M: 2.50, description: 'Moonshot reasoning model' },
  { id: 'computer-vision', name: 'Computer Vision', category: 'model_service', inputPricePer1M: 1.00, outputPricePer1M: 0, description: 'Image analysis & OCR' },
  { id: 'face-api', name: 'Face API', category: 'model_service', inputPricePer1M: 1.00, outputPricePer1M: 0, description: 'Face detection & recognition' },
  { id: 'speech', name: 'Speech Services', category: 'model_service', inputPricePer1M: 0, outputPricePer1M: 0, description: 'STT/TTS — priced per audio hour' },
  { id: 'translator-speech', name: 'Translator Speech', category: 'model_service', inputPricePer1M: 0, outputPricePer1M: 0, description: 'Real-time speech translation' },
  { id: 'language', name: 'Language Services', category: 'model_service', inputPricePer1M: 0.25, outputPricePer1M: 0, description: 'NER, sentiment, key phrases' },
  { id: 'foundry-tools', name: 'Foundry Model Tools', category: 'model_service', inputPricePer1M: 0, outputPricePer1M: 0, description: 'Tooling & evaluation framework' },
  { id: 'foundry-observability', name: 'Foundry Observability', category: 'model_service', inputPricePer1M: 0, outputPricePer1M: 0, description: 'Monitoring & tracing' },
  { id: 'ms-discovery', name: 'Microsoft Discovery', category: 'model_service', inputPricePer1M: 0, outputPricePer1M: 0, description: 'Content discovery & enrichment' },
];

const AZURE_AI_MODELS = FOUNDRY_MODELS.filter(m => m.category === 'azure_ai');
const MODEL_SERVICE_MODELS = FOUNDRY_MODELS.filter(m => m.category === 'model_service');

// Fallback blended prices when no models selected
const DEFAULT_INPUT_PRICE = 3.0;
const DEFAULT_OUTPUT_PRICE = 12.0;

type UsageMode = 'tpm' | 'rpm' | 'monthly_tokens';

export function getBlendedPricing(selectedIds: string[]): { inputPrice: number; outputPrice: number } {
  if (selectedIds.length === 0) {
    return { inputPrice: DEFAULT_INPUT_PRICE, outputPrice: DEFAULT_OUTPUT_PRICE };
  }
  const selected = FOUNDRY_MODELS.filter(m => selectedIds.includes(m.id));
  // Only average token-priced models (skip zero-priced services)
  const tokenModels = selected.filter(m => m.inputPricePer1M > 0 || m.outputPricePer1M > 0);
  if (tokenModels.length === 0) {
    return { inputPrice: DEFAULT_INPUT_PRICE, outputPrice: DEFAULT_OUTPUT_PRICE };
  }
  const inputPrice = tokenModels.reduce((s, m) => s + m.inputPricePer1M, 0) / tokenModels.length;
  const outputPrice = tokenModels.reduce((s, m) => s + m.outputPricePer1M, 0) / tokenModels.length;
  return { inputPrice, outputPrice };
}

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

function ModelCheckboxGrid({
  title,
  icon,
  models,
  selectedIds,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  models: FoundryModel[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</span>
        <Badge variant="outline" className="text-[10px] ml-auto">
          {models.filter(m => selectedIds.includes(m.id)).length}/{models.length} selected
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {models.map(m => {
          const isSelected = selectedIds.includes(m.id);
          const hasTokenPricing = m.inputPricePer1M > 0 || m.outputPricePer1M > 0;
          return (
            <label
              key={m.id}
              className={`flex items-start gap-2.5 p-2 rounded-md border cursor-pointer transition-colors ${
                isSelected
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border hover:border-primary/20 hover:bg-accent/30'
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggle(m.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground truncate">{m.name}</span>
                  {isSelected && <Check className="h-3 w-3 text-primary flex-shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{m.description}</p>
                {hasTokenPricing && (
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      In: <span className="font-medium text-foreground">${m.inputPricePer1M}</span>/1M
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Out: <span className="font-medium text-foreground">${m.outputPricePer1M}</span>/1M
                    </span>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function FoundryServicesSection({ inputs, onChange }: FoundryServicesSectionProps) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(true);

  const inputRatio = inputs.foundryInputRatio;
  const outputRatio = 100 - inputRatio;
  const selectedModels = inputs.selectedFoundryModels;

  const { inputPrice, outputPrice } = getBlendedPricing(selectedModels);

  const toggleModel = (id: string) => {
    const next = selectedModels.includes(id)
      ? selectedModels.filter(x => x !== id)
      : [...selectedModels, id];
    onChange('selectedFoundryModels', next);
  };

  const selectAllCategory = (category: 'azure_ai' | 'model_service') => {
    const catModels = FOUNDRY_MODELS.filter(m => m.category === category);
    const allSelected = catModels.every(m => selectedModels.includes(m.id));
    if (allSelected) {
      onChange('selectedFoundryModels', selectedModels.filter(id => !catModels.find(m => m.id === id)));
    } else {
      const newIds = new Set([...selectedModels, ...catModels.map(m => m.id)]);
      onChange('selectedFoundryModels', Array.from(newIds));
    }
  };

  // Calculate monthly spend estimate
  let estimatedMonthlySpend = 0;
  if (inputs.foundryUsageMode === 'tpm') {
    const monthlyTokens = inputs.foundryTpm * 60 * 24 * 30;
    const inputTokens = monthlyTokens * (inputRatio / 100);
    const outputTokens = monthlyTokens * (outputRatio / 100);
    estimatedMonthlySpend =
      (inputTokens / 1_000_000) * inputPrice +
      (outputTokens / 1_000_000) * outputPrice;
  } else if (inputs.foundryUsageMode === 'rpm') {
    const monthlyRequests = inputs.foundryRpm * 60 * 24 * 30;
    const tokensPerRequest = 1000;
    const monthlyTokens = monthlyRequests * tokensPerRequest;
    const inputTokens = monthlyTokens * (inputRatio / 100);
    const outputTokens = monthlyTokens * (outputRatio / 100);
    estimatedMonthlySpend =
      (inputTokens / 1_000_000) * inputPrice +
      (outputTokens / 1_000_000) * outputPrice;
  } else {
    const inputTokens = inputs.foundryMonthlyInputTokens;
    const outputTokens = inputs.foundryMonthlyOutputTokens;
    estimatedMonthlySpend =
      (inputTokens / 1_000_000) * inputPrice +
      (outputTokens / 1_000_000) * outputPrice;
  }

  const recommendation = getRecommendation(estimatedMonthlySpend);

  return (
    <EstimatorSection
      title="Microsoft Foundry — Azure AI Services"
      description="Select models & services to estimate token-based spend"
      icon={<Server className="h-4 w-4" />}
      infoText="Microsoft Foundry covers all Azure AI services — from OpenAI models to Document Intelligence, Speech, Vision, and more. All usage decrements the unified P3 ACU pool at a 1:1 USD retail value ratio."
    >
      <div className="space-y-4">
        {/* Live Estimate Summary — always visible */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Foundry Spend Estimate</span>
            </div>
            <Badge variant={recommendation.badge} className="text-xs">
              {recommendation.plan}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Monthly</span>
            <span className="text-lg font-bold text-foreground">
              ${estimatedMonthlySpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Annual</span>
            <span className="text-sm font-semibold text-muted-foreground">
              ${(estimatedMonthlySpend * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
          {estimatedMonthlySpend > 0 && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {recommendation.detail}
            </p>
          )}
        </div>

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

        {/* Model / Service Selection — collapsible */}
        <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors w-full">
            <Shield className="h-3.5 w-3.5" />
            Select Models & Services
            {selectedModels.length > 0 && (
              <Badge variant="default" className="text-[10px] ml-1">
                {selectedModels.length} selected
              </Badge>
            )}
            <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-4">
            {/* Select All toggles */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => selectAllCategory('azure_ai')}
                className="text-[11px] font-medium text-primary hover:text-primary/80 underline underline-offset-2"
              >
                Toggle All Azure AI
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={() => selectAllCategory('model_service')}
                className="text-[11px] font-medium text-primary hover:text-primary/80 underline underline-offset-2"
              >
                Toggle All Model Services
              </button>
            </div>

            <ModelCheckboxGrid
              title="Azure AI Services"
              icon={<Brain className="h-4 w-4" />}
              models={AZURE_AI_MODELS}
              selectedIds={selectedModels}
              onToggle={toggleModel}
            />
            <ModelCheckboxGrid
              title="Model Services"
              icon={<Eye className="h-4 w-4" />}
              models={MODEL_SERVICE_MODELS}
              selectedIds={selectedModels}
              onToggle={toggleModel}
            />

            {selectedModels.length > 0 && (
              <div className="p-2.5 rounded-md bg-muted/50 border border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Blended avg pricing (selected models):</span>
                  <span className="font-medium text-foreground">
                    ${inputPrice.toFixed(2)}/1M in • ${outputPrice.toFixed(2)}/1M out
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground italic">
              Prices from Azure Retail Prices API. All services decrement P3 ACU pool at 1:1 USD retail ratio.
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
                {/* Pricing source indicator */}
                {selectedModels.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    Using blended pricing from {selectedModels.length} selected model{selectedModels.length > 1 ? 's' : ''}
                  </div>
                )}

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
                    onValueChange={([v]) => {
                      onChange('foundryInputRatio', v);
                      // In monthly_tokens mode, redistribute total tokens based on new ratio
                      if (inputs.foundryUsageMode === 'monthly_tokens') {
                        const total = inputs.foundryMonthlyInputTokens + inputs.foundryMonthlyOutputTokens;
                        if (total > 0) {
                          onChange('foundryMonthlyInputTokens', Math.round(total * (v / 100)));
                          onChange('foundryMonthlyOutputTokens', Math.round(total * ((100 - v) / 100)));
                        }
                      }
                    }}
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
                  <FieldWithTooltip label="Tokens per Minute (TPM)" tooltip="Average tokens processed per minute across all selected models.">
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

                  {/* Pricing breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Input rate: <span className="font-medium text-foreground">${inputPrice.toFixed(2)}</span>/1M tokens</div>
                    <div>Output rate: <span className="font-medium text-foreground">${outputPrice.toFixed(2)}</span>/1M tokens</div>
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
