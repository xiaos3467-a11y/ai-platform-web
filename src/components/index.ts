/**
 * Shared UI components — Apple glass aesthetic
 * Extracted from per-page duplicates so every page renders from the
 * same source of truth.
 */

export { default as GlassCard } from './GlassCard';
export type { GlassCardProps } from './GlassCard';

export { default as StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

export { default as SectionCard } from './SectionCard';
export type { SectionCardProps } from './SectionCard';

export { default as StatusPill, DEFAULT_STATUS_CONFIG } from './StatusPill';
export type { StatusPillProps, StatusPillConfig } from './StatusPill';
export { HealthPill } from './StatusPill';
export type { HealthPillProps } from './StatusPill';

export { default as EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export {
  CardSkeleton,
  StatCardSkeleton,
  SectionCardSkeleton,
  TableSkeleton,
} from './Skeletons';
