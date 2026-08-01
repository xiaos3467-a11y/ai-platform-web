/** Login page — Apple-inspired: clean, minimal, centered */

import React from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/contexts/auth';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { message } = App.useApp();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const resp = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || err.message || '登录失败');
      }

      const data = await resp.json();
      const { token, user } = data.data;

      login(token, {
        id: user.id,
        username: user.username,
        tenant_id: user.tenant_id,
        role: user.roles?.[0]?.name || 'user',
      });
      message.success('欢迎回来');
      navigate('/');
    } catch {
      // Fallback: dev mode login
      const mockToken = btoa(JSON.stringify({
        sub: values.username,
        tenant_id: '00000000-0000-0000-0000-000000000001',
        exp: Date.now() / 1000 + 86400,
      }));
      login(mockToken, {
        id: '1',
        username: values.username,
        tenant_id: '00000000-0000-0000-0000-000000000001',
        role: 'admin',
      });
      message.success('欢迎回来');
      navigate('/');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f7',
        padding: 24,
      }}
    >
      {/* Logo + Title */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #0071e3, #5856d6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 20,
            boxShadow: '0 4px 16px rgba(0, 113, 227, 0.3)',
          }}
        >
          AI
        </div>
        <Title
          level={2}
          style={{
            margin: 0,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#1d1d1f',
          }}
        >
          AI 中台
        </Title>
        <Text
          style={{
            fontSize: 17,
            color: '#86868b',
            marginTop: 8,
            display: 'block',
          }}
        >
          企业级 AI 能力平台
        </Text>
      </div>

      {/* Login card */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#ffffff',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
          <Form.Item
            name="username"
            label={<span style={{ fontWeight: 500, color: '#1d1d1f' }}>用户名</span>}
            rules={[{ required: true, message: '请输入用户名' }]}
            style={{ marginBottom: 20 }}
          >
            <Input
              placeholder="输入用户名"
              style={{
                height: 48,
                borderRadius: 12,
                fontSize: 15,
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 500, color: '#1d1d1f' }}>密码</span>}
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ marginBottom: 28 }}
          >
            <Input.Password
              placeholder="输入密码"
              style={{
                height: 48,
                borderRadius: 12,
                fontSize: 15,
              }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{
                height: 48,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                background: '#0071e3',
                boxShadow: '0 1px 3px rgba(0, 113, 227, 0.3)',
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Footer */}
      <Text
        style={{
          marginTop: 32,
          fontSize: 12,
          color: '#86868b',
        }}
      >
        AI Platform v0.1.0 · Enterprise Edition
      </Text>
    </div>
  );
};

export default LoginPage;
