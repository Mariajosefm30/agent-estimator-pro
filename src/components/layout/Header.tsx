import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calculator, FileText, Settings } from 'lucide-react';

const navItems = [
  { path: '/estimator', label: 'Estimator', icon: Calculator },
  { path: '/results', label: 'Results', icon: FileText },
  { path: '/assumptions', label: 'Assumptions', icon: Settings },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Calculator className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-none">Agent P3</span>
            <span className="text-xs text-muted-foreground leading-none mt-0.5">Estimator</span>
          </div>
        </div>
        
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/estimator' && location.pathname === '/');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
