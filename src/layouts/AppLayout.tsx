/**
 * Main layout — Apple aesthetic, theme-aware
 * — Frosted glass sidebar, gradient accent, smooth collapse animation
 */

import React, { useState, useMemo, startTransition } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, message } from 'antd';
import {
  DashboardOutlined,
  RobotOutlined,
  BookOutlined,
  ApiOutlined,
  MessageOutlined,
  EditOutlined,
  BranchesOutlined,
  DollarOutlined,
  ExperimentOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  SwapOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/contexts/auth';
import { useTheme } from '@/contexts/theme';
import { api } from '@/api/client';
import ThemeToggle from '@/components/ThemeToggle';

import { radius } from '@/styles/themeTokens';
const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Role code → Chinese display label
const ROLE_LABELS: Record<string, string> = {
  super_admin: '超级管理员',
  platform_ops: '平台运营员',
  tenant_admin: '租户管理员',
  tenant_developer: '租户开发者',
  tenant_viewer: '租户观察者',
  // Legacy names pass through as-is (no mapping needed — they're already Chinese)
};

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { logout, user, hasRole, switchRole } = useAuthStore((s) => ({
    logout: s.logout,
    user: s.user,
    hasRole: s.hasRole,
    switchRole: s.switchRole,
  }));
  const { isDark } = useTheme();

  const displayName = user?.username || '管理员';
  const displayInitial = displayName.charAt(0).toUpperCase();

  // Helpers for role checks
  // Legacy role names (before init_rbac.sql migration): 超级管理员, 管理员, 开发者, 观察者
  // New role codes: super_admin, platform_ops, tenant_admin, tenant_developer, tenant_viewer
  // Both sets are checked for backward compatibility during migration.
  const hasSuperAdmin = hasRole('super_admin') || hasRole('超级管理员');
  const hasPlatformOps = hasRole('platform_ops') || hasRole('管理员');
  const isTenant =
    hasRole('tenant_admin') || hasRole('tenant_developer') || hasRole('tenant_viewer');
  const canManageAI =
    hasSuperAdmin ||
    hasPlatformOps ||
    hasRole('tenant_admin') ||
    hasRole('tenant_developer') ||
    hasRole('开发者');
  const canManagePlatform = hasSuperAdmin || hasPlatformOps;

  // Active role + all role codes for the role switcher
  const activeRole = user?.active_role || user?.role;
  const allRoles = (
    user?.roles && user.roles.length > 0 ? user.roles : user?.role ? [user.role] : []
  ).filter(Boolean);
  const activeRoleLabel = ROLE_LABELS[activeRole || ''] || activeRole || '';

  const handleSwitchRole = async (roleCode: string) => {
    if (roleCode === activeRole) return;
    try {
      const resp = await api.post<{ active_role: string; permissions: string[] }>(
        '/auth/switch-role',
        { role_code: roleCode },
      );
      const { active_role, permissions } = resp.data;

      // Update auth store + localStorage
      switchRole(active_role, permissions);

      message.success(`已切换到 ${ROLE_LABELS[active_role] || active_role}`);

      // Refresh the page so the menu re-renders under the new role context
      window.location.reload();
    } catch {
      // The global error handler already displayed a toast; nothing else to do.
    }
  };

  // Map route path → queryKey(s) for prefetch on hover
  const ROUTE_QUERY_KEYS: Record<string, string[][]> = useMemo(
    () => ({
      '/models': [['models', 'providers']],
      '/knowledge': [['knowledge-groups'], ['knowledge-bases']],
      '/agents': [['agents']],
      '/conversations': [['conversations']],
      '/prompts': [['prompts']],
      '/workflows': [['workflows']],
      '/evaluations': [['evaluations']],
      '/costs': [['costs', 'summary']],
      '/users': [['users']],
      '/roles': [['roles']],
      '/audit-logs': [['audit-logs']],
      '/settings': [['settings']],
    }),
    [],
  );

  const prefetchRoute = (path: string) => {
    const keys = ROUTE_QUERY_KEYS[path];
    if (!keys) return;
    keys.forEach((key) => {
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: async ({ signal }) => {
          const resp = await api.get(`/${key.join('/')}/`, undefined, signal);
          return resp.data;
        },
        staleTime: 30_000,
      });
    });
  };

  // Dynamic menu based on user roles — matches RBAC matrix
  // Wrap leaf item labels in a span with onMouseEnter to prefetch route data
  const wrapPrefetch = (key: string, label: React.ReactNode): React.ReactNode => (
    <span onMouseEnter={() => prefetchRoute(key)}>{label}</span>
  );

  const menuItems = useMemo(() => {
    const items: Array<{
      key: string;
      icon?: React.ReactNode;
      label: React.ReactNode;
      children?: Array<{ key: string; icon?: React.ReactNode; label: React.ReactNode }>;
    }> = [{ key: '/', icon: <DashboardOutlined />, label: wrapPrefetch('/', '仪表盘') }];

    // AI 能力 — visible to all authenticated users (at least read access)
    const aiChildren: Array<{ key: string; icon?: React.ReactNode; label: React.ReactNode }> = [
      { key: '/models', icon: <ApiOutlined />, label: wrapPrefetch('/models', '模型管理') },
      { key: '/knowledge', icon: <BookOutlined />, label: wrapPrefetch('/knowledge', '知识库') },
      { key: '/agents', icon: <RobotOutlined />, label: wrapPrefetch('/agents', 'Agent 管理') },
      {
        key: '/conversations',
        icon: <MessageOutlined />,
        label: wrapPrefetch('/conversations', '对话记录'),
      },
    ];
    items.push({ key: 'ai', icon: <RobotOutlined />, label: 'AI 能力', children: aiChildren });

    // 平台管理 — only for users with AI management permissions
    if (canManageAI) {
      const platformChildren: Array<{
        key: string;
        icon?: React.ReactNode;
        label: React.ReactNode;
      }> = [];
      // Prompt/Workflow/Evaluation: super_admin, platform_ops, tenant_admin, tenant_developer
      if (
        hasSuperAdmin ||
        hasPlatformOps ||
        hasRole('tenant_admin') ||
        hasRole('tenant_developer') ||
        hasRole('开发者')
      ) {
        platformChildren.push(
          { key: '/prompts', icon: <EditOutlined />, label: wrapPrefetch('/prompts', 'Prompt 管理') },
          {
            key: '/workflows',
            icon: <BranchesOutlined />,
            label: wrapPrefetch('/workflows', '工作流'),
          },
          {
            key: '/evaluations',
            icon: <ExperimentOutlined />,
            label: wrapPrefetch('/evaluations', '评测中心'),
          },
        );
      }
      // Costs: super_admin, platform_ops, tenant_admin
      if (hasSuperAdmin || hasPlatformOps || hasRole('tenant_admin')) {
        platformChildren.push({
          key: '/costs',
          icon: <DollarOutlined />,
          label: wrapPrefetch('/costs', '成本分析'),
        });
      }
      if (platformChildren.length > 0) {
        items.push({
          key: 'platform',
          icon: <BranchesOutlined />,
          label: '平台管理',
          children: platformChildren,
        });
      }
    }

    // 租户控制台 — tenant members only
    if (isTenant) {
      items.push({
        key: '/tenant',
        icon: <AppstoreOutlined />,
        label: wrapPrefetch('/tenant', '租户控制台'),
      });
    }

    // 系统管理 — platform-level or tenant_admin
    const adminChildren: Array<{
      key: string;
      icon?: React.ReactNode;
      label: React.ReactNode;
    }> = [];

    // 租户管理: super_admin, platform_ops
    if (canManagePlatform) {
      adminChildren.push({
        key: '/admin/tenants',
        icon: <TeamOutlined />,
        label: wrapPrefetch('/admin/tenants', '租户管理'),
      });
    }
    // 用户管理: super_admin, platform_ops, tenant_admin
    if (hasSuperAdmin || hasPlatformOps || hasRole('tenant_admin')) {
      adminChildren.push({
        key: '/users',
        icon: <TeamOutlined />,
        label: wrapPrefetch('/users', '用户管理'),
      });
    }
    // 角色权限: super_admin only
    if (hasSuperAdmin) {
      adminChildren.push({
        key: '/roles',
        icon: <SafetyOutlined />,
        label: wrapPrefetch('/roles', '角色权限'),
      });
    }
    // 审计日志: super_admin, platform_ops
    if (canManagePlatform) {
      adminChildren.push({
        key: '/audit-logs',
        icon: <SettingOutlined />,
        label: wrapPrefetch('/audit-logs', '审计日志'),
      });
    }
    // 系统设置: super_admin only
    if (hasSuperAdmin) {
      adminChildren.push({
        key: '/settings',
        icon: <SettingOutlined />,
        label: wrapPrefetch('/settings', '系统设置'),
      });
    }

    if (adminChildren.length > 0) {
      items.push({
        key: 'admin',
        icon: <TeamOutlined />,
        label: '系统管理',
        children: adminChildren,
      });
    }

    return items;
  }, [hasRole, hasSuperAdmin, hasPlatformOps, isTenant, canManageAI, canManagePlatform]);

  // ─── Theme-aware palette ────────────────────────────────────────
  // Uses CSS custom properties so sidebar/header follow the active theme
  // without needing inline ternaries. Kept for values that still require
  // JS (transitions, computed values).
  const palette = {
    canvas: 'var(--bg-body)',
    siderBg: isDark ? 'rgba(22, 22, 24, 0.82)' : 'rgba(255, 255, 255, 0.78)',
    headerBg: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(255, 255, 255, 0.72)',
    border: 'var(--border-subtle)',
    borderSubtle: 'var(--border-divider)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-faint)',
    textSoft: 'var(--text-secondary)',
    hoverBg: 'var(--bg-elevated)',
    userNameColor: 'var(--text-label)',
    hoverBright: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)',
  };

  const userMenu = {
    items: [
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '个人设置',
        onClick: () => navigate('/settings'),
      },
      // Role switcher — only when the user holds more than one role
      ...(allRoles.length > 1
        ? [
            { type: 'divider' as const },
            {
              key: 'switch-role',
              icon: <SwapOutlined />,
              label: '切换角色',
              children: allRoles.map((role: string) => ({
                key: role,
                label: (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {ROLE_LABELS[role] || role}
                    {role === activeRole && (
                      <CheckOutlined style={{ marginLeft: 8, color: '#0a84ff', fontSize: 11 }} />
                    )}
                  </span>
                ),
                onClick: () => handleSwitchRole(role),
              })),
            },
          ]
        : []),
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
        onClick: () => {
          logout();
          navigate('/login', { replace: true });
        },
      },
    ],
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: palette.canvas,
        transition: 'background 0.35s ease',
      }}
    >
      {/* ─── Sidebar ──────────────────────────────────────────────── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        collapsedWidth={72}
        style={{
          background: palette.siderBg,
          WebkitBackdropFilter: 'saturate(180%) blur(24px)',
          borderRight: `0.5px solid var(--border-subtle)`,
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 20,
          transition:
            'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease, border-color 0.35s ease',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 20px' : '0 24px',
            gap: 12,
            borderBottom: `0.5px solid var(--border-divider)`,
            transition: 'padding 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s ease',
          }}
        >
          {/* Logo mark — gradient with subtle glow */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: radius.md,
              background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 50%, #bf5af2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: '0 2px 12px rgba(10, 132, 255, 0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            AI
          </div>
          {!collapsed && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: palette.textPrimary,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s ease',
                }}
              >
                AI 中台
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: palette.textSecondary,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase' as const,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s ease',
                }}
              >
                Enterprise
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: '12px 0' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['ai', 'platform', 'admin']}
            items={menuItems}
            onClick={({ key }) => {
              if (key.startsWith('/')) {
                startTransition(() => {
                  navigate(key);
                });
              }
            }}
            style={{
              borderRight: 'none',
              background: 'transparent',
              fontWeight: 500,
            }}
          />
        </div>

        {/* Version tag at bottom */}
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 0,
              right: 0,
              textAlign: 'center',
              padding: '0 24px',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: palette.textMuted,
                fontWeight: 500,
                letterSpacing: '0.02em',
                transition: 'color 0.3s ease',
              }}
            >
              v0.1.0
            </Text>
          </div>
        )}
      </Sider>

      {/* ─── Main area ────────────────────────────────────────────── */}
      <Layout
        style={{
          marginLeft: collapsed ? 72 : 260,
          transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          background: palette.canvas,
        }}
      >
        {/* ─── Header — frosted glass bar ─────────────────────────── */}
        <Header
          style={{
            background: palette.headerBg,
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `0.5px solid var(--border-divider)`,
            height: 56,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            transition: 'background 0.35s ease, border-color 0.35s ease',
          }}
        >
          {/* Left: collapse toggle */}
          <div
            role="button"
            tabIndex={0}
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
            style={{
              cursor: 'pointer',
              fontSize: 16,
              color: palette.textSoft,
              transition: 'color 0.2s ease, background 0.2s ease',
              padding: 6,
              borderRadius: radius.sm,
            }}
            onClick={() => setCollapsed(!collapsed)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCollapsed(!collapsed);
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = palette.hoverBright;
              e.currentTarget.style.background = palette.hoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = palette.textSoft;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          {/* Right: theme toggle + user menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeToggle />

            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <div
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '4px 10px',
                  borderRadius: radius.md,
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = palette.hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Avatar
                  size={30}
                  style={{
                    background: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                    boxShadow: '0 1px 4px rgba(10, 132, 255, 0.25)',
                  }}
                >
                  {displayInitial}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: palette.userNameColor,
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {displayName}
                  </span>
                  {activeRoleLabel && (
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-subtle)',
                        padding: '1px 8px',
                        borderRadius: radius.full,
                        fontWeight: 500,
                        letterSpacing: '0.01em',
                        marginTop: 2,
                        alignSelf: 'flex-start',
                        border: '0.5px solid var(--border-subtle)',
                        transition: 'background 0.3s ease, color 0.3s ease',
                      }}
                    >
                      {activeRoleLabel}
                    </span>
                  )}
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* ─── Content ────────────────────────────────────────────── */}
        <Content
          style={{
            margin: 28,
            minHeight: 'calc(100vh - 56px - 56px)',
            animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
