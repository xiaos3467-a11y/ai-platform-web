/** User management — RBAC user CRUD */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Tag, Space, Card, Typography,
  Popconfirm, App, Switch, Badge, Drawer, Descriptions, Avatar,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined,
  KeyOutlined, StopOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';

const { Title } = Typography;

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
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResp, rolesResp] = await Promise.allSettled([
        api.get<{ items: UserItem[]; total: number }>('/users/'),
        api.get<RoleItem[]>('/roles/'),
      ]);
      if (usersResp.status === 'fulfilled') setUsers(usersResp.value.data?.items || []);
      if (rolesResp.status === 'fulfilled') setRoles(rolesResp.value.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (values: any) => {
    try {
      await api.post('/users/', values);
      message.success('用户创建成功');
      setCreateOpen(false);
      form.resetFields();
      fetchData();
    } catch { /* handled by interceptor */ }
  };

  const handleEdit = async (values: any) => {
    if (!editUser) return;
    try {
      await api.put(`/users/${editUser.id}`, values);
      message.success('用户更新成功');
      setEditUser(null);
      editForm.resetFields();
      fetchData();
    } catch { /* handled */ }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/users/${id}`);
    message.success('用户已删除');
    fetchData();
  };

  const handleToggleActive = async (user: UserItem) => {
    await api.put(`/users/${user.id}`, { is_active: !user.is_active });
    message.success(user.is_active ? '已禁用' : '已启用');
    fetchData();
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('输入新密码（至少6位）：');
    if (!newPassword || newPassword.length < 6) {
      message.error('密码至少6位');
      return;
    }
    await api.post(`/users/${userId}/reset-password?new_password=${newPassword}`);
    message.success('密码已重置');
  };

  const columns = [
    { title: '用户', dataIndex: 'username', render: (name: string, record: UserItem) => (
      <Space>
        <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: record.is_superadmin ? '#f5222d' : '#6366f1' }} />
        <a onClick={() => setDetailUser(record)}>
          <strong>{record.display_name || name}</strong>
        </a>
        {record.is_superadmin && <Tag color="red">超管</Tag>}
      </Space>
    )},
    { title: '邮箱', dataIndex: 'email' },
    { title: '角色', dataIndex: 'roles', render: (roles: { name: string }[]) => (
      <Space wrap>{roles?.map(r => <Tag key={r.name} color="blue">{r.name}</Tag>)}</Space>
    )},
    { title: '状态', dataIndex: 'is_active', width: 80, render: (active: boolean, record: UserItem) => (
      <Switch checked={active} onChange={() => handleToggleActive(record)} size="small"
        checkedChildren="启" unCheckedChildren="禁" />
    )},
    { title: '最后登录', dataIndex: 'last_login_at', render: (v: string) => v ? new Date(v).toLocaleString() : '-' },
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    { title: '操作', width: 180, render: (_: unknown, record: UserItem) => (
      <Space>
        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditUser(record); editForm.setFieldsValue({ ...record, role_ids: record.roles.map(r => r.id) }); }} />
        <Button type="text" size="small" icon={<KeyOutlined />} onClick={() => handleResetPassword(record.id)} />
        {!record.is_superadmin && (
          <Popconfirm title="确认删除用户？" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        )}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>用户管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>添加用户</Button>
      </div>

      <Card>
        <Table dataSource={users} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>

      {/* Create Modal */}
      <Modal title="添加用户" open={createOpen} onCancel={() => { setCreateOpen(false); form.resetFields(); }} onOk={() => form.submit()} width={500}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, min: 2 }]}>
            <Input prefix={<UserOutlined />} placeholder="如：zhangsan" />
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
              {roles.map(r => <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title="编辑用户" open={!!editUser} onCancel={() => { setEditUser(null); editForm.resetFields(); }} onOk={() => editForm.submit()}>
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="display_name" label="显示名称"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
          <Form.Item name="phone" label="手机号"><Input /></Form.Item>
          <Form.Item name="is_active" label="启用状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          <Form.Item name="role_ids" label="角色">
            <Select mode="multiple">
              {roles.map(r => <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer title="用户详情" open={!!detailUser} onClose={() => setDetailUser(null)} width={400}>
        {detailUser && (
          <Descriptions column={1}>
            <Descriptions.Item label="用户名">{detailUser.username}</Descriptions.Item>
            <Descriptions.Item label="显示名称">{detailUser.display_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{detailUser.email}</Descriptions.Item>
            <Descriptions.Item label="手机号">{detailUser.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="角色">
              {detailUser.roles.map(r => <Tag key={r.name} color="blue">{r.name}</Tag>)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge status={detailUser.is_active ? 'success' : 'error'} text={detailUser.is_active ? '启用' : '禁用'} />
            </Descriptions.Item>
            <Descriptions.Item label="超级管理员">{detailUser.is_superadmin ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="最后登录">{detailUser.last_login_at ? new Date(detailUser.last_login_at).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(detailUser.created_at).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default Users;
