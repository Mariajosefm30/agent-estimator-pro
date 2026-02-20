import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Sparkles, TrendingUp, Clock, Users, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { DiscoveryState, DEFAULT_DISCOVERY_STATE, SEGMENT_CONFIG, INDUSTRY_CONFIG, USE_CASES } from '@/types/useCase';
import { calculateValueCards, mapDiscoveryToResidualInputs, formatCurrencyShort, ValueCard } from '@/lib/useCaseMapping';

function ValueCardComponent({ card }: { card: ValueCard }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{card.useCase.icon}</span>
        <div>
          <div className="font-semibold text-white">{card.useCase.label}</div>
          <div className="text-xs text-white/50 mt-0.5">{card.useCase.hook}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <div className="text-xl font-bold text-blue-300">{card.estimatedFTESaved.toFixed(1)}</div>
          <div className="text-[10px] text-white/40 mt-1">FTE equivalent</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <div className="text-xl font-bold text-green-300">{card.cycleTimeLabel}</div>
          <div className="text-[10px] text-white/40 mt-1">cycle time</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <div className="text-xl font-bold text-amber-300">{card.errorReductionLabel}</div>
          <div className="text-[10px] text-white/40 mt-1">error rate</div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <span className="text-xs text-white/40">Est. labor value recaptured / yr</span>
        <span className="text-lg font-bold text-white">{formatCurrencyShort(card.estimatedLaborValueRecaptured)}</span>
      </div>
    </div>
  );
}

export default function BusinessValue() {
  const navigate = useNavigate();
  const [discovery, setDiscovery] = useState<DiscoveryState>(DEFAULT_DISCOVERY_STATE);
  const [showAssumptions, setShowAssumptions] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('discovery');
    if (raw) {
      try {
        setDiscovery(JSON.parse(raw) as DiscoveryState);
      } catch {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const valueCards = useMemo(() => calculateValueCards(discovery), [discovery]);
  const totalAnnualValue = useMemo(() => valueCards.reduce((sum, c) => sum + c.estimatedLaborValueRecaptured, 0), [valueCards]);
  const totalFTEs = useMemo(() => valueCards.reduce((sum, c) => sum + c.estimatedFTESaved, 0), [valueCards]);
  const totalHours = useMemo(() => valueCards.reduce((sum, c) => sum + c.estimatedHoursSavedPerMonth, 0), [valueCards]);

  const handleProceed = () => {
    sessionStorage.setItem('discovery', JSON.stringify(discovery));
    sessionStorage.setItem('residual_inputs', JSON.stringify(mapDiscoveryToResidualInputs(discovery)));
    sessionStorage.setItem('value_context', JSON.stringify({ segment: discovery.segment, industry: discovery.industry, useCaseIds: discovery.selectedUseCaseIds, totalAnnualValue }));
    navigate('/estimator');
  };

  const segConfig = discovery.segment ? SEGMENT_CONFIG[discovery.segment] : null;
  const indConfig = discovery.industry ? INDUSTRY_CONFIG[discovery.industry] : null;
  const selectedUseCases = USE_CASES.filter((uc) => discovery.selectedUseCaseIds.includes(uc.id));

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
          <div className="flex gap-2">
            {segConfig && <Badge className="bg-white/10 text-white/70 border-white/20">{segConfig.icon} {segConfig.label}</Badge>}
            {indConfig && <Badge className="bg-white/10 text-white/70 border-white/20">{indConfig.icon} {indConfig.label}</Badge>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <TrendingUp className="h-5 w-5" />
            <span className="font-semibold tracking-wide">AI Business Value Opportunity</span>
          </div>
          <h1 className="text-3xl font-bold text-white">What AI could unlock for this customer</h1>
          <p className="text-sm text-white/50 max-w-xl mx-auto">
            Based on {selectedUseCases.length} AI use case{selectedUseCases.length !== 1 ? 's' : ''} for {indConfig?.label ?? 'your industry'} at {segConfig?.label ?? 'your scale'}
          </p>
        </div>

        {/* Total Value */}
        <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
            <TrendingUp className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-white/50 font-medium">Total Estimated Annual Value</p>
            <p className="text-5xl font-bold text-white mt-2">{formatCurrencyShort(totalAnnualValue)}</p>
            <p className="text-sm text-white/40 mt-1">labor value recaptured per year</p>
            <div className="mt-6 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="rounded-xl bg-white/[0.08] border border-white/10 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-white/60 text-xs mb-1">
                  <Users className="h-3 w-3" />
                  FTE Saved*
                </div>
                <div className="text-2xl font-bold text-white">{totalFTEs.toFixed(1)}</div>
                <div className="text-xs text-white/40">FTEs / month</div>
              </div>
              <div className="rounded-xl bg-white/[0.08] border border-white/10 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-white/60 text-xs mb-1">
                  <Clock className="h-3 w-3" />
                  Hours Saved
                </div>
                <div className="text-2xl font-bold text-white">{totalHours.toLocaleString()}</div>
                <div className="text-xs text-white/40">hours / month</div>
              </div>
              <div className="rounded-xl bg-white/[0.08] border border-white/10 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-white/60 text-xs mb-1">
                  <Sparkles className="h-3 w-3" />
                  Efficiency Gain
                </div>
                <div className="text-2xl font-bold text-white">+{Math.round((totalHours / 160) * 12)}%</div>
                <div className="text-xs text-white/40">capacity unlocked</div>
              </div>
            </div>
            <p className="text-[10px] text-white/30 mt-3 italic">*FTE = Full-Time Equivalent — the labor hours freed up, expressed as headcount</p>
          </div>
        </div>

        {/* Use Case Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {valueCards.map((card) => <ValueCardComponent key={card.useCase.id} card={card} />)}
        </div>

        {/* Assumptions */}
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <button onClick={() => setShowAssumptions(!showAssumptions)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Adjust Value Assumptions</span>
              <span className="text-white/40">— tune with your customer in real time</span>
            </div>
            {showAssumptions ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
          </button>
          {showAssumptions && (
            <div className="px-5 pb-5 space-y-6 border-t border-white/10 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <Label className="text-white/70">Average fully-loaded FTE cost / year</Label>
                  <span className="font-semibold text-white">{formatCurrencyShort(discovery.avgFTECost)}</span>
                </div>
                <Slider value={[discovery.avgFTECost]} onValueChange={([v]) => setDiscovery((p) => ({ ...p, avgFTECost: v }))} min={60000} max={300000} step={5000} className="w-full" />
                <div className="flex justify-between text-[10px] text-white/30">
                  <span>$60K</span><span>$300K</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <Label className="text-white/70">% of FTE time realistically recoverable</Label>
                  <span className="font-semibold text-white">{discovery.fteRecoverablePct}%</span>
                </div>
                <Slider value={[discovery.fteRecoverablePct]} onValueChange={([v]) => setDiscovery((p) => ({ ...p, fteRecoverablePct: v }))} min={20} max={90} step={5} className="w-full" />
                <div className="flex justify-between text-[10px] text-white/30">
                  <span>20% (conservative)</span><span>90% (optimistic)</span>
                </div>
              </div>
              <p className="text-xs text-white/30 italic">These are directional estimates. Actual value depends on implementation quality, change management, and customer-specific workflows.</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center space-y-2 pt-4">
          <h3 className="text-lg font-semibold text-white">Ready to model the investment?</h3>
          <p className="text-sm text-white/50 max-w-md mx-auto">
            To capture {formatCurrencyShort(totalAnnualValue)} in annual value, here's what the Azure AI infrastructure looks like...
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white/60 hover:text-white hover:bg-white/10">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Use Cases
          </Button>
          <Button onClick={handleProceed} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            Create or Adapt Your Own Scenario
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
