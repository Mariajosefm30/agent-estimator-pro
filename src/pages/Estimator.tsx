import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { TotalsPanel } from '@/components/estimator/TotalsPanel';
import { ScenarioSelectionSection } from '@/components/estimator/sections/ScenarioSelectionSection';
import { SimplifiedInputsSection } from '@/components/estimator/sections/SimplifiedInputsSection';
import { CustomerStartingPointSection } from '@/components/estimator/sections/CustomerStartingPointSection';
import { ContractContextSection } from '@/components/estimator/sections/ContractContextSection';
import { TrafficSection } from '@/components/estimator/sections/TrafficSection';
import { KnowledgeSection } from '@/components/estimator/sections/KnowledgeSection';
import { ActionsSection } from '@/components/estimator/sections/ActionsSection';
import { TriggersSection } from '@/components/estimator/sections/TriggersSection';
import { PromptToolsSection } from '@/components/estimator/sections/PromptToolsSection';
import { PtuSection } from '@/components/estimator/sections/PtuSection';
import { UsageProfileSection } from '@/components/estimator/sections/UsageProfileSection';
import { GuardrailsSection } from '@/components/estimator/sections/GuardrailsSection';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useSaveScenario } from '@/hooks/useScenarios';
import { calculateOutputs } from '@/lib/calculations';
import { EstimatorInputs, DEFAULT_INPUTS } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, RotateCcw, Info, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

export default function Estimator() {
  const [inputs, setInputs] = useState<EstimatorInputs>(() => {
    try {
      const stored = sessionStorage.getItem('survey_inputs');
      if (stored) return JSON.parse(stored) as EstimatorInputs;
    } catch { /* ignore */ }
    return DEFAULT_INPUTS;
  });
  const [scenarioName, setScenarioName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const saveScenario = useSaveScenario();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = useCallback((updates: Partial<EstimatorInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    toast({
      title: 'Reset complete',
      description: 'All inputs have been reset to default values.',
    });
  }, [toast]);

  const toggleAdvanced = useCallback(() => {
    setInputs((prev) => ({ ...prev, showAdvanced: !prev.showAdvanced }));
  }, []);

  const outputs = useMemo(() => {
    if (!assumptions) return null;
    return calculateOutputs(inputs, assumptions);
  }, [inputs, assumptions]);

  const handleSave = async () => {
    if (!outputs || !scenarioName.trim()) return;
    
    try {
      const saved = await saveScenario.mutateAsync({
        name: scenarioName.trim(),
        inputs,
        outputs,
      });
      
      setSaveDialogOpen(false);
      setScenarioName('');
      
      toast({
        title: 'Scenario saved',
        description: `"${saved.name}" has been saved successfully.`,
      });
      
      navigate(`/results?id=${saved.id}`);
    } catch {
      toast({
        title: 'Error saving scenario',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (assumptionsLoading || !outputs) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Microsoft Agent P3 Estimator
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">
          Build a compelling P3 recommendation for your customer in three simple steps
        </p>
      </div>

      {/* Phase 1: Strategic Intent */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <ScenarioSelectionSection inputs={inputs} onChange={handleInputChange} />
      </div>

      {/* Show rest only after scenario selected */}
      {inputs.strategicScenario && (
        <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
          {/* Left: Input Sections */}
          <div className="space-y-4">
            {/* Customer Starting Point (auto-set but editable) */}
            <CustomerStartingPointSection inputs={inputs} onChange={handleInputChange} />

            {(inputs.customerContext.hasMACC || inputs.customerContext.hasCopilot) && (
              <ContractContextSection inputs={inputs} onChange={handleInputChange} />
            )}

            {/* Phase 2: Simplified Inputs */}
            <SimplifiedInputsSection inputs={inputs} onChange={handleInputChange} />

            {/* Advanced Configuration Toggle */}
            <button
              onClick={toggleAdvanced}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 hover:bg-muted/30 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {inputs.showAdvanced ? 'Hide' : 'Show'} Advanced Configuration
              {inputs.showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {inputs.showAdvanced && (
              <div className="space-y-4 pl-2 border-l-2 border-primary/20">
                <UsageProfileSection inputs={inputs} onChange={handleInputChange} />
                <GuardrailsSection inputs={inputs} onChange={handleInputChange} />
                <TrafficSection inputs={inputs} onChange={handleInputChange} />
                <KnowledgeSection inputs={inputs} onChange={handleInputChange} />
                <ActionsSection inputs={inputs} onChange={handleInputChange} />
                <TriggersSection inputs={inputs} onChange={handleInputChange} />
                <PromptToolsSection inputs={inputs} onChange={handleInputChange} />
                <PtuSection inputs={inputs} onChange={handleInputChange} />
              </div>
            )}

            {/* Benefit Hierarchy Notice */}
            <Alert className="border-primary/30 bg-primary/5">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Microsoft applies benefits in order:{' '}
                <strong>Foundry PTU reservations → Copilot Credit P3 → Agent pre-purchase plan</strong>
              </AlertDescription>
            </Alert>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Scenario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Scenario</DialogTitle>
                    <DialogDescription>
                      Give your scenario a name to save it for later comparison.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="scenario-name">Scenario name</Label>
                    <Input
                      id="scenario-name"
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                      placeholder="e.g., Enterprise Deployment Q1"
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={!scenarioName.trim() || saveScenario.isPending}
                    >
                      {saveScenario.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Right: Value-First Output (Phase 3) */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <TotalsPanel 
              outputs={outputs} 
              guardrails={inputs.guardrails}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
