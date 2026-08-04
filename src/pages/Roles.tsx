/** Role management — Apple glass aesthetic */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Space, Card, Typography,
  App, Checkbox, Divider, Skeleton,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, SafetyOutlined,
  } from '@ant-design/icons';
import { api } from '@/api/client';

const { Title, Text } = Typography;

interface PermissionItem { id: string; resource: string; action: string; description: string | null; }
interface RoleItem {
  id: string; name: string; description: string | null; is_system: boolean;
  permissions: { id: string; resource: string; action: string }[];
  user_count: number; created_at: string;
}

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
  const { message, modal } = App.useApp();

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
    try { await api.post('/roles/', { ...values, permission_ids: selectedPermIds }); message.success('角色创建成功'); setCreateOpen(false); setSelectedPermIds([]); form.resetFields(); fetchData(); } catch { /* */ }
  };

  const handleEdit = async (values: { name?: string; description?: string }) => {
    if (!editRole) return;
    try { await api.put(`/roles/${editRole.id}`, { ...values, permission_ids: selectedPermIds }); message.success('角色更新成功'); setEditRole(null); setSelectedPermIds([]); editForm.resetFields(); fetchData(); } catch { /* */ }
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: '删除角色',
      content: '确认删除此角色？相关用户的权限将受到影响。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => { await api.delete(`/roles/${id}`); message.success('角色已删除'); fetchData(); },
    });
  };

  const resources = [...new Set(permissions.map(p => p.resource))];
  const actions = ['create', 'read', 'update', 'delete', 'execute'];
  const getPermId = (resource: string, action: string) => permissions.find(p => p.resource === resource && p.action === action)?.id;
  const toggleAllForResource = (resource: string, checked: boolean) => {
    const ids = permissions.filter(p => p.resource === resource).map(p => p.id);
    setSelectedPermIds(prev => checked ? [...new Set([...prev, ...ids])] : prev.filter(id => !ids.includes(id)));
  };
  const toggleAllForAction = (action: string, checked: boolean) => {
    const ids = permissions.filter(p => p.action === action).map(p => p.id);
    setSelectedPermIds(prev => checked ? [...new Set([...prev, ...ids])] : prev.filter(id => !ids.includes(id)));
  };
  const toggleAll = (checked: boolean) => { setSelectedPermIds(checked ? permissions.map(p => p.id) : []); };

  const columns = [
    { title: '角色', dataIndex: 'name', render: (name: string, record: RoleItem) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: record.is_system ? 'linear-gradient(135deg, #ff453a, #ff6961)' : 'linear-gradient(135deg, #5e5ce6, #bf5af2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13,
        }}>
          <SafetyOutlined />
        </div>
        <span style={{ fontWeight: 500, color: '#f5f5f7' }}>{name}</span>
        {record.is_system && <span style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(255,69,58,0.1)', border: '0.5px solid rgba(255,69,58,0.2)', fontSize: 11, color: '#ff453a', fontWeight: 500 }}>系统</span>}
      </span>
    )},
    { title: '描述', dataIndex: 'description', render: (v: string) => <span style={{ color: '#a1a1a6', fontSize: 13 }}>{v || '-'}</span> },
    { title: '权限', render: (_: unknown, record: RoleItem) => (
      <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(10,132,255,0.1)', border: '0.5px solid rgba(10,132,255,0.2)', fontSize: 12, color: '#0a84ff', fontWeight: 500 }}>{record.permissions?.length || 0} 项</span>
    )},
    { title: '用户', dataIndex: 'user_count', render: (v: number) => <span style={{ color: '#a1a1a6' }}>{v} 人</span> },
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{new Date(v).toLocaleString()}</span> },
    { title: '', width: 100, render: (_: unknown, record: RoleItem) => (
      <Space>
        <div onClick={() => { setEditRole(record); editForm.setFieldsValue(record); setSelectedPermIds(record.permissions.map(p => p.id)); }}
          style={{ cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#0a84ff'; e.currentTarget.style.background = 'rgba(10,132,255,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
        ><EditOutlined /></div>
        {!record.is_system && (
          <div onClick={() => handleDelete(record.id)}
            style={{ cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.2)', padding: 4, borderRadius: 6, transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ff453a'; e.currentTarget.style.background = 'rgba(255,69,58,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
          ><DeleteOutlined /></div>
        )}
      </Space>
    )},
  ];

  const matrixBorder = 'rgba(255,255,255,0.06)';

  const renderPermissionMatrix = () => (
    <div style={{ overflowX: 'auto', borderRadius: 12, border: `0.5px solid ${matrixBorder}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: `0.5px solid ${matrixBorder}`, minWidth: 120 }}>
              <Checkbox
                checked={selectedPermIds.length === permissions.length && permissions.length > 0}
                indeterminate={selectedPermIds.length > 0 && selectedPermIds.length < permissions.length}
                onChange={e => toggleAll(e.target.checked)}
              />
              <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>资源 / 操作</span>
            </th>
            {actions.map(action => (
              <th key={action} style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `0.5px solid ${matrixBorder}`, width: 80 }}>
                <Checkbox
                  checked={permissions.filter(p => p.action === action).every(p => selectedPermIds.includes(p.id))}
                  indeterminate={permissions.filter(p => p.action === action).some(p => selectedPermIds.includes(p.id)) && !permissions.filter(p => p.action === action).every(p => selectedPermIds.includes(p.id))}
                  onChange={e => toggleAllForAction(action, e.target.checked)}
                />
                <div style={{ marginTop: 4, fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{ACTION_LABELS[action]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((resource, idx) => (
            <tr key={resource} style={{ borderBottom: idx < resources.length - 1 ? `0.5px solid ${matrixBorder}` : 'none' }}>
              <td style={{ padding: '10px 14px' }}>
                <Checkbox
                  checked={permissions.filter(p => p.resource === resource).every(p => selectedPermIds.includes(p.id))}
                  indeterminate={permissions.filter(p => p.resource === resource).some(p => selectedPermIds.includes(p.id)) && !permissions.filter(p => p.resource === resource).every(p => selectedPermIds.includes(p.id))}
                  onChange={e => toggleAllForResource(resource, e.target.checked)}
                />
                <span style={{ marginLeft: 8, fontWeight: 500, color: '#f5f5f7' }}>{RESOURCE_LABELS[resource] || resource}</span>
              </td>
              {actions.map(action => {
                const permId = getPermId(resource, action);
                return (
                  <td key={action} style={{ padding: '10px 14px', textAlign: 'center' }}>
                    {permId ? (
                      <Checkbox checked={selectedPermIds.includes(permId)} onChange={e => {
                        setSelectedPermIds(prev => e.target.checked ? [...prev, permId] : prev.filter(id => id !== permId));
                      }} />
                    ) : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
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
      {/* Page title */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 34, letterSpacing: '-0.04em', color: '#f5f5f7' }}>角色权限</Title>
          <Text style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', marginTop: 6, display: 'block' }}>管理角色与权限矩阵</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setCreateOpen(true); setSelectedPermIds([]); }} style={{ height: 44, paddingInline: 20, borderRadius: 12, fontWeight: 500 }}>
          创建角色
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Card style={{ borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }} styles={{ body: { padding: 24 } }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : (
        <>
          <Card
            className="animate-fade-in-up"
            style={{ borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', marginBottom: 20 }}
            styles={{ body: { padding: 0 } }}
          >
            {roles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'rgba(255,255,255,0.15)' }}>
                  <SafetyOutlined />
                </div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginBottom: 8 }}>还没有角色</div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setCreateOpen(true); setSelectedPermIds([]); }}>创建第一个角色</Button>
              </div>
            ) : (
              <Table dataSource={roles} columns={columns} rowKey="id" pagination={false} />
            )}
          </Card>

          {/* Permission Matrix Preview */}
          <Card
            className="animate-fade-in-up"
            title={<span style={{ fontSize: 17, fontWeight: 600, color: '#f5f5f7' }}>权限矩阵总览</span>}
            style={{ borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
            styles={{ header: { borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '16px 24px', minHeight: 'auto' }, body: { padding: 24 } }}
          >
            <div style={{ overflowX: 'auto', borderRadius: 12, border: `0.5px solid ${matrixBorder}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: `0.5px solid ${matrixBorder}`, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>角色</th>
                    {resources.map(r => <th key={r} style={{ padding: '8px 12px', textAlign: 'center', borderBottom: `0.5px solid ${matrixBorder}`, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{RESOURCE_LABELS[r] || r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role, idx) => (
                    <tr key={role.id} style={{ borderBottom: idx < roles.length - 1 ? `0.5px solid ${matrixBorder}` : 'none' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 500, color: '#f5f5f7' }}>{role.name}</td>
                      {resources.map(r => {
                        const count = role.permissions?.filter(p => p.resource === r).length || 0;
                        return (
                          <td key={r} style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {count > 0 ? (
                              <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(48,209,88,0.1)', border: '0.5px solid rgba(48,209,88,0.2)', fontSize: 11, color: '#30d158', fontWeight: 500 }}>{count}</span>
                            ) : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Create Modal */}
      <Modal title="创建角色" open={createOpen} onCancel={() => { setCreateOpen(false); form.resetFields(); setSelectedPermIds([]); }} onOk={() => form.submit()} width={700} okText="创建" cancelText="取消">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}><Input placeholder="如：数据分析师" /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} placeholder="角色描述..." /></Form.Item>
          <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>权限配置</Divider>
          {renderPermissionMatrix()}
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title="编辑角色" open={!!editRole} onCancel={() => { setEditRole(null); editForm.resetFields(); setSelectedPermIds([]); }} onOk={() => editForm.submit()} width={700} okText="保存" cancelText="取消">
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="name" label="角色名称"><Input disabled={editRole?.is_system} /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>权限配置</Divider>
          {renderPermissionMatrix()}
        </Form>
      </Modal>
    </div>
  );
};

export default Roles;
