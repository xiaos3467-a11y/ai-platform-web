/**
 * ModelSelector — dynamic model picker that loads available models from the
 * `/models/available` endpoint and filters by purpose.
 *
 * Value format: "provider_name:model_name"
 *
 * Apple glass aesthetic — custom option rendering with purpose tags.
 */

import React, { useMemo } from 'react';
import { Select, Tag, Typography, Spin, Empty } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import { useApiQuery } from '@/hooks';
import type { AvailableModel, ModelPurpose } from '@/types';
import { PURPOSE_META } from '@/types';
import { radius } from '@/styles/themeTokens';

const { Text } = Typography;

export interface ModelSelectorProps {
  /** Filter models by purpose */
  purpose: ModelPurpose;
  /** Current value — format "provider_name:model_name" */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  /** Show provider display name alongside the model name */
  showProvider?: boolean;
  /** Optional style override */
  style?: React.CSSProperties;
  /** Optional className */
  className?: string;
}

/** Map PURPOSE_META.color (which can be any string) → Ant Design Tag `color` prop. */
function mapTagColor(c: string): string {
  const ok = new Set([
    'blue',
    'green',
    'purple',
    'orange',
    'cyan',
    'red',
    'yellow',
    'pink',
    'magenta',
    'volcano',
    'gold',
    'lime',
    'geekblue',
    'default',
  ]);
  return ok.has(c) ? c : 'default';
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  purpose,
  value,
  onChange,
  placeholder,
  allowClear = true,
  showProvider = true,
  style,
  className,
}) => {
  const { data: models, isLoading } = useApiQuery<AvailableModel[]>({
    queryKey: ['models', 'available', purpose],
    endpoint: '/models/available/list',
    params: { purpose },
  });

  // Sort by priority descending
  const sorted = useMemo(
    () => [...(models ?? [])].sort((a, b) => b.priority - a.priority),
    [models],
  );

  const options = useMemo(
    () =>
      sorted.map((m) => {
        const meta = PURPOSE_META[purpose];
        return {
          value: `${m.provider_name}:${m.model_name}`,
          label: m.model_name,
          model: m,
          meta,
        };
      }),
    [sorted, purpose],
  );

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? `选择${PURPOSE_META[purpose].label}模型`}
      allowClear={allowClear}
      showSearch
      optionFilterProp="label"
      loading={isLoading}
      className={className}
      style={{ minWidth: 220, ...style }}
      notFoundContent={
        isLoading ? (
          <div style={{ textAlign: 'center', padding: 8 }}>
            <Spin size="small" />
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无可用模型"
            style={{ padding: '8px 0' }}
          />
        )
      }
      optionRender={(option) => {
        const raw = option.data as {
          model: AvailableModel;
          meta: { label: string; color: string };
        };
        const { model: m, meta } = raw;
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 0',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: radius.sm,
                background: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              <ApiOutlined />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.model_name}
              </div>
              {showProvider && (
                <Text
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    display: 'block',
                  }}
                >
                  {m.provider_display}
                </Text>
              )}
            </div>
            <Tag
              color={mapTagColor(meta.color)}
              style={{ marginRight: 0, fontSize: 11 }}
            >
              {meta.label}
            </Tag>
          </div>
        );
      }}
      options={options}
    />
  );
};

export default ModelSelector;
