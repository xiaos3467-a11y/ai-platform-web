/** App root — routing and auth guard */

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/contexts/auth';
import AppLayout from '@/layouts/AppLayout';
import TenantLayout from '@/layouts/TenantLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Eager — needed on first render for every route
import NotFound from '@/pages/NotFound';

import { radius } from '@/styles/themeTokens';
// Lazy-loaded pages for code splitting
const LoginPage = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ModelProviders = lazy(() => import('@/pages/ModelProviders'));
const KnowledgeBases = lazy(() => import('@/pages/KnowledgeBases'));
const Agents = lazy(() => import('@/pages/Agents'));
const Conversations = lazy(() => import('@/pages/Conversations'));
const Prompts = lazy(() => import('@/pages/Prompts'));
const Workflows = lazy(() => import('@/pages/Workflows'));
const Evaluations = lazy(() => import('@/pages/Evaluations'));
const Costs = lazy(() => import('@/pages/Costs'));
const Settings = lazy(() => import('@/pages/Settings'));
const Users = lazy(() => import('@/pages/Users'));
const Roles = lazy(() => import('@/pages/Roles'));

// Admin pages
const AdminTenants = lazy(() => import('@/pages/admin/Tenants'));

// Tenant self-service pages
const TenantDashboard = lazy(() => import('@/pages/tenant/Dashboard'));
const TenantApiKeys = lazy(() => import('@/pages/tenant/ApiKeys'));
const TenantMembers = lazy(() => import('@/pages/tenant/Members'));
const TenantModels = lazy(() => import('@/pages/tenant/Models'));
const TenantUsage = lazy(() => import('@/pages/tenant/Usage'));
const TenantSettings = lazy(() => import('@/pages/tenant/Settings'));
const TenantAuditLogs = lazy(() => import('@/pages/tenant/AuditLogs'));

/**
 * Auth guard — redirects to login when unauthenticated.
 * Optionally checks roles / permissions.
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
}) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasRole = useAuthStore((s) => s.hasRole);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && !hasRole(requiredRole) && !hasRole('platform_admin')) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>无访问权限</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          您没有访问此页面所需的权限
        </div>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>无访问权限</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          缺少权限：{requiredPermission}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppSkeleton: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: radius.md,
        background: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<AppSkeleton />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* ─── Platform routes (main app layout) ────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="models" element={<ModelProviders />} />
            <Route path="knowledge" element={<KnowledgeBases />} />
            <Route path="agents" element={<Agents />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="prompts" element={<Prompts />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="evaluations" element={<Evaluations />} />
            <Route path="costs" element={<Costs />} />
            <Route path="users" element={<Users />} />
            <Route path="roles" element={<Roles />} />
            <Route path="settings" element={<Settings />} />

            {/* Admin routes — require platform_admin role */}
            <Route
              path="admin/tenants"
              element={
                <ProtectedRoute requiredRole="platform_admin">
                  <AdminTenants />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ─── Tenant self-service routes ────────────────────── */}
          <Route
            path="/tenant"
            element={
              <ProtectedRoute>
                <TenantLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TenantDashboard />} />
            <Route path="api-keys" element={<TenantApiKeys />} />
            <Route path="members" element={<TenantMembers />} />
            <Route path="models" element={<TenantModels />} />
            <Route path="usage" element={<TenantUsage />} />
            <Route path="settings" element={<TenantSettings />} />
            <Route path="audit-logs" element={<TenantAuditLogs />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
