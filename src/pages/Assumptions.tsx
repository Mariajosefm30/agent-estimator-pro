import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAssumptions, useUpdateAssumptions } from '@/hooks/useAssumptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, RefreshCw, DollarSign, Coins, Cpu, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Assumptions as AssumptionsType, AgentP3Tier } from '@/types/estimator';
import { supabase } from '@/integrations/supabase/client';

export default function Assumptions() {
  const { data: assumptions, isLoading, refetch } = useAssumptions();
  const updateAssumptions = useUpdateAssumptions();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<AssumptionsType>>({});
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);

  useEffect(() => {
    if (assumptions) {
      setFormData(assumptions);
    }
  }, [assumptions]);

  const handleChange = (field: keyof AssumptionsType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTierChange = (tierIndex: number, field: keyof AgentP3Tier, value: number) => {
    const tiers = [...(formData.agent_p3_tiers || [])];
    tiers[tierIndex] = { ...tiers[tierIndex], [field]: value };
    setFormData((prev) => ({ ...prev, agent_p3_tiers: tiers }));
  };

  const handleSave = async () => {
    try {
      await updateAssumptions.mutateAsync(formData);
      toast({
        title: 'Assumptions saved',
        description: 'Your configuration has been updated.',
      });
    } catch {
      toast({
        title: 'Error saving assumptions',
        variant: 'destructive',
      });
    }
  };

  const handleFetchPrices = async () => {
    setIsFetchingPrices(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-azure-prices');
      
      if (error) throw error;
      
      if (data?.ptuPrice) {
        setFormData((prev) => ({ ...prev, ptu_usd_per_hour: data.ptuPrice }));
        toast({
          title: 'Prices updated',
          description: `PTU rate updated to $${data.ptuPrice}/hour`,
        });
      } else {
        toast({
          title: 'Price fetch completed',
          description: 'Prices have been cached. Check retail_prices_cache for details.',
        });
      }
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error fetching prices',
        description: 'Could not fetch Azure retail prices. Using manual values.',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingPrices(false);
    }
  };

  if (isLoading) {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Assumptions</h1>
        <p className="text-muted-foreground mt-1">
          Configure pricing rates, credit costs, and tier definitions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pricing Rates */}
        <Card className="fluent-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Pricing Rates
            </CardTitle>
            <CardDescription>
              Base PAYG rates for cost calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="copilot-credit-usd">Copilot credit rate (USD)</Label>
              <Input
                id="copilot-credit-usd"
                type="number"
                step="0.001"
                min="0"
                value={formData.copilot_credit_usd || 0}
                onChange={(e) => handleChange('copilot_credit_usd', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Microsoft example uses $0.01 per credit
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ptu-rate">PTU hourly rate (USD)</Label>
              <Input
                id="ptu-rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.ptu_usd_per_hour || 0}
                onChange={(e) => handleChange('ptu_usd_per_hour', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Microsoft example uses $1.00 for illustration
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="use-api">Use Azure Retail Prices API</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fetch real-time pricing from Azure
                </p>
              </div>
              <Switch
                id="use-api"
                checked={formData.use_api_pricing || false}
                onCheckedChange={(checked) => handleChange('use_api_pricing', checked)}
              />
            </div>

            {formData.use_api_pricing && (
              <Button 
                variant="outline" 
                onClick={handleFetchPrices}
                disabled={isFetchingPrices}
                className="w-full gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isFetchingPrices ? 'animate-spin' : ''}`} />
                {isFetchingPrices ? 'Fetching...' : 'Fetch Latest Prices'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Credits */}
        <Card className="fluent-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Knowledge Credits
            </CardTitle>
            <CardDescription>
              Credits consumed for knowledge grounding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant graph grounding</Label>
              <Input
                type="number"
                min="0"
                value={formData.tenant_graph_grounding_credits || 0}
                onChange={(e) => handleChange('tenant_graph_grounding_credits', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Generative answer credits</Label>
              <Input
                type="number"
                min="0"
                value={formData.generative_answer_credits || 0}
                onChange={(e) => handleChange('generative_answer_credits', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Non-tenant grounding</Label>
              <Input
                type="number"
                min="0"
                value={formData.non_tenant_grounding_credits || 0}
                onChange={(e) => handleChange('non_tenant_grounding_credits', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prompt Tools */}
        <Card className="fluent-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Prompt Tool Credits
            </CardTitle>
            <CardDescription>
              Credits per 10 responses by model tier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Basic (per 10 responses)</Label>
              <Input
                type="number"
                min="0"
                value={formData.prompt_basic_per_10 || 0}
                onChange={(e) => handleChange('prompt_basic_per_10', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Standard (per 10 responses)</Label>
              <Input
                type="number"
                min="0"
                value={formData.prompt_standard_per_10 || 0}
                onChange={(e) => handleChange('prompt_standard_per_10', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Premium (per 10 responses)</Label>
              <Input
                type="number"
                min="0"
                value={formData.prompt_premium_per_10 || 0}
                onChange={(e) => handleChange('prompt_premium_per_10', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions & Triggers */}
        <Card className="fluent-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Actions & Triggers
            </CardTitle>
            <CardDescription>
              Credits for actions, flows, and triggers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Average actions per query</Label>
              <Input
                type="number"
                min="0"
                value={formData.avg_actions_per_query || 0}
                onChange={(e) => handleChange('avg_actions_per_query', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Credits per action</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.credits_per_action || 0}
                onChange={(e) => handleChange('credits_per_action', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Credits per flow run</Label>
              <Input
                type="number"
                min="0"
                value={formData.credits_per_flow_run || 0}
                onChange={(e) => handleChange('credits_per_flow_run', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Credits per trigger run</Label>
              <Input
                type="number"
                min="0"
                value={formData.credits_per_trigger_run || 0}
                onChange={(e) => handleChange('credits_per_trigger_run', parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Agent P3 Tiers */}
        <Card className="fluent-shadow lg:col-span-2">
          <CardHeader>
            <CardTitle>Agent P3 Tiers</CardTitle>
            <CardDescription>
              Pre-purchase tier definitions with ACU allocations and discounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {formData.agent_p3_tiers?.map((tier, index) => (
                <div key={tier.tier} className="p-4 rounded-lg border border-border bg-muted/30">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      {tier.tier}
                    </span>
                    Tier {tier.tier}
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">ACUs</Label>
                      <Input
                        type="number"
                        min="0"
                        value={tier.acus}
                        onChange={(e) => handleTierChange(index, 'acus', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Estimated Cost (USD)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={tier.estimated_cost}
                        onChange={(e) => handleTierChange(index, 'estimated_cost', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Discount %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={tier.discount_pct}
                        onChange={(e) => handleTierChange(index, 'discount_pct', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={updateAssumptions.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {updateAssumptions.isPending ? 'Saving...' : 'Save Assumptions'}
        </Button>
      </div>
    </Layout>
  );
}
