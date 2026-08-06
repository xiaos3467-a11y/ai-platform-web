# 页面清单

> 所有需要设计的页面列表，按优先级排序

---

## P0 - 核心页面（必须优先设计）

### 1. Dashboard 仪表盘
- **路由**：`/`
- **功能**：平台概览、健康状态、成本趋势图表
- **关键元素**：
  - 统计卡片（4-6 个关键指标）
  - 折线图/柱状图（成本趋势、调用量趋势）
  - 健康状态指示器（组件状态）
  - 快速操作入口
- **交互**：
  - 数字变化动画
  - 图表悬停提示
  - 时间范围切换
- **截图位置**：`exports/screenshots/dashboard.png`
- **状态**：⏳ 待设计

---

### 2. Chat/Agent 对话界面
- **路由**：`/agents` → 选择 Agent → 对话
- **功能**：与 AI Agent 实时对话，支持工具调用
- **关键元素**：
  - 对话列表侧边栏
  - 消息气泡（用户/AI/系统）
  - 消息输入框（多行/附件）
  - 工具调用展示（参数/结果/状态）
- **交互**：
  - 流式输出（打字机效果）
  - 消息发送动画
  - 工具调用展开/收起
  - 代码块语法高亮
- **截图位置**：`exports/screenshots/chat.png`
- **状态**：⏳ 待设计

---

### 3. Knowledge Base 知识库
- **路由**：`/knowledge`
- **功能**：管理知识库，上传文档，查看状态
- **关键元素**：
  - 知识库列表（卡片/列表视图）
  - 文档上传界面（拖拽/进度）
  - 文档详情（分块预览）
  - 知识库配置
- **交互**：
  - 视图切换
  - 拖拽上传
  - 上传进度实时更新
  - 文档状态指示
- **截图位置**：`exports/screenshots/knowledge.png`
- **状态**：⏳ 待设计

---

### 4. Model Providers 模型管理
- **路由**：`/models`
- **功能**：管理 LLM Provider，配置 API Key
- **关键元素**：
  - Provider 卡片（Logo/状态/模型列表）
  - API Key 输入（密码模式）
  - 模型配置表单
  - 健康检查指示器
- **交互**：
  - API Key 显示/隐藏
  - 连接测试
  - 模型参数实时预览
- **截图位置**：`exports/screenshots/models.png`
- **状态**：⏳ 待设计

---

## P1 - 重要页面

### 5. Workflows 工作流
- **路由**：`/workflows`
- **功能**：创建和编辑 AI 工作流（DAG）
- **关键元素**：
  - 工作流画布（节点/连线）
  - 节点类型（LLM/RAG/HTTP/条件/并行）
  - 节点配置面板
  - 执行监控界面
- **交互**：
  - 节点拖拽
  - 连线动画
  - 实时执行状态
  - 变量管理
- **截图位置**：`exports/screenshots/workflows.png`
- **状态**：⏳ 待设计

---

### 6. Prompts 提示词管理
- **路由**：`/prompts`
- **功能**：管理 Prompt 模板，版本控制
- **关键元素**：
  - 模板列表（卡片视图）
  - 版本历史（时间线）
  - 版本对比（Diff）
  - 模板编辑器
- **交互**：
  - 变量自动补全
  - 实时渲染预览
  - 版本回滚
- **截图位置**：`exports/screenshots/prompts.png`
- **状态**：⏳ 待设计

---

### 7. Conversations 对话记录
- **路由**：`/conversations`
- **功能**：查看所有对话历史
- **关键元素**：
  - 对话列表（表格/卡片）
  - 消息详情查看
  - 搜索和筛选
  - 导出功能
- **交互**：
  - 分页加载
  - 消息详情抽屉
  - 批量操作
- **截图位置**：`exports/screenshots/conversations.png`
- **状态**：⏳ 待设计

---

### 8. Costs 成本分析
- **路由**：`/costs`
- **功能**：查看成本趋势，分析模型消耗
- **关键元素**：
  - 成本统计卡片
  - 折线图（成本趋势）
  - 饼图（模型分布）
  - 预算告警
- **交互**：
  - 时间范围切换
  - 图表下钻
  - 数据导出
- **截图位置**：`exports/screenshots/costs.png`
- **状态**：⏳ 待设计

---

## P2 - 辅助页面

### 9. Users 用户管理
- **路由**：`/users`
- **功能**：管理系统用户
- **关键元素**：
  - 用户列表（表格）
  - 用户表单（创建/编辑）
  - 角色分配
- **交互**：
  - 标准 CRUD
  - 批量操作
- **截图位置**：`exports/screenshots/users.png`
- **状态**：⏳ 待设计

---

### 10. Roles 角色权限
- **路由**：`/roles`
- **功能**：管理角色和权限
- **关键元素**：
  - 角色列表
  - 权限树（Tree 组件）
  - 用户关联
- **交互**：
  - 权限勾选
  - 角色复制
- **截图位置**：`exports/screenshots/roles.png`
- **状态**：⏳ 待设计

---

### 11. Evaluations 评测中心
- **路由**：`/evaluations`
- **功能**：RAG 评测，LLM-as-Judge
- **关键元素**：
  - 评测任务列表
  - 评测结果详情
  - 五维雷达图
  - 对比分析
- **交互**：
  - 创建评测任务
  - 查看评测报告
- **截图位置**：`exports/screenshots/evaluations.png`
- **状态**：⏳ 待设计

---

### 12. Settings 系统设置
- **路由**：`/settings`
- **功能**：系统配置和监控
- **关键元素**：
  - 组件状态监控
  - 基础设施状态
  - 系统配置
- **交互**：
  - 健康检查
  - 配置修改
- **截图位置**：`exports/screenshots/settings.png`
- **状态**：⏳ 待设计

---

### 13. Login 登录
- **路由**：`/login`
- **功能**：用户登录
- **关键元素**：
  - 登录表单
  - 品牌 Logo
  - 背景设计
- **交互**：
  - 表单验证
  - 登录动画
- **截图位置**：`exports/screenshots/login.png`
- **状态**：⏳ 待设计

---

### 14. 404 页面
- **路由**：`/404`
- **功能**：页面不存在提示
- **关键元素**：
  - 插画
  - 返回首页按钮
- **交互**：
  - 简单跳转
- **截图位置**：`exports/screenshots/404.png`
- **状态**：⏳ 待设计

---

## 截图任务清单

### 深色模式截图
- [ ] Dashboard (Dark)
- [ ] Chat (Dark)
- [ ] Knowledge Base (Dark)
- [ ] Model Providers (Dark)
- [ ] Workflows (Dark)
- [ ] Prompts (Dark)
- [ ] Conversations (Dark)
- [ ] Costs (Dark)
- [ ] Users (Dark)
- [ ] Roles (Dark)
- [ ] Evaluations (Dark)
- [ ] Settings (Dark)
- [ ] Login (Dark)
- [ ] 404 (Dark)

### 浅色模式截图
- [ ] Dashboard (Light)
- [ ] Chat (Light)
- [ ] Knowledge Base (Light)
- [ ] Model Providers (Light)
- [ ] Workflows (Light)
- [ ] Prompts (Light)
- [ ] Conversations (Light)
- [ ] Costs (Light)
- [ ] Users (Light)
- [ ] Roles (Light)
- [ ] Evaluations (Light)
- [ ] Settings (Light)
- [ ] Login (Light)
- [ ] 404 (Light)

---

## 设计优先级总结

| 优先级 | 页面数量 | 预计工期 | 状态 |
|--------|----------|----------|------|
| P0 | 4 页 | Week 2-3 | ⏳ 待开始 |
| P1 | 4 页 | Week 4-5 | ⏳ 待开始 |
| P2 | 6 页 | Week 6 | ⏳ 待开始 |
| **总计** | **14 页** | **5 周** | - |

---

## 下一步

1. **确认 UI 设计师人选**
2. **准备当前系统截图**（启动系统，截图所有页面）
3. **UI 设计师启动 Phase 1：设计系统**
4. **按优先级开始页面设计**

---

**最后更新**：2026-08-05
