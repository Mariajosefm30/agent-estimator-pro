import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useScenarios, useScenario, useDuplicateScenario, useDeleteScenario } from '@/hooks/useScenarios';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Trash2, 
  Printer, 
  ArrowLeft,
  Calendar,
  Coins,
  Clock,
  DollarSign,
  Zap,
  TrendingDown,
  BookOpen,
  Workflow,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Results() {
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get('id');
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: scenarios, isLoading: scenariosLoading } = useScenarios();
  const { data: selectedScenario, isLoading: scenarioLoading } = useScenario(scenarioId);
  const duplicateScenario = useDuplicateScenario();
  const deleteScenario = useDeleteScenario();

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await duplicateScenario.mutateAsync(id);
      toast({
        title: 'Scenario duplicated',
        description: `Created "${duplicated.name}"`,
      });
      navigate(`/results?id=${duplicated.id}`);
    } catch {
      toast({
        title: 'Error duplicating scenario',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScenario.mutateAsync(id);
      toast({
        title: 'Scenario deleted',
      });
      if (scenarioId === id) {
        navigate('/results');
      }
    } catch {
      toast({
        title: 'Error deleting scenario',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (scenariosLoading || scenarioLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!scenarios?.length) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-foreground mb-2">No saved scenarios</h2>
          <p className="text-muted-foreground mb-6">
            Create an estimate and save it to see results here.
          </p>
          <Button onClick={() => navigate('/estimator')}>
            Go to Estimator
          </Button>
        </div>
      </Layout>
    );
  }

  const scenario = selectedScenario || scenarios[0];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/estimator')}
              className="gap-1 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{scenario.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            Saved {new Date(scenario.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDuplicate(scenario.id)}
            className="gap-2"
            disabled={duplicateScenario.isPending}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete scenario?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{scenario.name}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleDelete(scenario.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <Card className="fluent-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm">Annual Copilot Credits</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(scenario.outputs.annualCopilotCredits)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Annual PTU Hours</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(scenario.outputs.annualPtuHours)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">PAYG Cost (USD)</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(scenario.outputs.totalPaygCostUsd)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">ACUs Required</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(scenario.outputs.acusRequired)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Credits Breakdown */}
          <Card className="fluent-shadow">
            <CardHeader>
              <CardTitle>Credits Breakdown</CardTitle>
              <CardDescription>Annual Copilot credits by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium">Knowledge</span>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatNumber(scenario.outputs.creditsKnowledge)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-primary" />
                    <span className="font-medium">Actions</span>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatNumber(scenario.outputs.creditsActions)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-primary" />
                    <span className="font-medium">Flows</span>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatNumber(scenario.outputs.creditsFlows)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">Triggers</span>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatNumber(scenario.outputs.creditsTriggers)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">Prompt Tools</span>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatNumber(scenario.outputs.creditsPrompts)}
                  </span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                  <span className="font-semibold">Total Annual Credits</span>
                  <span className="font-bold text-lg tabular-nums text-primary">
                    {formatNumber(scenario.outputs.annualCopilotCredits)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tier Recommendation */}
          {scenario.outputs.recommendedTier && (
            <Card className="fluent-shadow-lg border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardTitle className="flex items-center justify-between">
                  <span>Recommended Tier</span>
                  <Badge className="bg-primary">
                    Tier {scenario.outputs.recommendedTier.tier}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ACUs included</span>
                  <span className="font-semibold">
                    {formatNumber(scenario.outputs.recommendedTier.acus)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan cost</span>
                  <span className="font-semibold">
                    {formatCurrency(scenario.outputs.recommendedTier.estimated_cost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-semibold">
                    {scenario.outputs.recommendedTier.discount_pct}%
                  </span>
                </div>
                
                {scenario.outputs.estimatedSavings > 0 && (
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 text-success mb-1">
                      <TrendingDown className="h-4 w-4" />
                      <span className="font-medium">Estimated Savings</span>
                    </div>
                    <p className="text-xl font-bold text-success">
                      {formatCurrency(scenario.outputs.estimatedSavings)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      (~{formatPercent(scenario.outputs.estimatedDiscountPct)} off PAYG)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Saved Scenarios List */}
          <Card className="fluent-shadow">
            <CardHeader>
              <CardTitle className="text-base">Saved Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/results?id=${s.id}`)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    s.id === scenario.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <p className="font-medium text-sm truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(s.outputs.totalPaygCostUsd)} PAYG
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground italic text-center">
                This estimate is directional only and does not represent a binding offer.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
