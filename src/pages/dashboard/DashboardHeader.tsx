/**
 * DashboardHeader — page title + export / new-model buttons.
 * Uses the shared PageHeader component for consistency.
 */

import React from 'react';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import Button from '@/components/Button';
import { PageHeader } from '@/components';

const DashboardHeader: React.FC = () => (
  <PageHeader
    title="仪表盘"
    subtitle="AI 平台运行概览 · 数据更新于 2 分钟前"
    breadcrumb={[{ label: '仪表盘' }]}
    extra={
      <>
        <Button variant="secondary" icon={<DownloadOutlined />}>
          导出
        </Button>
        <Button variant="primary" icon={<PlusOutlined />}>
          新建模型
        </Button>
      </>
    }
  />
);

export default DashboardHeader;
