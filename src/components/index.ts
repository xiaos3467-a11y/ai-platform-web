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

export { default as ErrorState } from './ErrorState';
export type { ErrorStateProps } from './ErrorState';

export { default as PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

export { default as Breadcrumb } from './Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb';

export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { default as AnimatedNumber } from './AnimatedNumber';
export type { AnimatedNumberProps } from './AnimatedNumber';

export { default as GradientIcon } from './GradientIcon';
export type { GradientIconProps } from './GradientIcon';

export { CardSkeleton, StatCardSkeleton, SectionCardSkeleton, TableSkeleton } from './Skeletons';

/* ─── UI sub-folder components ─────────────────────────────────── */
export { default as UIButton } from './ui/Button';
export type { ButtonProps as UIButtonProps, ButtonVariant as UIButtonVariant } from './ui/Button';

export { default as UIInput } from './ui/Input';
export type { InputProps as UIInputProps } from './ui/Input';

export { default as UITag } from './ui/Tag';
export type { TagProps as UITagProps, TagColor } from './ui/Tag';

export { default as UITable } from './ui/Table';
export type { TableProps as UITableProps } from './ui/Table';

export { default as VirtualTable } from './VirtualTable';
export type { VirtualTableProps, VirtualTableColumn } from './VirtualTable';

export { default as LanguageSwitcher } from './LanguageSwitcher';

export { default as ModelSelector } from './ModelSelector';
export type { ModelSelectorProps } from './ModelSelector';
