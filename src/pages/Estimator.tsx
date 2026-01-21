import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { TotalsPanel } from '@/components/estimator/TotalsPanel';
import { TrafficSection } from '@/components/estimator/sections/TrafficSection';
import { KnowledgeSection } from '@/components/estimator/sections/KnowledgeSection';
import { ActionsSection } from '@/components/estimator/sections/ActionsSection';
import { TriggersSection } from '@/components/estimator/sections/TriggersSection';
import { PromptToolsSection } from '@/components/estimator/sections/PromptToolsSection';
import { PtuSection } from '@/components/estimator/sections/PtuSection';
import { ViewModeToggle } from '@/components/estimator/sections/ViewModeToggle';
import { CustomerStartingPointSection } from '@/components/estimator/sections/CustomerStartingPointSection';
import { ContractContextSection } from '@/components/estimator/sections/ContractContextSection';
import { UsageProfileSection } from '@/components/estimator/sections/UsageProfileSection';
import { GuardrailsSection } from '@/components/estimator/sections/GuardrailsSection';
import { ScenarioPresetsSection } from '@/components/estimator/sections/ScenarioPresetsSection';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useSaveScenario } from '@/hooks/useScenarios';
import { calculateOutputs } from '@/lib/calculations';
import { EstimatorInputs, DEFAULT_INPUTS, ViewMode } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, RotateCcw, Info } from 'lucide-react';
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
  const [inputs, setInputs] = useState<EstimatorInputs>(DEFAULT_INPUTS);
  const [scenarioName, setScenarioName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const saveScenario = useSaveScenario();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = useCallback((updates: Partial<EstimatorInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setInputs((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    toast({
      title: 'Reset complete',
      description: 'All inputs have been reset to default values.',
    });
  }, [toast]);

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

  const isSeller = inputs.viewMode === 'seller';

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Microsoft Agent Factory P3 Estimator
        </h1>
        <p className="text-muted-foreground mt-1">
          Estimate your Azure Consumption Units and Agent pre-purchase tier recommendation
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <ViewModeToggle value={inputs.viewMode} onChange={handleViewModeChange} />
        <ScenarioPresetsSection inputs={inputs} onChange={handleInputChange} />
      </div>

      <Alert className="mb-6 border-primary/30 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertDescription>
          When multiple benefits overlap, Microsoft applies in order: 
          <strong> Foundry PTU reservations → Copilot Credit P3 → Microsoft Agent pre-purchase plan</strong>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        {/* Left: Input Sections */}
        <div className="space-y-4">
          {/* New Context Sections */}
          <CustomerStartingPointSection inputs={inputs} onChange={handleInputChange} />
          
          {(inputs.customerContext.hasMACC || inputs.customerContext.hasCopilot) && (
            <ContractContextSection inputs={inputs} onChange={handleInputChange} />
          )}
          
          {isSeller && (
            <UsageProfileSection inputs={inputs} onChange={handleInputChange} />
          )}
          
          <GuardrailsSection inputs={inputs} onChange={handleInputChange} />

          {/* Original Agent Input Sections */}
          <TrafficSection inputs={inputs} onChange={handleInputChange} />
          <KnowledgeSection inputs={inputs} onChange={handleInputChange} />
          <ActionsSection inputs={inputs} onChange={handleInputChange} />
          <TriggersSection inputs={inputs} onChange={handleInputChange} />
          <PromptToolsSection inputs={inputs} onChange={handleInputChange} />
          <PtuSection inputs={inputs} onChange={handleInputChange} />
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
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

        {/* Right: Totals Panel */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <TotalsPanel 
            outputs={outputs} 
            viewMode={inputs.viewMode}
            guardrails={inputs.guardrails}
          />
        </div>
      </div>
    </Layout>
  );
}
