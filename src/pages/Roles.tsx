/** Role management — RBAC roles + permission matrix */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Tag, Space, Card, Typography,
  Popconfirm, App, Checkbox, Divider, Descriptions, Row, Col,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, SafetyOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';

const { Title, Text } = Typography;

interface PermissionItem {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: { id: string; resource: string; action: string }[];
  user_count: number;
  created_at: string;
}

// Permission matrix: resource → actions
const RESOURCE_LABELS: Record<string, string> = {
  chat: '对话', conversation: '会话', knowledge_base: '知识库', document: '文档',
  agent: 'Agent', tool: '工具', workflow: '工作流', prompt: 'Prompt 模板',
  model_provider: '模型提供商', evaluation: '评测', cost: '成本',
  user: '用户', role: '角色', tenant: '租户', audit_log: '审计日志',
};

const ACTION_LABELS: Record<string, string> = {
  create: '创建', read: '查看', update: '编辑', delete: '删除', execute: '执行',
};

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleItem | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesResp, permsResp] = await Promise.allSettled([
        api.get<RoleItem[]>('/roles/'),
        api.get<PermissionItem[]>('/roles/permissions'),
      ]);
      if (rolesResp.status === 'fulfilled') setRoles(rolesResp.value.data || []);
      if (permsResp.status === 'fulfilled') setPermissions(permsResp.value.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (values: { name: string; description?: string }) => {
    await api.post('/roles/', { ...values, permission_ids: selectedPermIds });
    message.success('角色创建成功');
    setCreateOpen(false);
    setSelectedPermIds([]);
    form.resetFields();
    fetchData();
  };

  const handleEdit = async (values: { name?: string; description?: string }) => {
    if (!editRole) return;
    await api.put(`/roles/${editRole.id}`, { ...values, permission_ids: selectedPermIds });
    message.success('角色更新成功');
    setEditRole(null);
    setSelectedPermIds([]);
    editForm.resetFields();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/roles/${id}`);
    message.success('角色已删除');
    fetchData();
  };

  // Build permission matrix grouped by resource
  const resources = [...new Set(permissions.map(p => p.resource))];
  const actions = ['create', 'read', 'update', 'delete', 'execute'];

  const getPermId = (resource: string, action: string) =>
    permissions.find(p => p.resource === resource && p.action === action)?.id;

  const toggleAllForResource = (resource: string, checked: boolean) => {
    const ids = permissions.filter(p => p.resource === resource).map(p => p.id);
    setSelectedPermIds(prev =>
      checked ? [...new Set([...prev, ...ids])] : prev.filter(id => !ids.includes(id))
    );
  };

  const toggleAllForAction = (action: string, checked: boolean) => {
    const ids = permissions.filter(p => p.action === action).map(p => p.id);
    setSelectedPermIds(prev =>
      checked ? [...new Set([...prev, ...ids])] : prev.filter(id => !ids.includes(id))
    );
  };

  const toggleAll = (checked: boolean) => {
    setSelectedPermIds(checked ? permissions.map(p => p.id) : []);
  };

  const columns = [
    { title: '角色', dataIndex: 'name', render: (name: string, record: RoleItem) => (
      <Space>
        <SafetyOutlined style={{ color: record.is_system ? '#f5222d' : '#6366f1' }} />
        <strong>{name}</strong>
        {record.is_system && <Tag color="red">系统</Tag>}
      </Space>
    )},
    { title: '描述', dataIndex: 'description', render: (v: string) => v || '-' },
    { title: '权限数', render: (_: unknown, record: RoleItem) => (
      <Tag color="blue">{record.permissions?.length || 0} 项</Tag>
    )},
    { title: '用户数', dataIndex: 'user_count', render: (v: number) => (
      <Tag>{v} 人</Tag>
    )},
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    { title: '操作', width: 150, render: (_: unknown, record: RoleItem) => (
      <Space>
        <Button type="text" size="small" icon={<EditOutlined />}
          onClick={() => {
            setEditRole(record);
            editForm.setFieldsValue(record);
            setSelectedPermIds(record.permissions.map(p => p.id));
          }}
        />
        {!record.is_system && (
          <Popconfirm title="确认删除角色？" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        )}
      </Space>
    )},
  ];

  const renderPermissionMatrix = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #f0f0f0', minWidth: 120 }}>
              <Checkbox
                checked={selectedPermIds.length === permissions.length && permissions.length > 0}
                indeterminate={selectedPermIds.length > 0 && selectedPermIds.length < permissions.length}
                onChange={e => toggleAll(e.target.checked)}
              />
              <span style={{ marginLeft: 8 }}>资源 / 操作</span>
            </th>
            {actions.map(action => (
              <th key={action} style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '2px solid #f0f0f0', width: 80 }}>
                <Checkbox
                  checked={permissions.filter(p => p.action === action).every(p => selectedPermIds.includes(p.id))}
                  indeterminate={
                    permissions.filter(p => p.action === action).some(p => selectedPermIds.includes(p.id)) &&
                    !permissions.filter(p => p.action === action).every(p => selectedPermIds.includes(p.id))
                  }
                  onChange={e => toggleAllForAction(action, e.target.checked)}
                />
                <div style={{ marginTop: 4, fontWeight: 500 }}>{ACTION_LABELS[action]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map(resource => (
            <tr key={resource} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '8px 12px' }}>
                <Checkbox
                  checked={permissions.filter(p => p.resource === resource).every(p => selectedPermIds.includes(p.id))}
                  indeterminate={
                    permissions.filter(p => p.resource === resource).some(p => selectedPermIds.includes(p.id)) &&
                    !permissions.filter(p => p.resource === resource).every(p => selectedPermIds.includes(p.id))
                  }
                  onChange={e => toggleAllForResource(resource, e.target.checked)}
                />
                <span style={{ marginLeft: 8, fontWeight: 500 }}>{RESOURCE_LABELS[resource] || resource}</span>
              </td>
              {actions.map(action => {
                const permId = getPermId(resource, action);
                return (
                  <td key={action} style={{ padding: '8px 12px', textAlign: 'center' }}>
                    {permId ? (
                      <Checkbox
                        checked={selectedPermIds.includes(permId)}
                        onChange={e => {
                          setSelectedPermIds(prev =>
                            e.target.checked ? [...prev, permId] : prev.filter(id => id !== permId)
                          );
                        }}
                      />
                    ) : <Text type="secondary">-</Text>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>角色权限管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setCreateOpen(true); setSelectedPermIds([]); }}>创建角色</Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Table dataSource={roles} columns={columns} rowKey="id" loading={loading} pagination={false} />
      </Card>

      {/* Permission Matrix Preview */}
      <Card title="权限矩阵总览" size="small">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '6px 10px', textAlign: 'left' }}>角色</th>
                {resources.map(r => <th key={r} style={{ padding: '6px 10px', textAlign: 'center', fontSize: 11 }}>{RESOURCE_LABELS[r] || r}</th>)}
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '6px 10px', fontWeight: 500 }}>{role.name}</td>
                  {resources.map(r => {
                    const count = role.permissions?.filter(p => p.resource === r).length || 0;
                    return (
                      <td key={r} style={{ padding: '6px 10px', textAlign: 'center' }}>
                        {count > 0 ? <Tag color="green">{count}</Tag> : <Text type="secondary">-</Text>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal title="创建角色" open={createOpen} onCancel={() => { setCreateOpen(false); form.resetFields(); setSelectedPermIds([]); }} onOk={() => form.submit()} width={700}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}><Input placeholder="如：数据分析师" /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          <Divider>权限配置</Divider>
          {renderPermissionMatrix()}
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title="编辑角色" open={!!editRole} onCancel={() => { setEditRole(null); editForm.resetFields(); setSelectedPermIds([]); }} onOk={() => editForm.submit()} width={700}>
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="name" label="角色名称"><Input disabled={editRole?.is_system} /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          <Divider>权限配置</Divider>
          {renderPermissionMatrix()}
        </Form>
      </Modal>
    </div>
  );
};

export default Roles;
