import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, ChevronRight, Sparkles, Building2, Briefcase, Brain } from 'lucide-react';
import {
  Segment, Industry, UseCase, DiscoveryState, DEFAULT_DISCOVERY_STATE,
  SEGMENT_CONFIG, INDUSTRY_CONFIG, USE_CASES, CATEGORY_LABELS, UseCaseCategory
} from '@/types/useCase';
import { getFilteredUseCases } from '@/lib/useCaseMapping';

type Step = 'segment' | 'industry' | 'usecases' | 'maturity';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'segment', label: 'Company Size', icon: <Building2 className="h-4 w-4" /> },
  { id: 'industry', label: 'Industry', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'usecases', label: 'Use Cases', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'maturity', label: 'AI Maturity', icon: <Brain className="h-4 w-4" /> },
];

const AI_MATURITY_OPTIONS: { value: DiscoveryState['aiMaturity']; label: string; subtitle: string; icon: string }[] = [
  { value: 'early', label: 'Just Starting', subtitle: 'Pilots and proofs of concept underway', icon: '🌱' },
  { value: 'scaling', label: 'Pilots Underway', subtitle: 'Multiple AI use cases moving to production', icon: '🚀' },
  { value: 'mature', label: 'Scaling AI', subtitle: 'AI is deeply integrated across workflows', icon: '⚡' },
];

export default function UseCaseDiscovery() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('segment');
  const [discovery, setDiscovery] = useState<DiscoveryState>(DEFAULT_DISCOVERY_STATE);
  const [expandedCategory, setExpandedCategory] = useState<UseCaseCategory | null>('operations');

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const filteredUseCases = useMemo(
    () => getFilteredUseCases(discovery.industry, discovery.segment),
    [discovery.industry, discovery.segment]
  );

  const groupedUseCases = useMemo(() => {
    const groups: Partial<Record<UseCaseCategory, UseCase[]>> = {};
    filteredUseCases.forEach((uc) => {
      if (!groups[uc.category]) groups[uc.category] = [];
      groups[uc.category]!.push(uc);
    });
    return groups;
  }, [filteredUseCases]);

  const toggleUseCase = useCallback((id: string) => {
    setDiscovery((prev) => {
      const has = prev.selectedUseCaseIds.includes(id);
      if (has) return { ...prev, selectedUseCaseIds: prev.selectedUseCaseIds.filter((i) => i !== id) };
      if (prev.selectedUseCaseIds.length >= 3) return prev;
      return { ...prev, selectedUseCaseIds: [...prev.selectedUseCaseIds, id] };
    });
  }, []);

  const handleContinue = useCallback(() => {
    const order: Step[] = ['segment', 'industry', 'usecases', 'maturity'];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) {
      setStep(order[idx + 1]);
    } else {
      sessionStorage.setItem('discovery', JSON.stringify(discovery));
      navigate('/value');
    }
  }, [step, discovery, navigate]);

  const handleBack = useCallback(() => {
    const order: Step[] = ['segment', 'industry', 'usecases', 'maturity'];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }, [step]);

  const canContinue =
    (step === 'segment' && discovery.segment !== null) ||
    (step === 'industry' && discovery.industry !== null) ||
    (step === 'usecases' && discovery.selectedUseCaseIds.length > 0) ||
    (step === 'maturity' && discovery.aiMaturity !== null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1729] via-[#111d35] to-[#0a1020] text-white">

      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white/90">Azure AI</p>
              <p className="text-xs text-white/50">Business Value Estimator</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate('/estimator')} className="text-white/60 hover:text-white hover:bg-white/10">
            Skip to estimator
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => {
            const isActive = s.id === step;
            const isDone = i < currentStepIndex;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  isActive ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40' :
                  isDone ? 'bg-green-500/20 text-green-400 border border-green-400/30' :
                  'bg-white/5 text-white/30 border border-white/10'
                )}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : s.icon}
                  {s.label}
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-white/20" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-6">

        {step === 'segment' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">What size is your customer?</h2>
              <p className="text-sm text-white/50">This helps us calibrate realistic starting assumptions</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {(Object.keys(SEGMENT_CONFIG) as Segment[]).map((seg) => {
                const cfg = SEGMENT_CONFIG[seg];
                const isSelected = discovery.segment === seg;
                return (
                  <button key={seg}
                    onClick={() => { setDiscovery((p) => ({ ...p, segment: seg })); setTimeout(() => setStep('industry'), 300); }}
                    className={cn('relative rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:scale-[1.02]',
                      isSelected ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/20' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10')}>
                    {isSelected && <div className="absolute top-3 right-3"><Check className="h-5 w-5 text-blue-400" /></div>}
                    <div className="text-3xl mb-3">{cfg.icon}</div>
                    <div className="text-lg font-bold text-white">{cfg.label}</div>
                    <div className="text-sm text-white/50 mt-1">{cfg.subtitle}</div>
                    <div className="mt-4 flex gap-3 text-xs text-white/40">
                      <span>~{cfg.defaultUsers.toLocaleString()} users</span>
                      <span>{cfg.hasMACC ? 'MACC eligible' : 'No MACC'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'industry' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">What industry are they in?</h2>
              <p className="text-sm text-white/50">We'll show the most relevant AI use cases for their sector</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(Object.keys(INDUSTRY_CONFIG) as Industry[]).map((ind) => {
                const cfg = INDUSTRY_CONFIG[ind];
                const isSelected = discovery.industry === ind;
                return (
                  <button key={ind}
                    onClick={() => { setDiscovery((p) => ({ ...p, industry: ind })); setTimeout(() => setStep('usecases'), 300); }}
                    className={cn('flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 hover:scale-[1.01]',
                      isSelected ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/20' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10')}>
                    <span className="text-xl">{cfg.icon}</span>
                    <span className="font-medium text-white/90">{cfg.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-blue-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'usecases' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Which AI use cases resonate?</h2>
              <p className="text-sm text-white/50">Pick up to 3 that match what the customer is prioritizing</p>
              {discovery.selectedUseCaseIds.length > 0 && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                  {discovery.selectedUseCaseIds.length} / 3 selected
                </Badge>
              )}
            </div>
            <div className="space-y-3">
              {(Object.keys(groupedUseCases) as UseCaseCategory[]).map((category) => {
                const cases = groupedUseCases[category]!;
                const isExpanded = expandedCategory === category;
                const selectedInCategory = cases.filter((uc) => discovery.selectedUseCaseIds.includes(uc.id)).length;
                return (
                  <div key={category} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                    <button onClick={() => setExpandedCategory(isExpanded ? null : category)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white/90">{CATEGORY_LABELS[category]}</span>
                        <span className="text-xs text-white/40">{cases.length} use cases</span>
                        {selectedInCategory > 0 && <Badge className="bg-blue-500/20 text-blue-300 text-xs border-blue-400/30">{selectedInCategory} selected</Badge>}
                      </div>
                      <ChevronRight className={cn('h-4 w-4 text-white/30 transition-transform', isExpanded && 'rotate-90')} />
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-4 space-y-2">
                        {cases.map((uc) => {
                          const isSelected = discovery.selectedUseCaseIds.includes(uc.id);
                          const isDisabled = !isSelected && discovery.selectedUseCaseIds.length >= 3;
                          return (
                            <button key={uc.id}
                              onClick={() => !isDisabled && toggleUseCase(uc.id)}
                              className={cn('flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-150 w-full',
                                isSelected ? 'border-blue-400/60 bg-blue-500/15' :
                                isDisabled ? 'border-white/5 opacity-40 cursor-not-allowed' :
                                'border-white/10 hover:border-white/25 hover:bg-white/[0.08]')}>
                              <span className="text-lg">{uc.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white/90">{uc.shortLabel}</div>
                                <div className="text-xs text-white/40 mt-0.5">{uc.hook}</div>
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 'maturity' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Where are they on their AI journey?</h2>
              <p className="text-sm text-white/50">This calibrates adoption pace and usage assumptions</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {AI_MATURITY_OPTIONS.map((opt) => {
                const isSelected = discovery.aiMaturity === opt.value;
                return (
                  <button key={opt.value}
                    onClick={() => setDiscovery((p) => ({ ...p, aiMaturity: opt.value }))}
                    className={cn('flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200 hover:scale-[1.01]',
                      isSelected ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/20' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10')}>
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <div className="font-bold text-white">{opt.label}</div>
                      <div className="text-xs text-white/50 mt-0.5">{opt.subtitle}</div>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-blue-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <Button variant="ghost" onClick={handleBack} disabled={step === 'segment'} className="text-white/50 hover:text-white hover:bg-white/10">
            ← Back
          </Button>
          <Button onClick={handleContinue} disabled={!canContinue} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            {step === 'maturity' ? 'See Business Value' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
