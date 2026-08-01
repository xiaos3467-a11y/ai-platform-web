/** Cost analysis */

import React, { useEffect, useState } from 'react';
import {
  Card, Typography, Row, Col, Statistic, Table, Tag, Space, DatePicker,
  Progress, InputNumber, Button, App, Select,
} from 'antd';
import {
  DollarOutlined, ThunderboltOutlined, AlertOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { api } from '@/api/client';
import type { CostSummary, DailyCost } from '@/types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const Costs: React.FC = () => {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [daily, setDaily] = useState<DailyCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(100);
  const [budgetResult, setBudgetResult] = useState<{
    monthly_budget_usd: number;
    spent_usd: number;
    remaining_usd: number;
    usage_percentage: number;
    alerts: string[];
  } | null>(null);
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryResp, dailyResp] = await Promise.allSettled([
        api.get<CostSummary>('/costs/summary'),
        api.get<DailyCost[]>('/costs/daily?days=30'),
      ]);
      if (summaryResp.status === 'fulfilled') setSummary(summaryResp.value.data);
      if (dailyResp.status === 'fulfilled') setDaily(dailyResp.value.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const checkBudget = async () => {
    try {
      const resp = await api.post<typeof budgetResult>('/costs/budget-check', {
        monthly_budget_usd: budget,
      });
      setBudgetResult(resp.data);
    } catch {
      message.error('预算检查失败');
    }
  };

  const modelData = summary
    ? Object.entries(summary.by_model).map(([name, data]) => ({
        name, ...data,
      }))
    : [];

  const modelPieData = modelData.map((m) => ({
    name: m.name.length > 12 ? m.name.slice(0, 12) + '…' : m.name,
    value: m.cost_usd,
  }));

  const modelColumns = [
    { title: '模型', dataIndex: 'name', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '请求数', dataIndex: 'requests', render: (v: number) => v?.toLocaleString() },
    { title: '输入 Token', dataIndex: 'input_tokens', render: (v: number) => v?.toLocaleString() },
    { title: '输出 Token', dataIndex: 'output_tokens', render: (v: number) => v?.toLocaleString() },
    { title: '成本 (USD)', dataIndex: 'cost_usd', render: (v: number) => (
      <span style={{ fontWeight: 600, color: '#6366f1' }}>${v?.toFixed(4)}</span>
    )},
    { title: '占比', render: (_: unknown, record: typeof modelData[0]) => {
      const total = summary?.total_cost_usd || 1;
      const pct = ((record.cost_usd || 0) / total * 100);
      return <Progress percent={pct} size="small" style={{ width: 100 }} />;
    }},
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>成本分析</Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="本月总成本"
              value={summary?.total_cost_usd ?? 0}
              precision={4}
              prefix={<DollarOutlined />}
              suffix="USD"
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总 Token 消耗"
              value={(summary?.total_input_tokens ?? 0) + (summary?.total_output_tokens ?? 0)}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总请求数"
              value={summary?.total_requests ?? 0}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Cost Trend Chart */}
        <Col xs={24} lg={16}>
          <Card title="每日成本趋势（近30天）" style={{ marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="estimated_cost_usd" name="成本 (USD)" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                <Area yAxisId="right" type="monotone" dataKey="requests" name="请求数" stroke="#22c55e" fill="#22c55e" fillOpacity={0.05} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Model Cost Pie */}
        <Col xs={24} lg={8}>
          <Card title="模型成本分布" style={{ marginBottom: 16 }}>
            {modelPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={modelPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {modelPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toFixed(4)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>暂无数据</div>
            )}
          </Card>
        </Col>

        {/* Model Breakdown Table */}
        <Col xs={24}>
          <Card title="模型成本明细" style={{ marginBottom: 16 }}>
            <Table dataSource={modelData} columns={modelColumns} rowKey="name" pagination={false} size="small" />
          </Card>
        </Col>

        {/* Token Trend */}
        <Col xs={24}>
          <Card title="每日 Token 消耗">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="input_tokens" name="输入 Token" fill="#8b5cf6" stackId="a" />
                <Bar dataKey="output_tokens" name="输出 Token" fill="#06b6d4" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Budget Check */}
        <Col xs={24} lg={12}>
          <Card title="预算检查">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <span>月度预算 (USD)：</span>
                <InputNumber value={budget} onChange={(v) => setBudget(v || 0)} min={1} style={{ width: 150 }} />
                <Button type="primary" onClick={checkBudget} icon={<AlertOutlined />}>检查</Button>
              </Space>
              {budgetResult && (
                <div>
                  <Progress
                    percent={budgetResult.usage_percentage}
                    strokeColor={budgetResult.usage_percentage >= 80 ? '#ff4d4f' : '#6366f1'}
                    format={(pct) => `${pct?.toFixed(1)}%`}
                  />
                  <Descriptions column={1} size="small" style={{ marginTop: 12 }}>
                    <Descriptions.Item label="预算">${budgetResult.monthly_budget_usd}</Descriptions.Item>
                    <Descriptions.Item label="已花费">${budgetResult.spent_usd}</Descriptions.Item>
                    <Descriptions.Item label="剩余">
                      <span style={{ color: budgetResult.remaining_usd > 0 ? '#52c41a' : '#ff4d4f' }}>
                        ${budgetResult.remaining_usd}
                      </span>
                    </Descriptions.Item>
                  </Descriptions>
                  {budgetResult.alerts.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {budgetResult.alerts.map((a, i) => (
                        <Tag key={i} color="error" icon={<AlertOutlined />}>{a}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Costs;
