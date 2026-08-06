/**
 * Breadcrumb — route-aware navigation trail.
 *
 * Can be used in two ways:
 * 1. **Automatic** — pass no `items` and it reads from React Router's
 *    `useMatches()` to build the trail from each matched route's `handle`
 *    data (each route should export `handle: { crumb: 'Page Name' }`).
 * 2. **Manual** — pass an `items` array for full control.
 *
 * Integrates with the theme via CSS custom properties.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link, useMatches } from 'react-router-dom';
import { HomeOutlined, RightOutlined } from '@ant-design/icons';
import { radius } from '@/styles/themeTokens';

export interface BreadcrumbItem {
  /** Display label. */
  label: React.ReactNode;
  /** Navigation target. Omit for the current (last) item. */
  to?: string;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  /** Explicit items — overrides auto-detection from routes. */
  items?: BreadcrumbItem[];
  /** Custom renderer for each item. */
  renderItem?: (item: BreadcrumbItem, index: number) => React.ReactNode;
}

/** Shape of the `handle` field each route can declare for auto-breadcrumbs. */
export interface RouteHandle {
  crumb?: string | ((match: { params: Record<string, string> }) => React.ReactNode);
}

/**
 * Build items automatically from matched routes.
 * Looks for a `handle.crumb` string/function on each route.
 * Returns an empty array when used outside a data router.
 */
function useAutoCrumbs(): BreadcrumbItem[] {
  // useMatches requires a data router; BreadcrumbAuto is wrapped in an
  // ErrorBoundary that catches the throw when rendered outside one.
  const matches = useMatches();
  const items: BreadcrumbItem[] = [];

  for (const match of matches) {
    const handle = match.handle as RouteHandle | undefined;
    if (!handle?.crumb) continue;

    const label =
      typeof handle.crumb === 'function'
        ? handle.crumb({ params: match.params as Record<string, string> })
        : handle.crumb;

    items.push({ label, to: match.pathname });
  }

  return items;
}

const defaultRenderItem = (item: BreadcrumbItem, _index: number): React.ReactNode => {
  const content = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {item.icon}
      {item.label}
    </span>
  );

  if (item.to) {
    return (
      <Link
        to={item.to}
        style={{
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          transition: 'color 0.2s ease',
          fontSize: 13,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>{content}</span>
  );
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items: explicitItems, renderItem }) => {
  const render = renderItem ?? defaultRenderItem;

  // When explicit items are provided, skip the route-based auto-detection
  if (explicitItems) {
    return <BreadcrumbInner items={explicitItems} renderItem={render} />;
  }

  return <BreadcrumbAuto renderItem={render} />;
};

/** Error boundary — catches useMatches throw when rendered outside a data router. */
class BreadcrumbErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(_err: Error, _info: ErrorInfo) {
    /* swallow */
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/** Auto-crumb variant — reads from React Router useMatches. */
const BreadcrumbAutoInner: React.FC<{
  renderItem: (item: BreadcrumbItem, index: number) => React.ReactNode;
}> = ({ renderItem }) => {
  const items = useAutoCrumbs();
  if (items.length === 0) return null;
  return <BreadcrumbInner items={items} renderItem={renderItem} />;
};

const BreadcrumbAuto: React.FC<{
  renderItem: (item: BreadcrumbItem, index: number) => React.ReactNode;
}> = ({ renderItem }) => (
  <BreadcrumbErrorBoundary>
    <BreadcrumbAutoInner renderItem={renderItem} />
  </BreadcrumbErrorBoundary>
);

/** Core renderer — takes explicit items and renders the nav. */
const BreadcrumbInner: React.FC<{
  items: BreadcrumbItem[];
  renderItem: (item: BreadcrumbItem, index: number) => React.ReactNode;
}> = ({ items, renderItem }) => {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="面包屑导航"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: radius.sm,
        background: 'var(--bg-subtle)',
        fontSize: 13,
        marginBottom: 16,
        width: 'fit-content',
      }}
    >
      <Link
        to="/"
        aria-label="首页"
        style={{
          color: 'var(--text-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
        }}
      >
        <HomeOutlined style={{ fontSize: 14 }} />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={item.to ?? index}>
          <RightOutlined style={{ fontSize: 10, color: 'var(--text-faint)' }} />
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
