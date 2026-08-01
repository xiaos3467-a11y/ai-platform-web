# AI Platform — Web Console (管理控制台)

基于 React + TypeScript + Ant Design 的企业管理控制台。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3001)
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Ant Design 5 | 组件库 |
| React Router 6 | 路由 |
| Zustand | 状态管理 |
| Axios | HTTP 客户端 |
| Recharts | 图表 |

## 页面

| 路由 | 页面 | 功能 |
|------|------|------|
| `/` | 仪表盘 | 平台概览、健康状态、成本趋势图表 |
| `/models` | 模型管理 | Provider CRUD、API Key 加密管理 |
| `/knowledge` | 知识库 | 知识库 CRUD、文档上传、状态追踪 |
| `/agents` | Agent 管理 | Agent CRUD、在线对话测试 |
| `/conversations` | 对话记录 | 会话列表、消息详情 |
| `/prompts` | Prompt 管理 | 模板 CRUD、版本历史、渲染预览 |
| `/workflows` | 工作流 | 工作流 CRUD、发布、执行 |
| `/evaluations` | 评测中心 | RAG 五维评测、LLM-as-Judge |
| `/costs` | 成本分析 | 成本趋势、模型分布、预算检查 |
| `/settings` | 系统设置 | 组件状态、基础设施、API Key 说明 |

## 开发代理

开发模式下 `/api` 请求自动代理到 `http://localhost:8000`（后端服务）。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `/api/v1` |

## 部署

### Vercel

1. Fork 此仓库
2. 在 Vercel 导入项目
3. 设置环境变量 `VITE_API_BASE_URL`（可选，留空则通过 vercel.json rewrite 转发）
4. 自动构建部署
