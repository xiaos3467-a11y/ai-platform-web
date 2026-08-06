/**
 * ErrorState — reusable error display with optional retry.
 *
 * - Automatically reports to Sentry via `captureError`.
 * - Supports inline (embedded in page) and fullscreen variants.
 * - Theme-aware (dark/light).
 * - Vitest coverage target: 100%.
 */

import React, { useEffect } from 'react';
import { Button, Typography } from 'antd';
import { WarningOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { captureError } from '@/lib/sentry';
import { radius } from '@/styles/themeTokens';

const { Text, Paragraph } = Typography;

export interface ErrorStateProps {
  /** The error to display (Error object or string message). */
  error: Error | string;
  /** Optional retry callback — shows a "Retry" button when provided. */
  onRetry?: () => void;
  /**
   * - `inline` — embedded in page flow (default)
   * - `fullscreen` — fills the viewport (used in ErrorBoundary)
   */
  variant?: 'inline' | 'fullscreen';
  /** Override the default title. */
  title?: string;
  /** Optional subtitle / additional context. */
  description?: React.ReactNode;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  variant = 'inline',
  title,
  description,
}) => {
  const { t } = useTranslation();
  const defaultTitle = t('error.title', '出了点问题');
  const resolvedTitle = title ?? defaultTitle;

  // Auto-report to Sentry on mount
  useEffect(() => {
    if (error instanceof Error) {
      captureError(error, { component: 'ErrorState', variant });
    } else {
      captureError(new Error(typeof error === 'string' ? error : 'Unknown error'), {
        component: 'ErrorState',
        variant,
      });
    }
  }, [error, variant]);

  const errorMessage = error instanceof Error ? error.message : error;

  if (variant === 'fullscreen') {
    return <FullscreenError message={errorMessage} title={resolvedTitle} description={description} onRetry={onRetry} />;
  }

  return <InlineError message={errorMessage} title={resolvedTitle} description={description} onRetry={onRetry} />;
};

/* ─── Inline variant ─────────────────────────────────────────────────── */
interface ErrorContentProps {
  message: string;
  title: string;
  description?: React.ReactNode;
  onRetry?: () => void;
}

const InlineError: React.FC<ErrorContentProps> = ({ message, title, description, onRetry }) => {
  const { t } = useTranslation();
  return (
  <div
    role="alert"
    data-testid="error-state-inline"
    style={{
      padding: '24px 20px',
      borderRadius: radius.lg,
      background: 'var(--bg-card)',
      border: '0.5px solid var(--border-subtle)',
      textAlign: 'center',
      maxWidth: 420,
      margin: '0 auto',
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: radius.md,
        background: 'linear-gradient(135deg, #ff453a, #ff6961)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}
    >
      <WarningOutlined style={{ fontSize: 22, color: '#fff' }} />
    </div>

    <Text
      strong
      style={{
        display: 'block',
        fontSize: 17,
        color: 'var(--text-primary)',
        marginBottom: 8,
      }}
    >
      {title}
    </Text>

    {description && (
      <Paragraph
        style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Paragraph>
    )}

    <Paragraph
      style={{
        fontSize: 13,
        color: 'var(--text-muted)',
        marginBottom: 16,
        fontFamily: 'monospace',
        background: 'var(--bg-elevated)',
        padding: '8px 12px',
        borderRadius: radius.sm,
        textAlign: 'left',
        maxHeight: 80,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {message}
    </Paragraph>

    {onRetry && (
      <Button
        type="primary"
        icon={<ReloadOutlined />}
        onClick={onRetry}
        data-testid="error-state-retry"
        style={{
          borderRadius: radius.sm,
          fontWeight: 500,
        }}
      >
        {t('common.retry', '重试')}
      </Button>
    )}
  </div>
  );
};

/* ─── Fullscreen variant ─────────────────────────────────────────────── */
const FullscreenError: React.FC<ErrorContentProps & { onRetry?: () => void }> = ({
  message,
  title,
  description,
  onRetry,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      data-testid="error-state-fullscreen"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-body)',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          background: 'var(--bg-card)',
          borderRadius: radius.xl,
          padding: '44px 40px',
          border: '0.5px solid var(--border-subtle)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.lg,
            background: 'linear-gradient(135deg, #ff453a, #ff6961)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          !
        </div>

        <Text
          strong
          style={{
            display: 'block',
            fontSize: 24,
            color: 'var(--text-primary)',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Text>

        <Paragraph
          style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          {description ?? t('error.description', '应用遇到了意外错误。请刷新页面或返回首页。')}
        </Paragraph>

        <Paragraph
          style={{
            fontSize: 11,
            fontFamily: 'monospace',
            color: 'var(--text-muted)',
            background: 'var(--bg-elevated)',
            padding: 12,
            borderRadius: radius.md,
            marginBottom: 20,
            textAlign: 'left',
            maxHeight: 120,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            border: '0.5px solid var(--border-divider)',
          }}
        >
          {message}
        </Paragraph>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {onRetry && (
            <Button
              icon={<ReloadOutlined />}
              onClick={onRetry}
              data-testid="error-state-retry"
              size="large"
              style={{
                height: 44,
                paddingInline: 24,
                borderRadius: radius.md,
                fontWeight: 600,
              }}
            >
              {t('common.retry', '重试')}
            </Button>
          )}
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            size="large"
            style={{
              height: 44,
              paddingInline: 24,
              borderRadius: radius.md,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
              border: 'none',
            }}
          >
            {t('error.backHome', '返回首页')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
