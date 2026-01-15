import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-xl px-4">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary rounded-xl">
            <Calculator className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-bold">Agent P3 Estimator</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Estimate your Azure Consumption Units and find the right Microsoft Agent pre-purchase tier for your organization.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
