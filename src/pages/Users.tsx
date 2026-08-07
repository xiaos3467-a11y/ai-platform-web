/** User management — Apple glass aesthetic */

import React, { useEffect, useState, useMemo } from 'react';
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
  Switch,
  Drawer,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  KeyOutlined,
  LockOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import { GlassCard, EmptyState, TableSkeleton } from '@/components';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;

interface UserItem {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  is_active: boolean;
  is_superadmin: boolean;
  roles: { id: string; name: string }[];
  last_login_at: string | null;
  created_at: string;
}
interface RoleItem {
  id: string;
  name: string;
  description: string | null;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [detailUser, setDetailUser] = useState<UserItem | null>(null);
  const [resetPwdUser, setResetPwdUser] = useState<UserItem | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [resetPwdForm] = Form.useForm();
  const { message, modal } = App.useApp();

  const fetchData = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [usersResp, rolesResp] = await Promise.allSettled([
        api.post<{ items: UserItem[]; total: number }>('/users/list', {}, signal),
        api.post<RoleItem[]>('/roles/list', {}, signal),
      ]);
      if (usersResp.status === 'fulfilled') setUsers(usersResp.value.data?.items || []);
      if (rolesResp.status === 'fulfilled') setRoles(rolesResp.value.data || []);
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code?: string }).code === 'ERR_CANCELED'
      )
        return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchData(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  const handleCreate = async (values: {
    username: string;
    email: string;
    password: string;
    display_name?: string;
    phone?: string;
    role_ids?: string[];
  }) => {
    try {
      await api.post('/users/create', values);
      message.success('用户创建成功');
      setCreateOpen(false);
      form.resetFields();
      fetchData();
    } catch {
      /* */
    }
  };

  const handleEdit = async (values: {
    display_name?: string;
    email?: string;
    phone?: string;
    is_active?: boolean;
    role_ids?: string[];
  }) => {
    if (!editUser) return;
    try {
      await api.post('/users/update', { id: editUser.id, ...values });
      message.success('用户更新成功');
      setEditUser(null);
      editForm.resetFields();
      fetchData();
    } catch {
      /* */
    }
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: '删除用户',
      content: '确认删除此用户？此操作不可恢复。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await api.post('/users/delete', { id });
        message.success('用户已删除');
        fetchData();
      },
    });
  };

  const handleToggleActive = async (user: UserItem) => {
    try {
      await api.post('/users/update', { id: user.id, is_active: !user.is_active });
      message.success(user.is_active ? '已禁用' : '已启用');
      fetchData();
    } catch {
      /* */
    }
  };

  const handleResetPassword = async (values: {
    new_password: string;
    confirm_password: string;
  }) => {
    if (!resetPwdUser) return;
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的密码不一致');
      return;
    }
    try {
      await api.post(`/users/reset-password`, {
        id: resetPwdUser.id,
        new_password: values.new_password,
      });
      message.success('密码已重置');
      setResetPwdUser(null);
      resetPwdForm.resetFields();
    } catch {
      /* */
    }
  };

  const columns = useMemo(
    () => [
      {
        title: '用户',
        dataIndex: 'username',
        render: (name: string, record: UserItem) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: radius.md,
                background: record.is_superadmin
                  ? 'linear-gradient(135deg, #ff453a, #ff6961)'
                  : 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {(record.display_name || name).charAt(0).toUpperCase()}
            </div>
            <span>
              <a
                onClick={() => setDetailUser(record)}
                style={{ fontWeight: 500, color: 'var(--text-primary)' }}
              >
                {record.display_name || name}
              </a>
              {record.is_superadmin && (
                <span
                  style={{
                    marginLeft: 6,
                    padding: '1px 6px',
                    borderRadius: radius.sm,
                    background: 'rgba(255,69,58,0.1)',
                    border: '0.5px solid rgba(255,69,58,0.2)',
                    fontSize: 11,
                    color: '#ff453a',
                    fontWeight: 500,
                  }}
                >
                  超管
                </span>
              )}
            </span>
          </span>
        ),
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        render: (v: string) => <span style={{ color: 'var(--text-soft)', fontSize: 13 }}>{v}</span>,
      },
      {
        title: '角色',
        dataIndex: 'roles',
        render: (roles: { name: string }[]) => (
          <Space wrap size={4}>
            {roles?.map((r) => (
              <span
                key={r.name}
                style={{
                  padding: '2px 8px',
                  borderRadius: radius.sm,
                  background: 'rgba(10,132,255,0.1)',
                  border: '0.5px solid rgba(10,132,255,0.2)',
                  fontSize: 12,
                  color: '#0a84ff',
                  fontWeight: 500,
                }}
              >
                {r.name}
              </span>
            ))}
          </Space>
        ),
      },
      {
        title: '状态',
        dataIndex: 'is_active',
        width: 80,
        render: (active: boolean, record: UserItem) => (
          <Switch checked={active} onChange={() => handleToggleActive(record)} size="small" />
        ),
      },
      {
        title: '最后登录',
        dataIndex: 'last_login_at',
        render: (v: string) => (
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {v ? new Date(v).toLocaleString() : '-'}
          </span>
        ),
      },
      {
        title: '操作',
        width: 120,
        render: (_: unknown, record: UserItem) => (
          <Space>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              aria-label="编辑"
              onClick={() => {
                setEditUser(record);
                editForm.setFieldsValue({ ...record, role_ids: record.roles.map((r) => r.id) });
              }}
            />
            <Button
              type="text"
              size="small"
              icon={<KeyOutlined />}
              aria-label="重置密码"
              onClick={() => {
                setResetPwdUser(record);
                resetPwdForm.resetFields();
              }}
            />
            {!record.is_superadmin && (
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                aria-label="删除"
                danger
                onClick={() => handleDelete(record.id)}
              />
            )}
          </Space>
        ),
      },
    ],
    [roles],
  );

  return (
    <div>
      {/* Page title */}
      <div
        className="animate-fade-in-up"
        style={{
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
            }}
          >
            用户管理
          </Title>
          <Text
            style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 6, display: 'block' }}
          >
            管理系统用户与权限分配
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
          style={{ height: 44, paddingInline: 20, borderRadius: radius.md, fontWeight: 500 }}
        >
          添加用户
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <GlassCard animate styles={{ body: { padding: 0 } }}>
          {users.length === 0 ? (
            <EmptyState
              icon={<TeamOutlined />}
              title="还没有用户"
              description="添加用户来使用系统功能"
              actionText="添加第一个用户"
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            <Table dataSource={users} columns={columns} rowKey="id" pagination={{ pageSize: 15 }} />
          )}
        </GlassCard>
      )}

      {/* Create Modal */}
      <Modal
        title="添加用户"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={500}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, min: 2 }]}>
            <Input
              prefix={<UserOutlined style={{ color: 'var(--text-faint)' }} />}
              placeholder="如：zhangsan"
            />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="user@company.com" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="至少6位" />
          </Form.Item>
          <Form.Item name="display_name" label="显示名称">
            <Input placeholder="如：张三" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="13800138000" />
          </Form.Item>
          <Form.Item name="role_ids" label="角色">
            <Select mode="multiple" placeholder="选择角色">
              {roles.map((r) => (
                <Select.Option key={r.id} value={r.id}>
                  {r.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="编辑用户"
        open={!!editUser}
        onCancel={() => {
          setEditUser(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="display_name" label="显示名称">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="is_active" label="启用状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          <Form.Item name="role_ids" label="角色">
            <Select mode="multiple">
              {roles.map((r) => (
                <Select.Option key={r.id} value={r.id}>
                  {r.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {detailUser && (
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: radius.md,
                  background: detailUser.is_superadmin
                    ? 'linear-gradient(135deg, #ff453a, #ff6961)'
                    : 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {(detailUser.display_name || detailUser.username).charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              用户详情
            </span>
          </div>
        }
        open={!!detailUser}
        onClose={() => setDetailUser(null)}
        width={400}
      >
        {detailUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: '用户名', value: detailUser.username },
              { label: '显示名称', value: detailUser.display_name || '-' },
              { label: '邮箱', value: detailUser.email },
              { label: '手机号', value: detailUser.phone || '-' },
              { label: '超级管理员', value: detailUser.is_superadmin ? '是' : '否' },
              {
                label: '最后登录',
                value: detailUser.last_login_at
                  ? new Date(detailUser.last_login_at).toLocaleString()
                  : '-',
              },
              { label: '创建时间', value: new Date(detailUser.created_at).toLocaleString() },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 14px',
                  borderRadius: radius.sm,
                  background: 'var(--bg-subtle)',
                  border: '0.5px solid var(--border-divider)',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {item.value}
                </span>
              </div>
            ))}
            <div
              style={{
                padding: '8px 14px',
                borderRadius: radius.sm,
                background: 'var(--bg-subtle)',
                border: '0.5px solid var(--border-divider)',
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                角色
              </div>
              <Space wrap size={4}>
                {detailUser.roles.map((r) => (
                  <span
                    key={r.name}
                    style={{
                      padding: '2px 8px',
                      borderRadius: radius.sm,
                      background: 'rgba(10,132,255,0.1)',
                      border: '0.5px solid rgba(10,132,255,0.2)',
                      fontSize: 12,
                      color: '#0a84ff',
                      fontWeight: 500,
                    }}
                  >
                    {r.name}
                  </span>
                ))}
              </Space>
            </div>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: radius.sm,
                background: detailUser.is_active ? 'rgba(48,209,88,0.04)' : 'rgba(255,69,58,0.04)',
                border: `0.5px solid ${detailUser.is_active ? 'rgba(48,209,88,0.12)' : 'rgba(255,69,58,0.12)'}`,
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                状态
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: detailUser.is_active ? '#30d158' : '#ff453a',
                }}
              >
                {detailUser.is_active ? '启用' : '禁用'}
              </span>
            </div>
          </div>
        )}
      </Drawer>

      {/* Reset Password Modal */}
      <Modal
        title={`重置密码 — ${resetPwdUser?.username || ''}`}
        open={!!resetPwdUser}
        onCancel={() => {
          setResetPwdUser(null);
          resetPwdForm.resetFields();
        }}
        onOk={() => resetPwdForm.submit()}
        okText="重置"
        cancelText="取消"
      >
        <Form form={resetPwdForm} layout="vertical" onFinish={handleResetPassword}>
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-faint)' }} />}
              placeholder="至少 6 位"
            />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="确认新密码"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-faint)' }} />}
              placeholder="再次输入新密码"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
