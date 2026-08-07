/** Admin tenant management — list, create, edit, enable/disable */

import React, { useState, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  App,
  Tag,
  Drawer,
  Switch,
  InputNumber,
  Descriptions,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useApiListQuery, useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { GlassCard, TableSkeleton, PageHeader } from '@/components';
import { radius } from '@/styles/themeTokens';
import { useAuthStore } from '@/contexts/auth';
import type { Tenant, TenantPlan, TenantStatus, TenantMember, TenantMemberRole } from '@/types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

const PLAN_OPTIONS: { value: TenantPlan; label: string; color: string }[] = [
  { value: 'standard', label: '标准版', color: 'blue' },
  { value: 'professional', label: '专业版', color: 'purple' },
  { value: 'enterprise', label: '企业版', color: 'gold' },
];

const STATUS_OPTIONS: { value: TenantStatus; label: string; color: string }[] = [
  { value: 'active', label: '已激活', color: 'green' },
  { value: 'disabled', label: '已禁用', color: 'red' },
  { value: 'pending', label: '待审核', color: 'orange' },
];

const MEMBER_ROLES: { value: TenantMemberRole; label: string }[] = [
  { value: 'tenant_admin', label: '租户管理员' },
  { value: 'tenant_developer', label: '开发者' },
  { value: 'tenant_viewer', label: '只读用户' },
];

const AdminTenants: React.FC = () => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [inviteForm] = Form.useForm();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [viewTenant, setViewTenant] = useState<Tenant | null>(null);
  const [membersTenant, setMembersTenant] = useState<Tenant | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<TenantStatus | undefined>();
  const [planFilter, setPlanFilter] = useState<TenantPlan | undefined>();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const hasRole = useAuthStore((s) => s.hasRole);

  const { data: tenantsData, isLoading } = useApiListQuery<Tenant>({
    queryKey: ['admin', 'tenants', page, statusFilter, planFilter],
    endpoint: '/tenants/list',
    params: {
      page,
      page_size: pageSize,
      status: statusFilter,
      plan: planFilter,
    },
  });

  const { data: tenantDetail } = useApiQuery<Tenant>({
    queryKey: ['admin', 'tenants', editTenant?.id],
    endpoint: '/tenants/get',
    params: { id: editTenant?.id },
    enabled: !!editTenant,
  });

  const { data: membersData, isLoading: membersLoading } = useApiListQuery<TenantMember>({
    queryKey: ['admin', 'tenants', membersTenant?.id, 'members'],
    endpoint: '/tenants/members/list',
    params: { tenant_id: membersTenant?.id },
    enabled: !!membersTenant,
  });

  // Mutations
  const createMutation = useApiMutation<Tenant, Record<string, unknown>>({
    endpoint: '/tenants/create',
    invalidateKeys: [['admin', 'tenants']],
    onSuccess: () => {
      message.success('租户创建成功');
      setCreateOpen(false);
      form.resetFields();
    },
  });

  const updateMutation = useApiMutation<Tenant, Record<string, unknown>>({
    endpoint: '/tenants/update',
    invalidateKeys: [['admin', 'tenants']],
    onSuccess: () => {
      message.success('租户更新成功');
      setEditTenant(null);
      editForm.resetFields();
    },
  });

  const enableMutation = useApiMutation<Tenant, { id: string }>({
    endpoint: '/tenants/enable',
    invalidateKeys: [['admin', 'tenants']],
    onSuccess: () => {
      message.success('租户已启用');
    },
  });

  const disableMutation = useApiMutation<Tenant, { id: string }>({
    endpoint: '/tenants/disable',
    invalidateKeys: [['admin', 'tenants']],
    onSuccess: () => {
      message.success('租户已禁用');
    },
  });

  const inviteMemberMutation = useApiMutation<TenantMember, Record<string, unknown>>({
    endpoint: '/tenants/members/create',
    invalidateKeys: [['admin', 'tenants', membersTenant?.id, 'members']],
    onSuccess: () => {
      message.success('邀请已发送');
      setInviteOpen(false);
      inviteForm.resetFields();
    },
  });

  const removeMemberMutation = useApiMutation<void, { tenantId: string; userId: string }>({
    endpoint: '/tenants/members/delete',
    invalidateKeys: [['admin', 'tenants', membersTenant?.id, 'members']],
    onSuccess: () => {
      message.success('成员已移除');
    },
  });

  const updateMemberRoleMutation = useApiMutation<
    TenantMember,
    { tenantId: string; userId: string; role: TenantMemberRole }
  >({
    endpoint: '/tenants/members/update-role',
    invalidateKeys: [['admin', 'tenants', membersTenant?.id, 'members']],
    onSuccess: () => {
      message.success('角色已更新');
    },
  });

  const handleCreate = useCallback(() => {
    form.validateFields().then((values) => {
      createMutation.mutate(values);
    });
  }, [form, createMutation]);

  const handleEdit = useCallback(() => {
    if (!editTenant) return;
    editForm.validateFields().then((values) => {
      updateMutation.mutate({ id: editTenant.id, ...values });
    });
  }, [editTenant, editForm, updateMutation]);

  const handleToggleStatus = useCallback(
    (tenant: Tenant) => {
      const action = tenant.status === 'active' ? '禁用' : '启用';
      modal.confirm({
        title: `确认${action}租户`,
        content: `确定要${action}租户「${tenant.name}」吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          if (tenant.status === 'active') {
            disableMutation.mutate({ id: tenant.id });
          } else {
            enableMutation.mutate({ id: tenant.id });
          }
        },
      });
    },
    [modal, disableMutation, enableMutation],
  );

  const handleRemoveMember = useCallback(
    (member: TenantMember) => {
      if (!membersTenant) return;
      modal.confirm({
        title: '确认移除成员',
        content: `确定要将「${member.username}」从租户中移除吗？`,
        okText: '确认',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: () => {
          removeMemberMutation.mutate({
            tenantId: membersTenant.id,
            userId: member.user_id,
          });
        },
      });
    },
    [modal, membersTenant, removeMemberMutation],
  );

  const handleInvite = useCallback(() => {
    if (!membersTenant) return;
    inviteForm.validateFields().then((values) => {
      inviteMemberMutation.mutate({
        tenantId: membersTenant.id,
        ...values,
      });
    });
  }, [membersTenant, inviteForm, inviteMemberMutation]);

  const columns: ColumnsType<Tenant> = [
    {
      title: '租户名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record) => (
        <a onClick={() => setViewTenant(record)} style={{ fontWeight: 500 }}>
          {name}
        </a>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (slug: string) => (
        <Text code style={{ fontSize: 12 }}>
          {slug}
        </Text>
      ),
    },
    {
      title: '套餐',
      dataIndex: 'plan',
      key: 'plan',
      width: 100,
      render: (plan: TenantPlan) => {
        const opt = PLAN_OPTIONS.find((p) => p.value === plan);
        return <Tag color={opt?.color}>{opt?.label || plan}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: TenantStatus) => {
        const opt = STATUS_OPTIONS.find((s) => s.value === status);
        return <Tag color={opt?.color}>{opt?.label || status}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setViewTenant(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditTenant(record);
                editForm.setFieldsValue({
                  name: record.name,
                  plan: record.plan,
                  quota_config: record.quota_config,
                  feature_flags: record.feature_flags,
                  allowed_models: record.allowed_models,
                });
              }}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Button
              size="small"
              type="text"
              danger={record.status === 'active'}
              icon={
                record.status === 'active' ? (
                  <StopOutlined />
                ) : (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                )
              }
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="成员管理">
            <Button
              size="small"
              type="text"
              icon={<TeamOutlined />}
              onClick={() => setMembersTenant(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const memberColumns: ColumnsType<TenantMember> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: TenantMemberRole, record) => (
        <Select
          size="small"
          value={role}
          style={{ width: 120 }}
          options={MEMBER_ROLES}
          disabled={!hasRole('super_admin') && !hasRole('platform_ops')}
          onChange={(newRole) => {
            if (!membersTenant) return;
            updateMemberRoleMutation.mutate({
              tenantId: membersTenant.id,
              userId: record.user_id,
              role: newRole,
            });
          }}
        />
      ),
    },
    {
      title: '加入时间',
      dataIndex: 'joined_at',
      key: 'joined_at',
      width: 170,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          size="small"
          danger
          onClick={() => handleRemoveMember(record)}
          disabled={!hasRole('super_admin') && !hasRole('platform_ops')}
        >
          移除
        </Button>
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
      <PageHeader
        title="租户管理"
        subtitle="管理平台所有租户，配置配额和功能"
        breadcrumb={[{ label: '管理' }, { label: '租户管理' }]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{ height: 44, paddingInline: 20, borderRadius: radius.md, fontWeight: 500 }}
          >
            新建租户
          </Button>
        }
      />

      <GlassCard>
        {/* Filters + Create */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select
            placeholder="按状态筛选"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
          />
          <Select
            placeholder="按套餐筛选"
            allowClear
            style={{ width: 140 }}
            value={planFilter}
            onChange={setPlanFilter}
            options={PLAN_OPTIONS.map((p) => ({ value: p.value, label: p.label }))}
          />
          <div style={{ flex: 1 }} />
        </div>

        <Table<Tenant>
          columns={columns}
          dataSource={tenantsData?.items || []}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total: tenantsData?.total || 0,
            onChange: setPage,
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 个租户`,
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </GlassCard>

      {/* ─── Create Tenant Modal ─────────────────────────────────────── */}
      <Modal
        title="新建租户"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        confirmLoading={createMutation.isPending}
        okText="创建"
        cancelText="取消"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="租户名称"
            rules={[{ required: true, message: '请输入租户名称' }]}
          >
            <Input placeholder="例如：某科技有限公司" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true, message: '请输入 slug' },
              { pattern: /^[a-z0-9-]+$/, message: '只允许小写字母、数字和横线' },
            ]}
          >
            <Input placeholder="例如：my-company" />
          </Form.Item>
          <Form.Item name="plan" label="套餐" initialValue="standard" rules={[{ required: true }]}>
            <Select options={PLAN_OPTIONS.map((p) => ({ value: p.value, label: p.label }))} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="租户描述（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── Edit Tenant Drawer ──────────────────────────────────────── */}
      <Drawer
        title="编辑租户"
        open={!!editTenant}
        onClose={() => setEditTenant(null)}
        width={520}
        extra={
          <Button type="primary" onClick={handleEdit} loading={updateMutation.isPending}>
            保存
          </Button>
        }
      >
        {tenantDetail && (
          <Form form={editForm} layout="vertical">
            <Form.Item name="name" label="租户名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="plan" label="套餐" rules={[{ required: true }]}>
              <Select options={PLAN_OPTIONS.map((p) => ({ value: p.value, label: p.label }))} />
            </Form.Item>

            <Typography.Title level={5} style={{ marginTop: 16 }}>
              配额配置
            </Typography.Title>
            <Form.Item name={['quota_config', 'daily_token_limit']} label="Token 日限额">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name={['quota_config', 'app_limit']} label="App 数量限制">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name={['quota_config', 'knowledge_base_limit']} label="知识库数量限制">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Typography.Title level={5} style={{ marginTop: 16 }}>
              可用模型
            </Typography.Title>
            <Form.Item name="allowed_models" label="可用模型（多选）">
              <Select mode="tags" placeholder="输入模型名称后回车" style={{ width: '100%' }} />
            </Form.Item>

            <Typography.Title level={5} style={{ marginTop: 16 }}>
              功能开关
            </Typography.Title>
            <Form.Item
              name={['feature_flags', 'rag_enabled']}
              label="RAG（知识库检索增强）"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name={['feature_flags', 'agent_enabled']}
              label="Agent 管理"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name={['feature_flags', 'workflow_enabled']}
              label="Workflow"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name={['feature_flags', 'prompt_management_enabled']}
              label="Prompt 管理"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        )}
      </Drawer>

      {/* ─── View Tenant Drawer ──────────────────────────────────────── */}
      <Drawer title="租户详情" open={!!viewTenant} onClose={() => setViewTenant(null)} width={520}>
        {viewTenant && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID">
                <Text code copyable style={{ fontSize: 11 }}>
                  {viewTenant.id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="名称">{viewTenant.name}</Descriptions.Item>
              <Descriptions.Item label="Slug">
                <Text code>{viewTenant.slug}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="套餐">
                <Tag color={PLAN_OPTIONS.find((p) => p.value === viewTenant.plan)?.color}>
                  {PLAN_OPTIONS.find((p) => p.value === viewTenant.plan)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={STATUS_OPTIONS.find((s) => s.value === viewTenant.status)?.color}>
                  {STATUS_OPTIONS.find((s) => s.value === viewTenant.status)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(viewTenant.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Token 日限额">
                {viewTenant.quota_config?.daily_token_limit?.toLocaleString() ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="App 限制">
                {viewTenant.quota_config?.app_limit ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="知识库限制">
                {viewTenant.quota_config?.knowledge_base_limit ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="可用模型">
                {viewTenant.allowed_models?.length
                  ? viewTenant.allowed_models.map((m) => <Tag key={m}>{m}</Tag>)
                  : '—'}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                block
                onClick={() => {
                  setViewTenant(null);
                  // TODO: 租户用量统计页面待实现
                  message.info('租户用量统计功能开发中');
                }}
              >
                查看用量统计
              </Button>
            </div>
          </>
        )}
      </Drawer>

      {/* ─── Members Drawer ─────────────────────────────────────────── */}
      <Drawer
        title={`成员管理 — ${membersTenant?.name || ''}`}
        open={!!membersTenant}
        onClose={() => setMembersTenant(null)}
        width={720}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setInviteOpen(true)}>
            邀请成员
          </Button>
        }
      >
        <Table<TenantMember>
          columns={memberColumns}
          dataSource={membersData?.items || []}
          rowKey="id"
          loading={membersLoading}
          pagination={{ pageSize: 10 }}
          size="small"
          locale={{
            emptyText: <span style={{ color: 'var(--text-faint)', padding: 24 }}>暂无成员</span>,
          }}
        />
      </Drawer>

      {/* ─── Invite Member Modal ─────────────────────────────────────── */}
      <Modal
        title="邀请成员"
        open={inviteOpen}
        onCancel={() => setInviteOpen(false)}
        onOk={handleInvite}
        confirmLoading={inviteMemberMutation.isPending}
        okText="邀请"
        cancelText="取消"
      >
        <Form form={inviteForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效邮箱' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            initialValue="tenant_developer"
            rules={[{ required: true }]}
          >
            <Select options={MEMBER_ROLES} />
          </Form.Item>
          <Form.Item
            name="send_email"
            label="发送邀请邮件"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminTenants;
