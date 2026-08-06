/** Tenant console layout — sidebar with tenant-specific navigation */

import React, { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  KeyOutlined,
  TeamOutlined,
  ApiOutlined,
  BarChartOutlined,
  SettingOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/contexts/auth';
import { useTheme } from '@/contexts/theme';
import ThemeToggle from '@/components/ThemeToggle';

import { radius } from '@/styles/themeTokens';
const { Header, Sider, Content } = Layout;

const TenantLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore((s) => ({ logout: s.logout, user: s.user }));
  const { isDark } = useTheme();

  const displayName = user?.username || '租户管理员';
  const displayInitial = displayName.charAt(0).toUpperCase();

  const menuItems = useMemo(
    () => [
      { key: '/tenant', icon: <DashboardOutlined />, label: '概览' },
      { key: '/tenant/api-keys', icon: <KeyOutlined />, label: 'API Key' },
      { key: '/tenant/members', icon: <TeamOutlined />, label: '成员管理' },
      { key: '/tenant/models', icon: <ApiOutlined />, label: '可用模型' },
      { key: '/tenant/usage', icon: <BarChartOutlined />, label: '用量统计' },
      { key: '/tenant/audit-logs', icon: <FileTextOutlined />, label: '审计日志' },
      { key: '/tenant/settings', icon: <SettingOutlined />, label: '租户设置' },
    ],
    [],
  );

  const palette = {
    canvas: 'var(--bg-body)',
    siderBg: isDark ? 'rgba(22, 22, 24, 0.82)' : 'rgba(255, 255, 255, 0.78)',
    headerBg: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(255, 255, 255, 0.72)',
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
        key: 'back-platform',
        label: '返回平台管理',
        onClick: () => navigate('/'),
      },
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
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
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
            transition: 'padding 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: radius.md,
              background: 'linear-gradient(135deg, #30d158 0%, #0a84ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: '0 2px 12px rgba(48, 209, 88, 0.3)',
            }}
          >
            T
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: palette.textPrimary,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                租户控制台
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: palette.textSecondary,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Tenant Portal
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 0' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              borderRight: 'none',
              background: 'transparent',
              fontWeight: 500,
            }}
          />
        </div>
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 72 : 240,
          transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          background: palette.canvas,
        }}
      >
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
          }}
        >
          <div
            role="button"
            tabIndex={0}
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
            style={{
              cursor: 'pointer',
              fontSize: 16,
              color: palette.textSoft,
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
                }}
              >
                <Avatar
                  size={30}
                  style={{
                    background: 'linear-gradient(135deg, #30d158, #0a84ff)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                  }}
                >
                  {displayInitial}
                </Avatar>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: palette.userNameColor,
                  }}
                >
                  {displayName}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

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

export default TenantLayout;
