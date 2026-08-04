/**
 * Login page — Apple-style hero
 * — Animated gradient orbs, frosted glass card, micro-interactions
 */

import React, { useState } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/contexts/auth';
import { api } from '@/api/client';
import type { LoginResponse } from '@/types';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setSubmitting(true);
    try {
      const resp = await api.post<LoginResponse>('/auth/login', values);
      const { token, user } = resp.data;

      login(token, {
        id: user.id,
        username: user.username,
        tenant_id: user.tenant_id,
        role: user.roles?.[0]?.name || 'user',
      });
      message.success('欢迎回来');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        message.error('网络连接失败，请检查网络后重试');
      }
    } finally {
      setSubmitting(false);
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
        background: 'var(--bg-body)',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ─── Background orbs — animated gradient blobs ───────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {/* Primary blue orb */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(10, 132, 255, 0.15) 0%, transparent 70%)',
            top: '10%',
            left: '20%',
            filter: 'blur(60px)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        {/* Purple orb */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(191, 90, 242, 0.12) 0%, transparent 70%)',
            bottom: '5%',
            right: '15%',
            filter: 'blur(60px)',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        {/* Subtle teal accent */}
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(48, 209, 88, 0.06) 0%, transparent 70%)',
            top: '50%',
            left: '60%',
            filter: 'blur(60px)',
            animation: 'float 12s ease-in-out infinite',
          }}
        />
        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* ─── Content ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          {/* Logo mark */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 50%, #bf5af2 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 24,
              boxShadow: '0 8px 32px rgba(10, 132, 255, 0.35), 0 0 0 1px rgba(255,255,255,0.08) inset',
              letterSpacing: '-0.02em',
            }}
          >
            AI
          </div>

          <Title
            level={1}
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 44,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            AI 中台
          </Title>
          <Text
            style={{
              fontSize: 19,
              color: 'rgba(255, 255, 255, 0.45)',
              marginTop: 12,
              display: 'block',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            企业级 AI 能力平台
          </Text>
        </div>

        {/* ─── Login card — frosted glass ────────────────────────── */}
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'var(--bg-card)',
            backdropFilter: 'saturate(180%) blur(24px)',
            WebkitBackdropFilter: 'saturate(180%) blur(24px)',
            borderRadius: 24,
            padding: '44px 40px',
            border: '0.5px solid var(--border-subtle)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
            <Form.Item
              name="username"
              label={
                <span
                  style={{
                    fontWeight: 500,
                    color: 'var(--text-label)',
                    fontSize: 14,
                  }}
                >
                  用户名
                </span>
              }
              rules={[{ required: true, message: '请输入用户名' }]}
              style={{ marginBottom: 20 }}
            >
              <Input
                placeholder="输入用户名"
                style={{
                  height: 48,
                  borderRadius: 12,
                  fontSize: 15,
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={
                <span
                  style={{
                    fontWeight: 500,
                    color: 'var(--text-label)',
                    fontSize: 14,
                  }}
                >
                  密码
                </span>
              }
              rules={[{ required: true, message: '请输入密码' }]}
              style={{ marginBottom: 32 }}
            >
              <Input.Password
                placeholder="输入密码"
                style={{
                  height: 48,
                  borderRadius: 12,
                  fontSize: 15,
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                style={{
                  height: 48,
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(10, 132, 255, 0.35), 0 0 0 1px rgba(255,255,255,0.1) inset',
                  letterSpacing: '-0.01em',
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
            marginTop: 36,
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.2)',
            letterSpacing: '0.02em',
          }}
        >
          AI Platform v0.1.0 · Enterprise Edition
        </Text>
      </div>
    </div>
  );
};

export default LoginPage;
