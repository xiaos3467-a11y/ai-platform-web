/** Evaluation center */

import React, { useState } from 'react';
import {
  Card, Typography, Button, Form, Input, InputNumber, Select, Space,
  Table, Tag, App, Progress, Descriptions, Divider, Row, Col, Statistic,
} from 'antd';
import { ExperimentOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { api } from '@/api/client';
import type { EvalRunResult, EvalSampleResult, EvalMetric } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const metricLabels: Record<string, string> = {
  faithfulness: '忠实度',
  answer_relevancy: '答案相关性',
  context_precision: '上下文精确度',
  context_recall: '上下文召回率',
  answer_correctness: '答案正确性',
};

const scoreColor = (score: number) => {
  if (score >= 0.8) return '#52c41a';
  if (score >= 0.6) return '#faad14';
  if (score >= 0) return '#ff4d4f';
  return '#d9d9d9';
};

const Evaluations: React.FC = () => {
  const [form] = Form.useForm();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<EvalRunResult | null>(null);
  const { message } = App.useApp();

  const handleRun = async (values: {
    dataset_name: string;
    questions: string;
    contexts: string;
    expected_answers: string;
    judge_model: string;
    generate_model: string;
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
    } catch {
      message.error('评测失败');
    } finally { setRunning(false); }
  };

  const metricColumns = [
    { title: '指标', dataIndex: 'metric', render: (v: string) => metricLabels[v] || v },
    { title: '分数', dataIndex: 'score', render: (v: number) => (
      <Progress percent={Math.round(v * 100)} size="small" strokeColor={scoreColor(v)} style={{ width: 120 }} />
    )},
    { title: '原因', dataIndex: 'reason', ellipsis: true },
  ];

  const sampleColumns = [
    { title: '#', dataIndex: 'sample_index', width: 50, render: (v: number) => v + 1 },
    { title: '问题', dataIndex: 'question', ellipsis: true },
    { title: '生成答案', dataIndex: 'generated_answer', ellipsis: true },
    { title: '综合评分', dataIndex: 'overall_score', width: 100, render: (v: number) => (
      <Tag color={scoreColor(v)}>{(v * 100).toFixed(1)}%</Tag>
    )},
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>评测中心</Title>

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <Card title="运行评测" style={{ marginBottom: 16 }}>
            <Form form={form} layout="vertical" onFinish={handleRun}>
              <Form.Item name="dataset_name" label="数据集名称" initialValue="手动评测集" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="questions" label="问题（每行一个）" rules={[{ required: true }]}>
                <TextArea rows={4} placeholder={"什么是AI？\n公司年假怎么算？"} />
              </Form.Item>
              <Form.Item name="contexts" label="参考上下文（用 --- 分隔）">
                <TextArea rows={3} placeholder={"AI是人工智能的缩写\n---\n公司年假制度..."}/>
              </Form.Item>
              <Form.Item name="expected_answers" label="期望答案（每行一个，可选）">
                <TextArea rows={3} placeholder={"AI是Artificial Intelligence\n公司年假按工龄计算..."} />
              </Form.Item>
              <Form.Item name="judge_model" label="裁判模型" initialValue="gpt-4o">
                <Select>
                  <Select.Option value="gpt-4o">GPT-4o</Select.Option>
                  <Select.Option value="qwen-max">Qwen Max</Select.Option>
                  <Select.Option value="claude-sonnet-4-20250514">Claude Sonnet</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="generate_model" label="被评测模型" initialValue="qwen-max">
                <Select>
                  <Select.Option value="qwen-max">Qwen Max</Select.Option>
                  <Select.Option value="gpt-4o">GPT-4o</Select.Option>
                  <Select.Option value="deepseek-chat">DeepSeek Chat</Select.Option>
                </Select>
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlayCircleOutlined />} loading={running} block>
                运行评测
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          {result ? (
            <>
              <Card title="评测结果总览" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="数据集">{result.dataset_name}</Descriptions.Item>
                  <Descriptions.Item label="模型">{result.model}</Descriptions.Item>
                  <Descriptions.Item label="样本数">{result.completed_samples}/{result.total_samples}</Descriptions.Item>
                  <Descriptions.Item label="耗时">{result.duration_seconds}s</Descriptions.Item>
                </Descriptions>
                <Divider />
                <Row gutter={16}>
                  {Object.entries(result.aggregate_scores).map(([metric, score]) => (
                    <Col span={8} key={metric} style={{ marginBottom: 16 }}>
                      <Statistic
                        title={metricLabels[metric] || metric}
                        value={score * 100}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: scoreColor(score) }}
                      />
                    </Col>
                  ))}
                </Row>
              </Card>

              <Card title="样本详情" size="small">
                <Table
                  dataSource={result.sample_results}
                  columns={sampleColumns}
                  rowKey="sample_index"
                  size="small"
                  pagination={false}
                  expandable={{
                    expandedRowRender: (record: EvalSampleResult) => (
                      <Table
                        dataSource={record.metrics}
                        columns={metricColumns}
                        rowKey="metric"
                        size="small"
                        pagination={false}
                      />
                    ),
                  }}
                />
              </Card>
            </>
          ) : (
            <Card style={{ textAlign: 'center', padding: 100 }}>
              <ExperimentOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <div style={{ color: '#999' }}>配置左侧表单，运行评测查看结果</div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Evaluations;
