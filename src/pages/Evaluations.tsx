/** Evaluation center — Apple glass aesthetic */

import React, { useState } from 'react';
import {
  Typography, Button, Form, Input, Select, Table,
  App, Row, Col,
} from 'antd';
import { ExperimentOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { api } from '@/api/client';
import type { EvalRunResult, EvalSampleResult } from '@/types';
import { SectionCard, EmptyState } from '@/components';

const { Title, Text } = Typography;
const { TextArea } = Input;

const metricLabels: Record<string, string> = {
  faithfulness: '忠实度', answer_relevancy: '答案相关性',
  context_precision: '上下文精确度', context_recall: '上下文召回率',
  answer_correctness: '答案正确性',
};

const scoreColor = (score: number) => {
  if (score >= 0.8) return '#30d158';
  if (score >= 0.6) return '#ffd60a';
  if (score >= 0) return '#ff453a';
  return '#6e6e73';
};

/* ─── Score ring ──────────────────────────────────────────────────── */
const ScoreRing: React.FC<{ score: number; size?: number; label: string }> = ({ score, size = 80, label }) => {
  const pct = Math.round(score * 100);
  const color = scoreColor(score);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto 8px' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color }}>
          {pct}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{label}</div>
    </div>
  );
};

/* ─── Main ────────────────────────────────────────────────────────── */
const Evaluations: React.FC = () => {
  const [form] = Form.useForm();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<EvalRunResult | null>(null);
  const { message } = App.useApp();

  const handleRun = async (values: {
    dataset_name: string; questions: string; contexts: string; expected_answers: string;
    judge_model: string; generate_model: string;
  }) => {
    setRunning(true);
    try {
      const questions = values.questions.split('\n').filter(Boolean);
      const contexts = values.contexts.split('\n---\n').filter(Boolean);
      const expected = values.expected_answers.split('\n').filter(Boolean);
      const samples = questions.map((q, i) => ({
        question: q.trim(),
        expected_answer: expected[i]?.trim() || null,
        contexts: contexts[i] ? [contexts[i].trim()] : [],
      }));
      const resp = await api.post<EvalRunResult>('/evaluations/run', {
        dataset: { name: values.dataset_name, samples },
        judge_model: values.judge_model,
        generate_model: values.generate_model,
      });
      setResult(resp.data);
      message.success(`评测完成：${resp.data?.completed_samples}/${resp.data?.total_samples} 个样本`);
    } catch { message.error('评测失败'); } finally { setRunning(false); }
  };

  const metricColumns = [
    { title: '指标', dataIndex: 'metric', render: (v: string) => <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{metricLabels[v] || v}</span> },
    { title: '分数', dataIndex: 'score', width: 100, render: (v: number) => (
      <span style={{ fontWeight: 600, color: scoreColor(v) }}>{(v * 100).toFixed(1)}%</span>
    )},
    { title: '原因', dataIndex: 'reason', ellipsis: true, render: (v: string) => <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{v}</span> },
  ];

  const sampleColumns = [
    { title: '#', dataIndex: 'sample_index', width: 50, render: (v: number) => <span style={{ color: 'var(--text-muted)' }}>{v + 1}</span> },
    { title: '问题', dataIndex: 'question', ellipsis: true },
    { title: '生成答案', dataIndex: 'generated_answer', ellipsis: true, render: (v: string) => <span style={{ color: 'var(--text-dim)' }}>{v}</span> },
    { title: '评分', dataIndex: 'overall_score', width: 80, render: (v: number) => (
      <span style={{ fontWeight: 600, color: scoreColor(v) }}>{(v * 100).toFixed(1)}%</span>
    )},
  ];

  return (
    <div>
      {/* Page title */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 34, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>评测中心</Title>
        <Text style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 6, display: 'block' }}>RAG 与 LLM 输出质量评估</Text>
      </div>

      <Row gutter={20}>
        {/* Form */}
        <Col xs={24} lg={10}>
          <SectionCard title="运行评测">
            <Form form={form} layout="vertical" onFinish={handleRun}>
              <Form.Item name="dataset_name" label="数据集名称" initialValue="手动评测集" rules={[{ required: true }]}>
                <Input placeholder="评测集名称" />
              </Form.Item>
              <Form.Item name="questions" label="问题（每行一个）" rules={[{ required: true }]}>
                <TextArea rows={4} placeholder={"什么是AI？\n公司年假怎么算？"} style={{ borderRadius: 10 }} />
              </Form.Item>
              <Form.Item name="contexts" label="参考上下文（用 --- 分隔）">
                <TextArea rows={3} placeholder={"AI是人工智能的缩写\n---\n公司年假制度..."} style={{ borderRadius: 10 }} />
              </Form.Item>
              <Form.Item name="expected_answers" label="期望答案（每行一个，可选）">
                <TextArea rows={3} placeholder={"AI是Artificial Intelligence\n..."} style={{ borderRadius: 10 }} />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="judge_model" label="裁判模型" initialValue="gpt-4o">
                    <Select>
                      <Select.Option value="gpt-4o">GPT-4o</Select.Option>
                      <Select.Option value="qwen-max">Qwen Max</Select.Option>
                      <Select.Option value="claude-sonnet-4-20250514">Claude Sonnet</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="generate_model" label="被评测模型" initialValue="qwen-max">
                    <Select>
                      <Select.Option value="qwen-max">Qwen Max</Select.Option>
                      <Select.Option value="gpt-4o">GPT-4o</Select.Option>
                      <Select.Option value="deepseek-chat">DeepSeek Chat</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" icon={<PlayCircleOutlined />} loading={running} block style={{ height: 44, borderRadius: 12, fontWeight: 500, fontSize: 15 }}>
                运行评测
              </Button>
            </Form>
          </SectionCard>
        </Col>

        {/* Results */}
        <Col xs={24} lg={14}>
          {result ? (
            <>
              {/* Score overview */}
              <SectionCard title="评测结果总览" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 20, marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'var(--bg-subtle)', border: '0.5px solid var(--border-divider)' }}>
                  {[
                    { label: '数据集', value: result.dataset_name },
                    { label: '模型', value: result.model },
                    { label: '样本', value: `${result.completed_samples}/${result.total_samples}` },
                    { label: '耗时', value: `${result.duration_seconds}s` },
                  ].map((item) => (
                    <div key={item.label} style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
                  {Object.entries(result.aggregate_scores).map(([metric, score]) => (
                    <ScoreRing key={metric} score={score} label={metricLabels[metric] || metric} />
                  ))}
                </div>
              </SectionCard>

              {/* Sample details */}
              <SectionCard title="样本详情">
                <Table
                  dataSource={result.sample_results}
                  columns={sampleColumns}
                  rowKey="sample_index"
                  size="small"
                  pagination={false}
                  expandable={{
                    expandedRowRender: (record: EvalSampleResult) => (
                      <Table dataSource={record.metrics} columns={metricColumns} rowKey="metric" size="small" pagination={false} />
                    ),
                  }}
                />
              </SectionCard>
            </>
          ) : (
            <SectionCard title="评测结果">
              <EmptyState
                icon={<ExperimentOutlined />}
                title="配置左侧表单，运行评测"
                description="评测结果将在此处展示"
              />
            </SectionCard>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Evaluations;
