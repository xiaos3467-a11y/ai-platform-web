/** Tenant settings — basic info, notifications, security */

import React, { useEffect } from 'react';
import { Typography, Form, Input, InputNumber, Button, App, Divider, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { GlassCard, TableSkeleton } from '@/components';
import type { TenantSettings, TenantSettingsUpdateRequest } from '@/types';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;
const { TextArea } = Input;

const TenantSettingsPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const { data: settings, isLoading } = useApiQuery<TenantSettings>({
    queryKey: ['tenant', 'settings'],
    endpoint: '/tenant/self',
  });

  const updateMutation = useApiMutation<TenantSettings, TenantSettingsUpdateRequest>({
    method: 'put',
    endpoint: '/tenant/self',
    invalidateKeys: [['tenant', 'settings']],
    onSuccess: () => {
      message.success('设置已保存');
    },
  });

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        name: settings.name,
        description: settings.description,
        notification_email: settings.notification_email,
        quota_alert_threshold: settings.quota_alert_threshold,
        global_ip_whitelist: settings.global_ip_whitelist?.join(', ') || '',
        default_api_key_expiry_days: settings.default_api_key_expiry_days,
      });
    }
  }, [settings, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const payload: TenantSettingsUpdateRequest = {
        ...values,
        global_ip_whitelist: values.global_ip_whitelist
          ? values.global_ip_whitelist
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
      };
      updateMutation.mutate(payload);
    });
  };

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
          租户设置
        </Title>
        <Text type="secondary">配置租户基本信息、通知和安全选项</Text>
      </div>

      <GlassCard
        style={{
          padding: 24,
          borderRadius: radius.lg,
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border-subtle)',
        }}
      >
        <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
          <Title level={5}>基本信息</Title>
          <Form.Item
            name="name"
            label="租户名称"
            rules={[{ required: true, message: '请输入租户名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="租户描述" />
          </Form.Item>

          <Divider />

          <Title level={5}>通知设置</Title>
          <Form.Item
            name="notification_email"
            label="告警通知邮箱"
            rules={[{ type: 'email', message: '请输入有效邮箱' }]}
          >
            <Input placeholder="alerts@example.com" />
          </Form.Item>
          <Form.Item
            name="quota_alert_threshold"
            label="配额告警阈值（%）"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>

          <Divider />

          <Title level={5}>安全设置</Title>
          <Form.Item name="global_ip_whitelist" label="全局 IP 白名单">
            <TextArea
              rows={2}
              placeholder="逗号分隔 IP 地址，留空表示不限制"
            />
          </Form.Item>
          <Form.Item name="default_api_key_expiry_days" label="API Key 默认过期天数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0 表示永不过期" />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={updateMutation.isPending}
              >
                保存设置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </GlassCard>
    </>
  );
};

export default TenantSettingsPage;
