/** 404 — Page not found — Apple glass aesthetic */

import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: 24,
      }}
    >
      {/* Gradient 404 */}
      <div
        style={{
          fontSize: 140,
          fontWeight: 800,
          letterSpacing: '-0.06em',
          lineHeight: 1,
          marginBottom: 8,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.04))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        404
      </div>

      <Title
        level={3}
        style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
      >
        页面未找到
      </Title>

      <Text
        style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          marginTop: 8,
          marginBottom: 40,
          display: 'block',
          maxWidth: 360,
        }}
      >
        你访问的页面不存在或已被移除
      </Text>

      <Button
        type="primary"
        size="large"
        icon={<HomeOutlined />}
        onClick={() => navigate('/', { replace: true })}
        style={{
          height: 48,
          paddingInline: 28,
          borderRadius: 14,
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        返回首页
      </Button>
    </div>
  );
};

export default NotFound;
