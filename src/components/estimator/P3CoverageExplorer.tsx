import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Brain, Bot, Database, Code } from 'lucide-react';

const COVERAGE_CATEGORIES = [
  {
    id: 'foundry',
    name: 'Microsoft Foundry',
    icon: <Brain className="h-4 w-4" />,
    services: [
      'Azure OpenAI (GPT-5, Reasoning, OSS)',
      'DeepSeek',
      'Llama',
      'Mistral',
      'AI Search',
      'Document Intelligence',
      'Speech',
    ],
  },
  {
    id: 'copilot-studio',
    name: 'Copilot Studio',
    icon: <Bot className="h-4 w-4" />,
    services: [
      'M365 Copilot Chat',
      'Dynamics 365 Agents',
      'Copilot Studio Agentic Services',
    ],
  },
  {
    id: 'fabric',
    name: 'Microsoft Fabric',
    icon: <Database className="h-4 w-4" />,
    services: [
      'All Fabric Capacity (F-SKUs)',
      'OneLake Compute',
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: <Code className="h-4 w-4" />,
    services: ['GitHub Copilot'],
  },
];

export function P3CoverageExplorer() {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">What's Included in P3?</CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs text-xs">
              Usage of these services automatically decrements your ACU pool at a 1:1 USD retail value ratio.
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Feb 2026 covered services — all decrement your unified ACU pool.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" className="w-full">
          {COVERAGE_CATEGORIES.map(cat => (
            <AccordionItem key={cat.id} value={cat.id} className="border-border">
              <AccordionTrigger className="py-3 text-sm hover:no-underline">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    {cat.icon}
                  </div>
                  <span className="font-medium">{cat.name}</span>
                  <Badge variant="secondary" className="text-[10px] ml-1">
                    {cat.services.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1.5 pl-9">
                  {cat.services.map(s => (
                    <li key={s} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
