import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SurveyAnswers,
  SurveyQuestion,
  SURVEY_QUESTIONS,
  DEFAULT_SURVEY_ANSWERS,
} from '@/types/survey';

interface SurveyWizardProps {
  onComplete: (answers: SurveyAnswers) => void;
}

export function SurveyWizard({ onComplete }: SurveyWizardProps) {
  const [answers, setAnswers] = useState<SurveyAnswers>(DEFAULT_SURVEY_ANSWERS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter questions based on branching conditions
  const activeQuestions = useMemo(() => {
    return SURVEY_QUESTIONS.filter((q) => !q.condition || q.condition(answers));
  }, [answers]);

  const question = activeQuestions[currentIndex];
  const totalQuestions = activeQuestions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isLast = currentIndex === totalQuestions - 1;

  const currentAnswer = question?.multiSelect
    ? (answers[question.id] as string[])
    : (answers[question.id] as string);

  const isAnswered = question?.multiSelect
    ? (currentAnswer as string[]).length > 0
    : (currentAnswer as string) !== '';

  const handleSelect = useCallback(
    (value: string) => {
      if (!question) return;
      if (question.multiSelect) {
        setAnswers((prev) => {
          const current = prev[question.id] as string[];
          const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
          return { ...prev, [question.id]: updated };
        });
      } else {
        setAnswers((prev) => ({ ...prev, [question.id]: value }));
      }
    },
    [question]
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(answers);
    } else {
      setCurrentIndex((i) => Math.min(i + 1, totalQuestions - 1));
    }
  }, [isLast, answers, onComplete, totalQuestions]);

  const handleBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Auto-advance for single-select after brief delay
  const handleOptionClick = useCallback(
    (value: string) => {
      handleSelect(value);
      if (!question?.multiSelect) {
        setTimeout(() => {
          if (isLast) {
            onComplete({ ...answers, [question!.id]: value });
          } else {
            setCurrentIndex((i) => Math.min(i + 1, totalQuestions - 1));
          }
        }, 300);
      }
    },
    [handleSelect, question, isLast, answers, onComplete, totalQuestions]
  );

  if (!question) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            Section {question.sectionNumber}: {question.section}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {totalQuestions}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {question.label}
        </h2>
        {question.subtitle && (
          <p className="text-muted-foreground mb-6">{question.subtitle}</p>
        )}
        {!question.subtitle && <div className="mb-6" />}

        <div className="space-y-3">
          {question.options.map((opt) => {
            const isSelected = question.multiSelect
              ? (currentAnswer as string[]).includes(opt.value)
              : currentAnswer === opt.value;

            return (
              <Card
                key={opt.value}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:border-primary/50',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border'
                )}
                onClick={() => handleOptionClick(opt.value)}
              >
                <CardContent className="flex items-center gap-3 py-4 px-5">
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {opt.label}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-2xl flex items-center justify-between mt-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {question.multiSelect && (
          <Button onClick={handleNext} disabled={!isAnswered} className="gap-2">
            {isLast ? 'Finish' : 'Next'}
            {isLast ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
