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
const AdminAuditLogs = lazy(() => import('@/pages/admin/AuditLogs'));

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

  if (requiredRole) {
    // Support pipe-separated roles: "super_admin|platform_ops" means either role is allowed
    const allowedRoles = requiredRole.split('|');
    const hasAnyRole = allowedRoles.some((r) => hasRole(r));
    if (!hasAnyRole) {
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
  <div style={{ padding: '0 4px' }}>
    {/* 标题骨架 */}
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          width: 200,
          height: 34,
          borderRadius: radius.md,
          background: 'var(--bg-elevated, rgba(255,255,255,0.04))',
          animation: 'pulse 1.5s ease-in-out infinite',
          marginBottom: 10,
        }}
      />
      <div
        style={{
          width: 300,
          height: 18,
          borderRadius: radius.sm,
          background: 'var(--bg-elevated, rgba(255,255,255,0.04))',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    </div>
    {/* 卡片骨架 */}
    <div
      style={{
        borderRadius: radius.lg,
        background: 'var(--bg-card, rgba(255,255,255,0.03))',
        border: '0.5px solid var(--border-subtle, rgba(255,255,255,0.08))',
        padding: 24,
        minHeight: 400,
      }}
    >
      {/* 表格行骨架 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 20,
            opacity: 1 - i * 0.12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 16,
              borderRadius: 8,
              background: 'var(--bg-elevated)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              flex: 2,
              height: 16,
              borderRadius: 8,
              background: 'var(--bg-elevated)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              flex: 1,
              height: 16,
              borderRadius: 8,
              background: 'var(--bg-elevated)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: 80,
              height: 16,
              borderRadius: 8,
              background: 'var(--bg-elevated)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      ))}
    </div>
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
            <Route
              path="models"
              element={
                <ProtectedRoute requiredRole="super_admin|platform_ops|tenant_admin|tenant_developer|tenant_viewer">
                  <ModelProviders />
                </ProtectedRoute>
              }
            />
            <Route
              path="knowledge"
              element={
                <ProtectedRoute requiredRole="super_admin|platform_ops|tenant_admin|tenant_developer|tenant_viewer">
                  <KnowledgeBases />
                </ProtectedRoute>
              }
            />
            <Route
              path="agents"
              element={
                <ProtectedRoute requiredRole="super_admin|platform_ops|tenant_admin|tenant_developer|tenant_viewer">
                  <Agents />
                </ProtectedRoute>
              }
            />
            <Route
              path="conversations"
              element={
                <ProtectedRoute>
                  <Conversations />
                </ProtectedRoute>
              }
            />
            <Route
              path="prompts"
              element={
                <ProtectedRoute requiredRole="super_admin|platform_ops|tenant_admin|tenant_developer">
                  <Prompts />
                </ProtectedRoute>
              }
            />
            <Route
              path="workflows"
              element={
                <ProtectedRoute requiredRole="super_admin|platform_ops|tenant_admin|tenant_developer">
                  <Workflows />
                </ProtectedRoute>
              }
            />
            <Route
              path="evaluations"
              element={
                <ProtectedRoute requiredRole="super_admin|platform_ops|tenant_admin|tenant_developer">
                  <Evaluations />
                </ProtectedRoute>
              }
            />
            <Route
              path="costs"
              element={
                <ProtectedRoute requiredRole="super_admin|platform_ops|tenant_admin">
                  <Costs />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRole="super_admin|platform_ops|tenant_admin">
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="roles"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <Roles />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute requiredRole="super_admin|platform_ops">
                  <AdminAuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Admin routes — require platform-level roles */}
            <Route
              path="admin/tenants"
              element={
                <ProtectedRoute requiredRole="super_admin|platform_ops">
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
              <ProtectedRoute requiredRole="tenant_admin|tenant_developer|tenant_viewer">
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
