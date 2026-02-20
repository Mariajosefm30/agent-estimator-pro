import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ResidualOutputPanel } from '@/components/estimator/ResidualOutputPanel';
import { OptimizationMatrix } from '@/components/estimator/OptimizationMatrix';
import { P3CoverageExplorer } from '@/components/estimator/P3CoverageExplorer';
import { FoundryServicesSection } from '@/components/estimator/sections/FoundryServicesSection';
import { SellerTip } from '@/components/estimator/SellerTip';
import { ValueContextBar } from '@/components/estimator/ValueContextBar';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useSaveScenario } from '@/hooks/useScenarios';
import { calculateResidualOutputs, calculateFourWayComparison } from '@/lib/calculations';
import { ResidualInputs, DEFAULT_RESIDUAL_INPUTS } from '@/types/estimator';
import { EstimatorSection } from '@/components/estimator/EstimatorSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { Download, RotateCcw, Users, Server, FileCheck, Coins, Info, Layers, Database, Code, Percent, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
  const [inputs, setInputs] = useState<ResidualInputs>(() => {
    const raw = sessionStorage.getItem('residual_inputs');
    const discoveryRaw = sessionStorage.getItem('discovery');

    let base = { ...DEFAULT_RESIDUAL_INPUTS };

    if (raw) {
      try { base = { ...base, ...JSON.parse(raw) }; } catch { /* ignore */ }
    }

    // Apply use-case-specific overrides on top of segment defaults
    if (discoveryRaw) {
      try {
        const discovery = JSON.parse(discoveryRaw);
        const useCaseOverrides: Record<string, Partial<typeof DEFAULT_RESIDUAL_INPUTS>> = {
          contact_center: {
            activeUsers: 800,
            queriesPerUserPerMonth: 100,
            ptuHoursPerMonth: 40,
            fabricMonthlySpend: 500,
            githubCopilotSeats: 20,
          },
          claims_processing: {
            activeUsers: 300,
            queriesPerUserPerMonth: 50,
            ptuHoursPerMonth: 30,
            fabricMonthlySpend: 2000,
            githubCopilotSeats: 15,
          },
          fraud_aml: {
            activeUsers: 80,
            queriesPerUserPerMonth: 60,
            ptuHoursPerMonth: 80,
            fabricMonthlySpend: 4000,
            githubCopilotSeats: 10,
          },
          predictive_maintenance: {
            activeUsers: 300,
            queriesPerUserPerMonth: 30,
            ptuHoursPerMonth: 80,
            fabricMonthlySpend: 5000,
            githubCopilotSeats: 15,
          },
          contract_lifecycle: {
            activeUsers: 150,
            queriesPerUserPerMonth: 20,
            ptuHoursPerMonth: 10,
            fabricMonthlySpend: 1500,
            githubCopilotSeats: 10,
          },
          knowledge_mgmt: {
            activeUsers: 600,
            queriesPerUserPerMonth: 20,
            ptuHoursPerMonth: 10,
            fabricMonthlySpend: 1000,
            githubCopilotSeats: 25,
          },
          order_to_cash: {
            activeUsers: 200,
            queriesPerUserPerMonth: 35,
            ptuHoursPerMonth: 20,
            fabricMonthlySpend: 1000,
            githubCopilotSeats: 10,
          },
          loan_application: {
            activeUsers: 200,
            queriesPerUserPerMonth: 40,
            ptuHoursPerMonth: 25,
            fabricMonthlySpend: 1500,
            githubCopilotSeats: 10,
          },
          supply_chain: {
            activeUsers: 300,
            queriesPerUserPerMonth: 40,
            ptuHoursPerMonth: 60,
            fabricMonthlySpend: 3000,
            githubCopilotSeats: 20,
          },
          rev_cycle: {
            activeUsers: 250,
            queriesPerUserPerMonth: 30,
            ptuHoursPerMonth: 20,
            fabricMonthlySpend: 2000,
            githubCopilotSeats: 15,
          },
          regulatory_intelligence: {
            activeUsers: 100,
            queriesPerUserPerMonth: 20,
            ptuHoursPerMonth: 15,
            fabricMonthlySpend: 2000,
            githubCopilotSeats: 10,
          },
          market_research: {
            activeUsers: 100,
            queriesPerUserPerMonth: 30,
            ptuHoursPerMonth: 20,
            fabricMonthlySpend: 2000,
            githubCopilotSeats: 10,
          },
          content_gen_ops: {
            activeUsers: 200,
            queriesPerUserPerMonth: 40,
            ptuHoursPerMonth: 15,
            fabricMonthlySpend: 500,
            githubCopilotSeats: 30,
          },
          frontline_productivity: {
            activeUsers: 1000,
            queriesPerUserPerMonth: 15,
            ptuHoursPerMonth: 10,
            fabricMonthlySpend: 500,
            githubCopilotSeats: 10,
          },
          rd_product_design: {
            activeUsers: 150,
            queriesPerUserPerMonth: 25,
            ptuHoursPerMonth: 50,
            fabricMonthlySpend: 3000,
            githubCopilotSeats: 40,
          },
          inventory_planning: {
            activeUsers: 100,
            queriesPerUserPerMonth: 20,
            ptuHoursPerMonth: 30,
            fabricMonthlySpend: 4000,
            githubCopilotSeats: 10,
          },
          agentic_commerce: {
            activeUsers: 2000,
            queriesPerUserPerMonth: 25,
            ptuHoursPerMonth: 30,
            fabricMonthlySpend: 1000,
            githubCopilotSeats: 15,
          },
          interactive_brand_agent: {
            activeUsers: 1000,
            queriesPerUserPerMonth: 30,
            ptuHoursPerMonth: 20,
            fabricMonthlySpend: 500,
            githubCopilotSeats: 10,
          },
          procurement_sourcing: {
            activeUsers: 150,
            queriesPerUserPerMonth: 25,
            ptuHoursPerMonth: 10,
            fabricMonthlySpend: 1000,
            githubCopilotSeats: 10,
          },
          field_operations: {
            activeUsers: 500,
            queriesPerUserPerMonth: 20,
            ptuHoursPerMonth: 30,
            fabricMonthlySpend: 1000,
            githubCopilotSeats: 10,
          },
          personalized_patient: {
            activeUsers: 2000,
            queriesPerUserPerMonth: 10,
            ptuHoursPerMonth: 15,
            fabricMonthlySpend: 1500,
            githubCopilotSeats: 10,
          },
          agentic_capital: {
            activeUsers: 50,
            queriesPerUserPerMonth: 30,
            ptuHoursPerMonth: 40,
            fabricMonthlySpend: 5000,
            githubCopilotSeats: 20,
          },
        };

        // Apply the first selected use case's overrides
        const firstUseCaseId = discovery.selectedUseCaseIds?.[0];
        if (firstUseCaseId && useCaseOverrides[firstUseCaseId]) {
          base = { ...base, ...useCaseOverrides[firstUseCaseId] };
        }
      } catch { /* ignore */ }
    }

    return base;
  });
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [showValueBar, setShowValueBar] = useState(() => !!sessionStorage.getItem('value_context'));

  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptions();
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

  const comparison = useMemo(() => {
    if (!assumptions || !outputs) return null;
    return calculateFourWayComparison(inputs, outputs, assumptions);
  }, [inputs, outputs, assumptions]);

  const handleExport = useCallback(() => {
    if (!outputs || !comparison) return;
    const rows = [
      ['Microsoft Agent P3 Estimator — Export'],
      [],
      ['Inputs'],
      ['Active Users', inputs.activeUsers],
      ['Queries/User/Month', inputs.queriesPerUserPerMonth],
      ['PTUs/Month', inputs.ptuHoursPerMonth],
      ['Fabric Monthly Spend (USD)', inputs.fabricMonthlySpend],
      ['GitHub Copilot Seats', inputs.githubCopilotSeats],
      ['GitHub Price/Seat', inputs.githubCopilotPricePerSeat],
      ['Existing Copilot Credits', inputs.existingCopilotCredits],
      ['Existing PTU Reservations', inputs.existingPtuReservations],
      ['ACO Discount %', inputs.acoDiscountPct],
      ['PTU Reservation Quote ($/mo)', inputs.ptuReservationQuote],
      ['Copilot Credit Plan Quote ($/mo)', inputs.copilotCreditPlanQuote],
      ['Has MACC', inputs.hasMACC ? 'Yes' : 'No'],
      ['MACC Burn %', inputs.maccBurnPct],
      [],
      ['Outputs'],
      ['Total Estimated Retail Cost (Annual)', outputs.totalEstimatedRetailCost],
      ['Residual After Commitments (Annual)', outputs.totalResidualRetailCost],
      ['Recommended P3 Tier', outputs.recommendedTier ? `Tier ${outputs.recommendedTier.tier}` : 'None'],
      ['P3 Tier Price (Annual)', outputs.p3Cost],
      ['Estimated Savings (Annual)', outputs.p3Savings],
      [],
      ['Four-Way Comparison'],
      ['Pure PAYG + ACO', comparison.purePAYG.annualCost],
      ['Specialized Silos', comparison.specializedSilos.annualCost],
      ['Unified P3', comparison.unifiedP3.annualCost],
      [],
      ['Winner', comparison.winnerKey],
      ['Guidance', comparison.winGuidance],
    ];
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'p3-estimator-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'CSV file downloaded.' });
  }, [inputs, outputs, comparison, toast]);

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
      {showValueBar && (
        <div className="mb-4">
          <ValueContextBar onDismiss={() => setShowValueBar(false)} />
        </div>
      )}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Azure AI Investment Estimator
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">
          Model the infrastructure investment to unlock your customer's AI value
        </p>
        <div className="mt-3 max-w-2xl mx-auto">
          <Collapsible open={coverageOpen} onOpenChange={setCoverageOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 mx-auto text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <Layers className="h-4 w-4" />
              What's Included in P3?
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${coverageOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <P3CoverageExplorer />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <div>
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

              {/* Foundry Usage — Expanded */}
              <FoundryServicesSection inputs={inputs} onChange={update} />

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

              {/* ACO & Comparison Quotes */}
              <EstimatorSection
                title="Azure Credit Offer & Quotes"
                description="Compare P3 against the customer's existing Azure discounts and alternative quotes"
                icon={<Percent className="h-4 w-4" />}
                infoText="Enter the customer's ACO discount and any standalone quotes for PTU Reservations or Copilot Credits to power the four-way comparison."
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <SellerTip tip="Seller Tip: Enter the customer's specific ACO discount percentage from their Enterprise Agreement or contract. This allows the tool to compare P3's value against their existing Azure discounts." />
                  <span className="text-xs text-primary font-medium">Seller Tip</span>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <FieldWithTooltip label="ACO Discount %" tooltip="The customer's Azure Credit Offer discount percentage (e.g., 12%, 15%). Applied to retail prices for the PAYG baseline comparison.">
                    <div className="relative">
                      <Input
                        type="number"
                        value={inputs.acoDiscountPct}
                        onChange={e => update('acoDiscountPct', Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                        min={0}
                        max={100}
                        placeholder="e.g. 12"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                    </div>
                  </FieldWithTooltip>
                  <FieldWithTooltip label="PTU Reservation Quote ($/mo)" tooltip="Monthly cost for dedicated Foundry PTU reservations. Used in the 'Specialized Silos' comparison path.">
                    <Input
                      type="number"
                      value={inputs.ptuReservationQuote}
                      onChange={e => update('ptuReservationQuote', Math.max(0, Number(e.target.value) || 0))}
                      min={0}
                      placeholder="e.g. 5000"
                    />
                  </FieldWithTooltip>
                  <FieldWithTooltip label="Copilot Credit Plan Quote ($/mo)" tooltip="Monthly cost for a standalone Copilot Credit plan. Used in the 'Specialized Silos' comparison path.">
                    <Input
                      type="number"
                      value={inputs.copilotCreditPlanQuote}
                      onChange={e => update('copilotCreditPlanQuote', Math.max(0, Number(e.target.value) || 0))}
                      min={0}
                      placeholder="e.g. 3000"
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
                <Button className="gap-2" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Export to CSV
                </Button>
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Right: Output Panel */}
            <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
              <ResidualOutputPanel outputs={outputs} hasMACC={inputs.hasMACC} maccBurnPct={inputs.maccBurnPct} />
              {comparison && <OptimizationMatrix comparison={comparison} />}
            </div>
          </div>
      </div>
    </Layout>
  );
}
