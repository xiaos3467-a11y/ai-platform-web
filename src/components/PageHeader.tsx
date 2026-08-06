/**
 * PageHeader — consistent page title bar used across all pages.
 *
 * Renders title + optional subtitle, breadcrumb trail, and an "extra"
 * slot on the right for action buttons.
 *
 * Usage:
 *   <PageHeader
 *     title="仪表盘"
 *     subtitle="AI 平台运行概览"
 *     breadcrumb={[{ label: '概览', to: '/' }]}
 *     extra={<Button>新建模型</Button>}
 *   />
 */

import React from 'react';
import { Typography } from 'antd';
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb';
import { radius } from '@/styles/themeTokens';

const { Title, Text } = Typography;

export interface PageHeaderProps {
  /** Page title — string or ReactNode for custom rendering. */
  title: React.ReactNode;
  /** Optional subtitle below the title. */
  subtitle?: React.ReactNode;
  /** Breadcrumb items. Renders a Home icon → trail. */
  breadcrumb?: BreadcrumbItem[];
  /** Right-side action area (buttons, filters, etc.). */
  extra?: React.ReactNode;
  /** Optional icon rendered before the title. */
  icon?: React.ReactNode;
  /** Custom className for the wrapper. */
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  extra,
  icon,
  className = 'animate-fade-in-up',
}) => {
  return (
    <div className={className} style={{ marginBottom: 32 }}>
      {/* Breadcrumb trail */}
      {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}

      {/* Title row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {icon && (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                background: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 22,
              }}
            >
              {icon}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <Title
              level={2}
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 34,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
              }}
            >
              {title}
            </Title>
            {subtitle && (
              <Text
                style={{
                  fontSize: 17,
                  color: 'var(--text-secondary)',
                  marginTop: 6,
                  display: 'block',
                  fontWeight: 400,
                }}
              >
                {subtitle}
              </Text>
            )}
          </div>
        </div>

        {extra && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            {extra}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
