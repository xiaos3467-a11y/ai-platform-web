/**
 * Sentry initialization — loaded early in main.tsx.
 *
 * Required env vars (set in deployment, not committed):
 *   VITE_SENTRY_DSN        — Project DSN from Sentry
 *   VITE_SENTRY_ENV        — e.g. "production", "staging"
 *   VITE_SENTRY_RELEASE    — Git SHA or semver (auto-set in CI)
 *
 * Build-time env vars (CI/CD only, never exposed to browser):
 *   SENTRY_AUTH_TOKEN      — Auth token for source map upload
 *   SENTRY_ORG             — Sentry organization slug
 *   SENTRY_PROJECT         — Sentry project slug
 */

import * as Sentry from '@sentry/react';
import { browserTracingIntegration, replayIntegration } from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const SENTRY_ENV = import.meta.env.VITE_SENTRY_ENV as string | undefined;
const SENTRY_RELEASE = import.meta.env.VITE_SENTRY_RELEASE as string | undefined;

/**
 * Safely read the current tenant id from localStorage.
 * Tenant id is set by the auth flow after login and is useful for
 * grouping errors by tenant in the Sentry dashboard.
 */
function getCurrentTenantId(): string | null {
  try {
    const raw = localStorage.getItem('ai_platform_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.tenant_id ?? null;
  } catch {
    return null;
  }
}

/**
 * Initialize Sentry. Safe to call even when DSN is missing — the SDK
 * becomes a no-op, so local/dev builds don't blow up.
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    if (import.meta.env.DEV) {
      console.warn('[Sentry] No VITE_SENTRY_DSN — error reporting disabled');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENV || 'development',
    release: SENTRY_RELEASE || 'dev',

    // Performance monitoring
    integrations: [
      browserTracingIntegration(),
      replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Capture 20% of transactions for performance monitoring in prod
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,

    // Session replay — only in prod, 10% of sessions
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0,
    replaysOnErrorSampleRate: import.meta.env.PROD ? 1.0 : 0,

    // Don't send PII by default
    sendDefaultPii: false,

    // Filter out noisy errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /Loading chunk \d+ failed/,
      'Network Error',
      'Request aborted',
    ],

    // Strip sensitive headers before sending
    beforeSend(event) {
      if (event.request?.headers) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      // Attach tenant context to every event
      const tenantId = getCurrentTenantId();
      if (tenantId) {
        event.tags = { ...event.tags, tenant_id: tenantId };
      }
      return event;
    },

    // Enrich breadcrumbs with tenant context
    beforeBreadcrumb(breadcrumb) {
      const tenantId = getCurrentTenantId();
      if (tenantId) {
        breadcrumb.data = { ...breadcrumb.data, tenant_id: tenantId };
      }
      return breadcrumb;
    },
  });
}

/**
 * Capture an exception to Sentry manually (e.g. from an ErrorBoundary).
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>,
): string | undefined {
  if (!SENTRY_DSN) return undefined;
  return Sentry.captureException(error, { extra: context });
}

/**
 * Set the current user in Sentry for better error attribution.
 * Includes tenant_id when available so errors can be grouped by tenant.
 */
export function setSentryUser(user: {
  id: string;
  username?: string;
  tenant_id?: string;
} | null): void {
  if (!SENTRY_DSN) return;
  if (user) {
    Sentry.setUser({
      id: user.id,
      username: user.username,
      // Tenant id stored as extra data for filtering/grouping
      tenant_id: user.tenant_id,
    } as Sentry.User);
    // Also set as a top-level tag for easy dashboard filtering
    if (user.tenant_id) {
      Sentry.setTag('tenant_id', user.tenant_id);
    }
  } else {
    Sentry.setUser(null);
    Sentry.setTag('tenant_id', '');
  }
}

export { Sentry };

