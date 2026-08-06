/** Admin audit logs — platform-wide audit trail with stats and filters */

import React, { useState, useMemo } from 'react';
import {
  Table,
  Typography,
  Tag,
  DatePicker,
  Select,
  Input,
  Drawer,
  Descriptions,
  Tooltip,
  Empty,
} from 'antd';
import {
  EyeOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useApiListQuery, useApiQuery } from '@/hooks/useApiQuery';
import { GlassCard, StatCard, TableSkeleton, PageHeader } from '@/components';
import { radius } from '@/styles/themeTokens';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/* ─── Types ─────────────────────────────────────────────────────────── */

interface AuditLogStats {
  total: number;
  success_count: number;
  error_count: number;
  avg_latency_ms: number;
  by_action?: Record<string, number>;
  by_resource?: Record<string, number>;
}

interface AuditLog {
  id: string;
  created_at: string;
  actor_username?: string;
  actor_email?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address?: string;
  user_agent?: string;
  response_code: number;
  latency_ms?: number;
  tokens_consumed?: number;
  request_data?: Record<string, unknown>;
  error_message?: string;
}

/* ─── Constants ─────────────────────────────────────────────────────── */

const ACTION_COLORS: Record<string, string> = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  login: 'cyan',
  logout: 'magenta',
  api_call: 'purple',
  key_rotate: 'orange',
  enable: 'geekblue',
  disable: 'volcano',
};

const RESOURCE_TYPE_OPTIONS = [
  { value: 'user', label: '用户' },
  { value: 'tenant', label: '租户' },
  { value: 'api_key', label: 'API Key' },
  { value: 'model', label: '模型' },
  { value: 'knowledge_base', label: '知识库' },
  { value: 'agent', label: 'Agent' },
  { value: 'prompt', label: 'Prompt' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'conversation', label: '会话' },
  { value: 'role', label: '角色' },
  { value: 'app', label: 'App' },
];

const ACTION_LABELS: Record<string, string> = {
  create: '创建',
  update: '更新',
  delete: '删除',
  login: '登录',
  logout: '登出',
  api_call: 'API 调用',
  key_rotate: 'Key 轮换',
  enable: '启用',
  disable: '禁用',
};

const PAGE_SIZE = 25;

/* ─── Component ─────────────────────────────────────────────────────── */

const AdminAuditLogs: React.FC = () => {
  /* ── Filters ── */
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string | undefined>();
  const [userFilter, setUserFilter] = useState<string | undefined>();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  /* ── Query params ── */
  const queryParams: Record<string, unknown> = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      page_size: PAGE_SIZE,
    };
    if (dateRange) {
      params.start_time = dateRange[0].toISOString();
      params.end_time = dateRange[1].toISOString();
    }
    if (actionFilter) params.action = actionFilter;
    if (resourceTypeFilter) params.resource_type = resourceTypeFilter;
    if (userFilter) params.user_id = userFilter;
    return params;
  }, [page, dateRange, actionFilter, resourceTypeFilter, userFilter]);

  /* ── Queries ── */
  const { data: logs, isLoading } = useApiListQuery<AuditLog>({
    queryKey: [
      'admin',
      'audit-logs',
      page,
      dateRange,
      actionFilter,
      resourceTypeFilter,
      userFilter,
    ],
    endpoint: '/audit-logs',
    params: queryParams,
  });

  const { data: stats } = useApiQuery<AuditLogStats>({
    queryKey: [
      'admin',
      'audit-logs',
      'stats',
      dateRange,
      actionFilter,
      resourceTypeFilter,
      userFilter,
    ],
    endpoint: '/audit-logs/stats',
    params: {
      ...(dateRange
        ? { start_time: dateRange[0].toISOString(), end_time: dateRange[1].toISOString() }
        : {}),
      ...(actionFilter ? { action: actionFilter } : {}),
      ...(resourceTypeFilter ? { resource_type: resourceTypeFilter } : {}),
      ...(userFilter ? { user_id: userFilter } : {}),
    },
  });

  const { data: actionsList } = useApiQuery<string[]>({
    queryKey: ['admin', 'audit-logs', 'actions'],
    endpoint: '/audit-logs/actions',
    staleTime: 5 * 60_000,
  });

  /* ── Derived stats ── */
  const successRate = useMemo(() => {
    if (!stats || stats.total === 0) return 0;
    return (stats.success_count / stats.total) * 100;
  }, [stats]);

  /* ── Action options ── */
  const actionOptions = useMemo(() => {
    if (actionsList && Array.isArray(actionsList) && actionsList.length > 0) {
      return actionsList.map((action) => ({
        value: action,
        label: ACTION_LABELS[action] || action,
      }));
    }
    // Fallback to static list
    return Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }));
  }, [actionsList]);

  /* ── Columns ── */
  const columns: ColumnsType<AuditLog> = [
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '用户',
      dataIndex: 'actor_username',
      key: 'actor_username',
      width: 130,
      render: (name: string, record) => (
        <Tooltip title={record.actor_email || record.user_id || ''}>
          <Text style={{ fontWeight: 500 }}>{name || record.user_id || '—'}</Text>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (action: string) => (
        <Tag color={ACTION_COLORS[action] || 'default'}>{ACTION_LABELS[action] || action}</Tag>
      ),
    },
    {
      title: '资源',
      key: 'resource',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <Tooltip title={`${record.resource_type}: ${record.resource_id}`}>
          <Text code style={{ fontSize: 11 }}>
            {record.resource_type}
          </Text>
          <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
            {record.resource_id.slice(0, 12)}
            {record.resource_id.length > 12 ? '…' : ''}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
      render: (ip: string) => (
        <Text style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{ip || '—'}</Text>
      ),
    },
    {
      title: '状态码',
      dataIndex: 'response_code',
      key: 'response_code',
      width: 90,
      render: (code: number) => {
        const color = code >= 200 && code < 300 ? 'green' : code >= 400 ? 'red' : 'orange';
        return (
          <Tag color={color} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {code}
          </Tag>
        );
      },
    },
    {
      title: '延迟',
      dataIndex: 'latency_ms',
      key: 'latency_ms',
      width: 100,
      render: (v: number) =>
        v != null ? (
          <Text
            style={{
              fontVariantNumeric: 'tabular-nums',
              color: v > 1000 ? 'var(--color-error)' : 'var(--text-secondary)',
            }}
          >
            {v < 1000 ? `${v}ms` : `${(v / 1000).toFixed(2)}s`}
          </Text>
        ) : (
          '—'
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      render: (_, record) => (
        <a
          onClick={() => setSelectedLog(record)}
          style={{ color: 'var(--text-secondary)' }}
          aria-label="查看日志详情"
        >
          <EyeOutlined />
        </a>
      ),
    },
  ];

  /* ── Reset filters helper ── */
  const resetFilters = () => {
    setDateRange(null);
    setActionFilter(undefined);
    setResourceTypeFilter(undefined);
    setUserFilter(undefined);
    setPage(1);
  };

  /* ── Loading state ── */
  if (isLoading && !logs) {
    return (
      <GlassCard>
        <TableSkeleton />
      </GlassCard>
    );
  }

  return (
    <>
      <PageHeader
        title="审计日志"
        subtitle="平台全局操作审计记录，用于安全监控与问题排查"
        breadcrumb={[{ label: '管理' }, { label: '审计日志' }]}
      />

      {/* ─── Stats cards ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          title="总请求数"
          value={stats?.total ?? 0}
          icon={<ThunderboltOutlined />}
          gradient="linear-gradient(135deg, #0a84ff, #5e5ce6)"
        />
        <StatCard
          title="成功率"
          value={`${successRate.toFixed(1)}%`}
          icon={<CheckCircleOutlined />}
          gradient="linear-gradient(135deg, #30d158, #248a3d)"
        />
        <StatCard
          title="平均延迟"
          value={stats?.avg_latency_ms != null ? Math.round(stats.avg_latency_ms) : 0}
          icon={<DashboardOutlined />}
          gradient="linear-gradient(135deg, #ff9f0a, #ff6700)"
          suffix="ms"
        />
        <StatCard
          title="错误请求"
          value={stats?.error_count ?? 0}
          icon={<WarningOutlined />}
          gradient="linear-gradient(135deg, #ff453a, #bf2600)"
        />
      </div>

      {/* ─── Filters ─────────────────────────────────────────────── */}
      <GlassCard>
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="用户 ID"
            allowClear
            style={{ width: 160 }}
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value || undefined);
              setPage(1);
            }}
          />
          <Select
            placeholder="操作类型"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ||
              (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: 150 }}
            value={actionFilter}
            onChange={(v) => {
              setActionFilter(v);
              setPage(1);
            }}
            options={actionOptions}
          />
          <Select
            placeholder="资源类型"
            allowClear
            style={{ width: 150 }}
            value={resourceTypeFilter}
            onChange={(v) => {
              setResourceTypeFilter(v);
              setPage(1);
            }}
            options={RESOURCE_TYPE_OPTIONS}
          />
          <RangePicker
            showTime
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates as [Dayjs, Dayjs] | null);
              setPage(1);
            }}
          />
          {(dateRange || actionFilter || resourceTypeFilter || userFilter) && (
            <a onClick={resetFilters} style={{ fontSize: 13, alignSelf: 'center' }}>
              清除筛选
            </a>
          )}
        </div>

        <Table<AuditLog>
          columns={columns}
          dataSource={logs?.items || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: logs?.total || 0,
            onChange: setPage,
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 条记录`,
          }}
          scroll={{ x: 1100 }}
          size="small"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span style={{ color: 'var(--text-faint)' }}>暂无日志</span>}
              />
            ),
          }}
        />
      </GlassCard>

      {/* ─── Detail drawer ───────────────────────────────────────── */}
      <Drawer
        title="日志详情"
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        width={600}
      >
        {selectedLog && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID">
                <Text code style={{ fontSize: 11 }}>
                  {selectedLog.id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="时间">
                {dayjs(selectedLog.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="用户">
                {selectedLog.actor_username || '—'}
                {selectedLog.actor_email && (
                  <Text type="secondary"> ({selectedLog.actor_email})</Text>
                )}
                {selectedLog.user_id && (
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                    [{selectedLog.user_id}]
                  </Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="操作类型">
                <Tag color={ACTION_COLORS[selectedLog.action] || 'default'}>
                  {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="资源类型">{selectedLog.resource_type}</Descriptions.Item>
              <Descriptions.Item label="资源 ID">
                <Text code style={{ fontSize: 11 }}>
                  {selectedLog.resource_id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="IP 地址">{selectedLog.ip_address || '—'}</Descriptions.Item>
              <Descriptions.Item label="User Agent">
                <Text style={{ fontSize: 12, wordBreak: 'break-all' }}>
                  {selectedLog.user_agent || '—'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="状态码">
                <Tag
                  color={
                    selectedLog.response_code >= 200 && selectedLog.response_code < 300
                      ? 'green'
                      : selectedLog.response_code >= 400
                        ? 'red'
                        : 'orange'
                  }
                >
                  {selectedLog.response_code}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="延迟">
                {selectedLog.latency_ms != null
                  ? selectedLog.latency_ms < 1000
                    ? `${selectedLog.latency_ms}ms`
                    : `${(selectedLog.latency_ms / 1000).toFixed(2)}s`
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Token 消耗">
                {selectedLog.tokens_consumed?.toLocaleString() || '—'}
              </Descriptions.Item>
              {selectedLog.error_message && (
                <Descriptions.Item label="错误信息">
                  <Text type="danger" style={{ fontSize: 12 }}>
                    {selectedLog.error_message}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedLog.request_data && (
              <>
                <Title level={5} style={{ marginTop: 20 }}>
                  请求数据（脱敏）
                </Title>
                <pre
                  style={{
                    padding: 12,
                    background: 'var(--bg-elevated)',
                    borderRadius: radius.sm,
                    fontSize: 12,
                    overflow: 'auto',
                    border: '1px solid var(--border-subtle)',
                    maxHeight: 300,
                  }}
                >
                  {JSON.stringify(selectedLog.request_data, null, 2)}
                </pre>
              </>
            )}
          </>
        )}
      </Drawer>
    </>
  );
};

export default AdminAuditLogs;
