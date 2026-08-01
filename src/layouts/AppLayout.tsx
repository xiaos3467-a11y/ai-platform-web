/** Main layout — Apple-inspired: minimal, airy, frosted glass header */

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

const { Header, Sider, Content } = Layout;

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
  const logout = useAuthStore((s) => s.logout);

  const userMenu = {
    items: [
      { key: 'settings', icon: <SettingOutlined />, label: '个人设置' },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
        onClick: () => {
          logout();
          navigate('/login');
        },
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        collapsedWidth={72}
        style={{
          background: '#ffffff',
          borderRight: '1px solid #e8e8ed',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 20,
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
            borderBottom: '1px solid #f0f0f2',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0071e3, #5856d6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            AI
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1d1d1f',
                letterSpacing: '-0.02em',
              }}
            >
              AI 中台
            </span>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: '12px 0' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['ai', 'platform', 'admin']}
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

      {/* Main area */}
      <Layout
        style={{
          marginLeft: collapsed ? 72 : 260,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Frosted glass header */}
        <Header
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)',
            height: 56,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{ cursor: 'pointer', fontSize: 16, color: '#86868b', transition: 'color 0.2s' }}
            onClick={() => setCollapsed(!collapsed)}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1d1d1f')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#86868b')}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
            <div
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 8px',
                borderRadius: 10,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar
                size={30}
                style={{
                  background: 'linear-gradient(135deg, #0071e3, #5856d6)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                A
              </Avatar>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1d1d1f' }}>
                管理员
              </span>
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 24,
            minHeight: 'calc(100vh - 56px - 48px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
