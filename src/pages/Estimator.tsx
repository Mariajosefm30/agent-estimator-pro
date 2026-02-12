import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ResidualOutputPanel } from '@/components/estimator/ResidualOutputPanel';
import { P3CoverageExplorer } from '@/components/estimator/P3CoverageExplorer';
import { SellerTip } from '@/components/estimator/SellerTip';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useSaveScenario } from '@/hooks/useScenarios';
import { calculateResidualOutputs } from '@/lib/calculations';
import { ResidualInputs, DEFAULT_RESIDUAL_INPUTS, PRESET_SCENARIOS } from '@/types/estimator';
import { EstimatorSection } from '@/components/estimator/EstimatorSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw, Users, Server, FileCheck, Coins, Info, Layers, Sparkles, ArrowRight, Database, Code } from 'lucide-react';
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

  const loadPreset = useCallback((presetInputs: ResidualInputs) => {
    setInputs(presetInputs);
    toast({ title: 'Scenario loaded', description: 'Inputs have been pre-populated. Switch to the Estimator tab to view results.' });
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

      <Tabs defaultValue="estimator" className="w-full">
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-6">
          <TabsTrigger value="estimator" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Estimator
          </TabsTrigger>
          <TabsTrigger value="coverage" className="gap-2">
            <Layers className="h-4 w-4" />
            P3 Coverage
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            Quick Scenarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estimator">
          <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
            {/* Left: Input Form */}
            <div className="space-y-4">
              {/* Copilot Usage */}
              <EstimatorSection
                title="Estimated Monthly Copilot Usage"
                description="How much Copilot Studio usage does the customer expect?"
                icon={<Users className="h-4 w-4" />}
                infoText="Enter the expected number of active users and their average monthly query volume for Copilot Studio agents."
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldWithTooltip label="Number of Active Users" tooltip="Estimate the number of unique users interacting with Copilot-enabled agents monthly.">
                    <Input
                      type="number"
                      value={inputs.activeUsers}
                      onChange={e => update('activeUsers', Math.max(0, Number(e.target.value) || 0))}
                      min={0}
                      placeholder="e.g. 1000"
                    />
                  </FieldWithTooltip>
                  <FieldWithTooltip label="Avg Queries per User / Month" tooltip="Estimate the average number of interactions each user has with Copilot agents monthly.">
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
                infoText="PTUs (Provisioned Throughput Units) represent dedicated model capacity in Azure AI Foundry. Input the total PTUs required monthly."
              >
                <FieldWithTooltip label="Provisioned PTUs per Month" tooltip="Input the total Provisioned Throughput Units (PTUs) required for Azure AI Foundry models monthly.">
                  <Input
                    type="number"
                    value={inputs.ptuHoursPerMonth}
                    onChange={e => update('ptuHoursPerMonth', Math.max(0, Number(e.target.value) || 0))}
                    min={0}
                    placeholder="e.g. 100"
                  />
                </FieldWithTooltip>
              </EstimatorSection>

              {/* Fabric — now active P3 input */}
              <EstimatorSection
                title="Microsoft Fabric"
                description="Fabric Capacity (F-SKUs) and OneLake — contributes to P3 ACU pool"
                icon={<Database className="h-4 w-4" />}
                infoText="As of Feb 2026, Fabric capacity is covered by P3 ACUs. Enter the customer's estimated monthly Fabric spend in USD."
              >
                <FieldWithTooltip label="Monthly Fabric Spend (USD)" tooltip="Estimated monthly Microsoft Fabric spend. This amount is included in the total AI footprint and decrements P3 ACUs at a 1:1 USD retail ratio.">
                  <Input
                    type="number"
                    value={inputs.fabricMonthlySpend}
                    onChange={e => update('fabricMonthlySpend', Math.max(0, Number(e.target.value) || 0))}
                    min={0}
                    placeholder="e.g. 2000"
                  />
                </FieldWithTooltip>
              </EstimatorSection>

              {/* GitHub — now active P3 input */}
              <EstimatorSection
                title="GitHub Copilot"
                description="GitHub Copilot seats — contributes to P3 ACU pool"
                icon={<Code className="h-4 w-4" />}
                infoText="As of Feb 2026, GitHub Copilot is covered by P3 ACUs. Enter the seat count and per-seat price."
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldWithTooltip label="GitHub Copilot Seats" tooltip="Number of GitHub Copilot licenses. Each seat's cost decrements the P3 ACU pool.">
                    <Input
                      type="number"
                      value={inputs.githubCopilotSeats}
                      onChange={e => update('githubCopilotSeats', Math.max(0, Number(e.target.value) || 0))}
                      min={0}
                      placeholder="e.g. 50"
                    />
                  </FieldWithTooltip>
                  <FieldWithTooltip label="Price per Seat / Month (USD)" tooltip="Monthly price per GitHub Copilot seat.">
                    <Input
                      type="number"
                      value={inputs.githubCopilotPricePerSeat}
                      onChange={e => update('githubCopilotPricePerSeat', Math.max(0, Number(e.target.value) || 0))}
                      min={0}
                      placeholder="e.g. 30"
                    />
                  </FieldWithTooltip>
                </div>
              </EstimatorSection>

              {/* Existing Commitments */}
              <EstimatorSection
                title="Existing Commitments"
                description="Pre-existing plans that offset AI consumption costs"
                icon={<FileCheck className="h-4 w-4" />}
                infoText="If the customer already has Copilot credits or Foundry PTU reservations, enter them here. These are applied before P3 in Microsoft's benefit hierarchy."
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <SellerTip tip="Guidance: If a customer already has PTUs or Copilot Credits, P3 only kicks in AFTER those are exhausted. Use this to show how P3 acts as the 'Safety Net' for overflow usage." />
                  <span className="text-xs text-primary font-medium">Seller Tip</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldWithTooltip label="Existing Copilot Credit Plan (CCCUs)" tooltip="Enter any existing Copilot Credit Pre-Purchase Plan units. These will be consumed before P3 ACUs for Copilot usage.">
                    <Input
                      type="number"
                      value={inputs.existingCopilotCredits}
                      onChange={e => update('existingCopilotCredits', Math.max(0, Number(e.target.value) || 0))}
                      min={0}
                      placeholder="0"
                    />
                  </FieldWithTooltip>
                  <FieldWithTooltip label="Existing Foundry PTU Reservations" tooltip="Enter any existing Microsoft Foundry PTU Reservations. These will be consumed before P3 ACUs for Foundry usage.">
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
                infoText="If the customer has an active MACC, P3 purchases can count toward burning it down. Specify what percentage of the P3 cost contributes to the MACC."
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <SellerTip tip="Tip for Sellers: P3 is a 'MACC Accelerator.' Unlike PAYG, which burns MACC as usage happens, P3 burns the full commitment amount upfront, helping customers meet their annual MACC targets instantly while securing a discount." />
                  <span className="text-xs text-primary font-medium">Seller Tip</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FieldWithTooltip label="Does the customer have an active MACC?" tooltip="Indicate if the customer has a Microsoft Azure Consumption Commitment (MACC) they wish to utilize.">
                      <div />
                    </FieldWithTooltip>
                    <Switch
                      checked={inputs.hasMACC}
                      onCheckedChange={v => update('hasMACC', v)}
                    />
                  </div>
                  {inputs.hasMACC && (
                    <FieldWithTooltip label="Desired MACC Burn % of P3 Cost" tooltip="Specify what percentage of the P3 purchase cost should contribute to the MACC commitment (0-100%).">
                      <div className="relative">
                        <Input
                          type="number"
                          value={inputs.maccBurnPct}
                          onChange={e => update('maccBurnPct', Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                          min={0}
                          max={100}
                          placeholder="100"
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                      </div>
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
              <ResidualOutputPanel outputs={outputs} hasMACC={inputs.hasMACC} maccBurnPct={inputs.maccBurnPct} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="coverage">
          <div className="max-w-2xl mx-auto">
            <P3CoverageExplorer />
          </div>
        </TabsContent>

        <TabsContent value="scenarios">
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-foreground mb-2">Quick Scenarios</h2>
              <p className="text-sm text-muted-foreground">
                Select an industry scenario to pre-populate the estimator with typical values. Use these as starting points, then customize for your specific customer.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {PRESET_SCENARIOS.map(scenario => (
                <Card key={scenario.id} className="border border-border hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{scenario.icon}</span>
                      <div>
                        <CardTitle className="text-base">{scenario.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">{scenario.industry}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {scenario.description}
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <div className="font-semibold text-foreground">{scenario.inputs.activeUsers.toLocaleString()}</div>
                        <div className="text-muted-foreground">Users</div>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <div className="font-semibold text-foreground">{scenario.inputs.ptuHoursPerMonth}</div>
                        <div className="text-muted-foreground">PTUs</div>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <div className="font-semibold text-foreground">{scenario.inputs.githubCopilotSeats}</div>
                        <div className="text-muted-foreground">GH Seats</div>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <div className="font-semibold text-foreground">{scenario.inputs.hasMACC ? 'Yes' : 'No'}</div>
                        <div className="text-muted-foreground">MACC</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-foreground leading-relaxed">
                        <span className="font-semibold text-primary">Guidance: </span>
                        {scenario.guidance}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => loadPreset(scenario.inputs)}
                    >
                      Load Scenario
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
