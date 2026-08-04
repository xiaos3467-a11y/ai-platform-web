/**
 * Main layout — Apple aesthetic, theme-aware
 * — Frosted glass sidebar, gradient accent, smooth collapse animation
 */

import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
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
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/contexts/auth';
import { useTheme } from '@/contexts/theme';
import ThemeToggle from '@/components/ThemeToggle';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  {
    key: 'ai',
    icon: <RobotOutlined />,
    label: 'AI 能力',
    children: [
      { key: '/models', icon: <ApiOutlined />, label: '模型管理' },
      { key: '/knowledge', icon: <BookOutlined />, label: '知识库' },
      { key: '/agents', icon: <RobotOutlined />, label: 'Agent 管理' },
      { key: '/conversations', icon: <MessageOutlined />, label: '对话记录' },
    ],
  },
  {
    key: 'platform',
    icon: <BranchesOutlined />,
    label: '平台管理',
    children: [
      { key: '/prompts', icon: <EditOutlined />, label: 'Prompt 管理' },
      { key: '/workflows', icon: <BranchesOutlined />, label: '工作流' },
      { key: '/evaluations', icon: <ExperimentOutlined />, label: '评测中心' },
      { key: '/costs', icon: <DollarOutlined />, label: '成本分析' },
    ],
  },
  {
    key: 'admin',
    icon: <TeamOutlined />,
    label: '系统管理',
    children: [
      { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
      { key: '/roles', icon: <SafetyOutlined />, label: '角色权限' },
      { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
    ],
  },
];

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore((s) => ({ logout: s.logout, user: s.user }));
  const { isDark } = useTheme();

  const displayName = user?.username || '管理员';
  const displayInitial = displayName.charAt(0).toUpperCase();

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
    <Layout style={{ minHeight: '100vh', background: palette.canvas, transition: 'background 0.35s ease' }}>
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
          backdropFilter: 'saturate(180%) blur(24px)',
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
              borderRadius: 10,
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
              if (key.startsWith('/')) navigate(key);
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
            backdropFilter: 'saturate(180%) blur(20px)',
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
              borderRadius: 8,
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
                  borderRadius: 10,
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
