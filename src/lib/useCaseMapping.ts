import { Industry, Segment, USE_CASES, UseCase } from '@/types/useCase';

export function getFilteredUseCases(industry: Industry | null, segment: Segment | null): UseCase[] {
  return USE_CASES.filter((uc) => {
    if (industry && !uc.industries.includes(industry)) return false;
    if (segment && !uc.segments.includes(segment)) return false;
    return true;
  });
}
