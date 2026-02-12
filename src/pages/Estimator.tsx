import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ResidualOutputPanel } from '@/components/estimator/ResidualOutputPanel';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useSaveScenario } from '@/hooks/useScenarios';
import { calculateResidualOutputs } from '@/lib/calculations';
import { ResidualInputs, DEFAULT_RESIDUAL_INPUTS } from '@/types/estimator';
import { EstimatorSection } from '@/components/estimator/EstimatorSection';
import { InputField } from '@/components/estimator/InputField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw, Users, Server, FileCheck, Coins, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';

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

export default function Estimator() {
  const [inputs, setInputs] = useState<ResidualInputs>(DEFAULT_RESIDUAL_INPUTS);
  const [scenarioName, setScenarioName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
  const saveScenario = useSaveScenario();
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = useCallback(<K extends keyof ResidualInputs>(key: K, value: ResidualInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_RESIDUAL_INPUTS);
    toast({ title: 'Reset complete', description: 'All inputs have been reset to defaults.' });
  }, [toast]);

  const outputs = useMemo(() => {
    if (!assumptions) return null;
    return calculateResidualOutputs(inputs, assumptions);
  }, [inputs, assumptions]);

  const handleSave = async () => {
    if (!outputs || !scenarioName.trim()) return;
    try {
      const saved = await saveScenario.mutateAsync({
        name: scenarioName.trim(),
        inputs: inputs as any,
        outputs: outputs as any,
      });
      setSaveDialogOpen(false);
      setScenarioName('');
      toast({ title: 'Scenario saved', description: `"${saved.name}" saved successfully.` });
      navigate(`/results?id=${saved.id}`);
    } catch {
      toast({ title: 'Error saving', description: 'Please try again.', variant: 'destructive' });
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
          Enter your customer's AI usage and existing commitments to see how P3 covers the residual workload
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* Left: Input Form */}
        <div className="space-y-4">
          {/* Copilot Usage */}
          <EstimatorSection
            title="Estimated Monthly Copilot Usage"
            description="How much Copilot Studio usage does the customer expect?"
            icon={<Users className="h-4 w-4" />}
            infoText="Enter the expected number of active users and their average monthly query volume for Copilot Studio."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldWithTooltip label="Number of Active Users" tooltip="Users who will actively interact with Copilot Studio agents each month.">
                <Input
                  type="number"
                  value={inputs.activeUsers}
                  onChange={e => update('activeUsers', Math.max(0, Number(e.target.value) || 0))}
                  min={0}
                  placeholder="e.g. 1000"
                />
              </FieldWithTooltip>
              <FieldWithTooltip label="Avg Queries per User / Month" tooltip="The average number of messages or queries each user sends per month.">
                <Input
                  type="number"
                  value={inputs.queriesPerUserPerMonth}
                  onChange={e => update('queriesPerUserPerMonth', Math.max(0, Number(e.target.value) || 0))}
                  min={0}
                  placeholder="e.g. 20"
                />
              </FieldWithTooltip>
            </div>
          </EstimatorSection>

          {/* Foundry Usage */}
          <EstimatorSection
            title="Estimated Monthly Foundry Usage"
            description="Azure AI Foundry provisioned throughput"
            icon={<Server className="h-4 w-4" />}
            infoText="PTUs (Provisioned Throughput Units) represent dedicated model capacity in Azure AI Foundry."
          >
            <FieldWithTooltip label="Provisioned PTUs per Month" tooltip="Number of PTU-hours provisioned per month for Azure AI Foundry models (e.g. GPT-4o).">
              <Input
                type="number"
                value={inputs.ptuHoursPerMonth}
                onChange={e => update('ptuHoursPerMonth', Math.max(0, Number(e.target.value) || 0))}
                min={0}
                placeholder="e.g. 100"
              />
            </FieldWithTooltip>
          </EstimatorSection>

          {/* Existing Commitments */}
          <EstimatorSection
            title="Existing Commitments"
            description="Pre-existing plans that offset AI consumption costs"
            icon={<FileCheck className="h-4 w-4" />}
            infoText="If the customer already has Copilot credits or Foundry PTU reservations, enter them here. These are applied before P3 in Microsoft's benefit hierarchy."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldWithTooltip label="Existing Copilot Credit Plan (CCCUs)" tooltip="Pre-purchased Copilot Credit units. Applied after PTU reservations but before P3.">
                <Input
                  type="number"
                  value={inputs.existingCopilotCredits}
                  onChange={e => update('existingCopilotCredits', Math.max(0, Number(e.target.value) || 0))}
                  min={0}
                  placeholder="0"
                />
              </FieldWithTooltip>
              <FieldWithTooltip label="Existing Foundry PTU Reservations" tooltip="Pre-existing PTU reservations. These are applied first in the benefit hierarchy.">
                <Input
                  type="number"
                  value={inputs.existingPtuReservations}
                  onChange={e => update('existingPtuReservations', Math.max(0, Number(e.target.value) || 0))}
                  min={0}
                  placeholder="0"
                />
              </FieldWithTooltip>
            </div>
          </EstimatorSection>

          {/* MACC */}
          <EstimatorSection
            title="MACC Commitment"
            description="Microsoft Azure Consumption Commitment"
            icon={<Coins className="h-4 w-4" />}
            infoText="If the customer has an active MACC, P3 purchases can count toward burning it down."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  Does the customer have an active MACC?
                </Label>
                <Switch
                  checked={inputs.hasMACC}
                  onCheckedChange={v => update('hasMACC', v)}
                />
              </div>
              {inputs.hasMACC && (
                <FieldWithTooltip label="Desired MACC Burn with AI Services (USD)" tooltip="How much of the customer's MACC commitment they want to allocate toward AI services.">
                  <Input
                    type="number"
                    value={inputs.maccBurnTarget}
                    onChange={e => update('maccBurnTarget', Math.max(0, Number(e.target.value) || 0))}
                    min={0}
                    placeholder="e.g. 50000"
                  />
                </FieldWithTooltip>
              )}
            </div>
          </EstimatorSection>

          {/* Benefit Hierarchy Notice */}
          <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Microsoft applies benefits in order:{' '}
              <strong>Foundry PTU Reservations → Copilot Credit Pre-Purchase → Agent P3 Plan</strong>
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
                  <DialogDescription>Name your scenario to save it for later comparison.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="scenario-name">Scenario name</Label>
                  <Input
                    id="scenario-name"
                    value={scenarioName}
                    onChange={e => setScenarioName(e.target.value)}
                    placeholder="e.g., Enterprise Deployment Q1"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={!scenarioName.trim() || saveScenario.isPending}>
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

        {/* Right: Output Panel */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <ResidualOutputPanel outputs={outputs} hasMACC={inputs.hasMACC} />
        </div>
      </div>
    </Layout>
  );
}
