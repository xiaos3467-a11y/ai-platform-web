/** Tenant audit logs */

import React, { useState } from 'react';
import {
  Table,
  Typography,
  Tag,
  Drawer,
  Descriptions,
  DatePicker,
  Select,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useApiListQuery } from '@/hooks/useApiQuery';
import { GlassCard, TableSkeleton } from '@/components';
import type { TenantAuditLog } from '@/types';
import dayjs from 'dayjs';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ACTION_COLORS: Record<string, string> = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  login: 'cyan',
  api_call: 'purple',
  key_rotate: 'orange',
};

const TenantAuditLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<TenantAuditLog | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [actionFilter, setActionFilter] = useState<string | undefined>();

  const queryParams: Record<string, unknown> = {
    page,
    page_size: 50,
  };
  if (dateRange) {
    queryParams.start_date = dateRange[0].toISOString();
    queryParams.end_date = dateRange[1].toISOString();
  }
  if (actionFilter) queryParams.action = actionFilter;

  const { data: logs, isLoading } = useApiListQuery<TenantAuditLog>({
    queryKey: ['tenant', 'audit-logs', page, dateRange, actionFilter],
    endpoint: '/tenant/self/audit-logs/list',
    params: queryParams,
  });

  const columns: ColumnsType<TenantAuditLog> = [
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作人',
      dataIndex: 'actor_username',
      key: 'actor_username',
      width: 130,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 130,
      render: (action: string) => (
        <Tag color={ACTION_COLORS[action] || 'default'}>{action}</Tag>
      ),
    },
    {
      title: '资源类型',
      dataIndex: 'resource_type',
      key: 'resource_type',
      width: 120,
    },
    {
      title: '资源 ID',
      dataIndex: 'resource_id',
      key: 'resource_id',
      width: 160,
      ellipsis: true,
      render: (id: string) => (
        <Text code style={{ fontSize: 11 }}>
          {id}
        </Text>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 140,
    },
    {
      title: '状态码',
      dataIndex: 'response_code',
      key: 'response_code',
      width: 80,
      render: (code: number) => (
        <Tag color={code >= 200 && code < 300 ? 'green' : code >= 400 ? 'red' : 'orange'}>
          {code}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <a onClick={() => setSelectedLog(record)}>
          <EyeOutlined />
        </a>
      ),
    },
  ];

  if (isLoading) {
    return (
      <GlassCard>
        <TableSkeleton />
      </GlassCard>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          审计日志
        </Title>
        <Text type="secondary">查看租户操作记录</Text>
      </div>

      <GlassCard>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <RangePicker
            showTime
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
              setPage(1);
            }}
          />
          <Select
            placeholder="按操作类型筛选"
            allowClear
            style={{ width: 160 }}
            value={actionFilter}
            onChange={(v) => {
              setActionFilter(v);
              setPage(1);
            }}
            options={[
              { value: 'create', label: '创建' },
              { value: 'update', label: '更新' },
              { value: 'delete', label: '删除' },
              { value: 'login', label: '登录' },
              { value: 'api_call', label: 'API 调用' },
              { value: 'key_rotate', label: 'Key 轮换' },
            ]}
          />
        </div>

        <Table<TenantAuditLog>
          columns={columns}
          dataSource={logs?.items || []}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: 50,
            total: logs?.total || 0,
            onChange: setPage,
            showTotal: (t) => `共 ${t} 条记录`,
          }}
          scroll={{ x: 1000 }}
          size="small"
          locale={{ emptyText: <span style={{ color: "var(--text-faint)", padding: 24 }}>暂无日志</span> }}
        />
      </GlassCard>

      {/* Detail drawer */}
      <Drawer
        title="日志详情"
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        width={560}
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
              <Descriptions.Item label="操作人">
                {selectedLog.actor_username}
                {selectedLog.actor_email && (
                  <Text type="secondary"> ({selectedLog.actor_email})</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="操作类型">
                <Tag color={ACTION_COLORS[selectedLog.action] || 'default'}>
                  {selectedLog.action}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="资源类型">
                {selectedLog.resource_type}
              </Descriptions.Item>
              <Descriptions.Item label="资源 ID">
                <Text code style={{ fontSize: 11 }}>
                  {selectedLog.resource_id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="IP 地址">
                {selectedLog.ip_address}
              </Descriptions.Item>
              <Descriptions.Item label="User Agent">
                <Text style={{ fontSize: 12, wordBreak: 'break-all' }}>
                  {selectedLog.user_agent || '—'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="响应状态码">
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
              <Descriptions.Item label="Token 消耗">
                {selectedLog.tokens_consumed?.toLocaleString() || '—'}
              </Descriptions.Item>
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

export default TenantAuditLogs;
