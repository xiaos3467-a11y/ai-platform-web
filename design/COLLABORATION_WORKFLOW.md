# UI ↔ 前端协作流程

## 工作模式

**并行协作**：UI 设计师出图的同时，前端开发同步调整代码实现。

```
时间线 →

Week 1:  [UI: 设计系统] ──────────────────────────────────
         [前端: 组件库重构] ──────────────────────────────
         
Week 2:  [UI: Dashboard + Chat] ──────────────────────────
         [前端: Dashboard + Chat 实现] ────────────────────
         
Week 3:  [UI: Knowledge + Models] ────────────────────────
         [前端: Knowledge + Models 实现] ──────────────────
         
Week 4:  [UI: Workflows + Prompts] ───────────────────────
         [前端: Workflows + Prompts 实现] ─────────────────
```

---

## 协作流程详解

### Phase 1: 设计系统（Week 1）

#### UI 设计师任务
```
□ 创建 Figma 项目
□ 定义色彩体系（基于 current-theme-tokens.md）
□ 定义排版系统
□ 设计基础组件：
  - Button（主要/次要/文字/图标）
  - Input（文本/数字/搜索/多行）
  - Select（单选/多选/级联）
  - Card（基础/可折叠/可拖拽）
  - Table（基础/可排序/可筛选）
  - Modal（确认/表单/详情）
  - Drawer（侧边栏）
  - Menu（侧边栏/顶部/上下文）
□ 设计图标库（20-30 个常用图标）
□ 创建组件文档
```

#### 前端开发任务
```
□ 创建 theme.ts 配置文件（导入新 Token）
□ 重构 Button 组件样式
□ 重构 Input 组件样式
□ 重构 Card 组件样式
□ 重构 Table 组件样式
□ 重构 Modal/Drawer 组件样式
□ 创建 Icon 组件（替换 @ant-design/icons）
□ 编写组件使用文档
```

#### 交接节点
```
交付物：
- Figma 设计系统文件链接
- Design Tokens JSON 文件
- 组件使用说明文档

验收标准：
- 前端实现与设计稿像素级一致
- 所有组件状态完整（default/hover/active/disabled/loading/error）
- 深色/浅色双主题支持
```

---

### Phase 2: 核心页面（Week 2-3）

#### 页面 1: Dashboard 仪表盘

**UI 设计师**：
```
□ 设计统计卡片（4-6 个关键指标）
□ 设计图表组件（折线图/柱状图/饼图）
□ 设计健康状态指示器
□ 设计快速操作入口
□ 设计响应式布局（1280px / 1440px / 1920px）
```

**前端开发**：
```
□ 实现统计卡片组件（AnimatedNumber）
□ 集成 Recharts 图表库
□ 实现健康状态指示器
□ 实现快速操作菜单
□ 响应式适配
```

**交互要点**：
- 数字变化动画（countUp）
- 图表悬停提示（Tooltip）
- 时间范围切换（1h / 24h / 7d / 30d）
- 刷新按钮（手动刷新数据）

---

#### 页面 2: Chat/Agent 对话界面

**UI 设计师**：
```
□ 设计对话气泡（用户/AI/系统）
□ 设计消息输入框（多行/附件/快捷操作）
□ 设计工具调用展示（参数/结果/状态）
□ 设计流式输出效果（打字机效果）
□ 设计对话列表侧边栏
□ 设计空状态和加载状态
```

**前端开发**：
```
□ 实现消息气泡组件（支持 Markdown 渲染）
□ 实现流式文本渲染（打字机效果）
□ 实现工具调用展示组件
□ 实现消息输入框（自动高度/快捷键）
□ 实现对话列表侧边栏
□ 实现虚拟滚动（大量消息）
```

**交互要点**：
- 消息发送动画
- 流式输出平滑滚动
- 工具调用展开/收起
- 代码块语法高亮
- 消息复制/重新生成
- 对话切换动画

---

#### 页面 3: Knowledge Base 知识库

**UI 设计师**：
```
□ 设计知识库列表（卡片/列表视图切换）
□ 设计文档上传界面（拖拽/进度/状态）
□ 设计文档详情（分块预览/元数据）
□ 设计知识库配置（Embedding 模型/分块策略）
□ 设计搜索和筛选界面
```

**前端开发**：
```
□ 实现视图切换（卡片/列表）
□ 实现拖拽上传组件
□ 实现上传进度条
□ 实现文档详情抽屉
□ 实现分块预览（代码高亮）
□ 实现搜索和筛选
```

**交互要点**：
- 拖拽上传视觉反馈
- 上传进度实时更新
- 文档状态指示（处理中/就绪/失败）
- 分块点击高亮原文
- 批量操作（删除/导出）

---

#### 页面 4: Model Providers 模型管理

**UI 设计师**：
```
□ 设计 Provider 卡片（Logo/状态/模型列表）
□ 设计 API Key 输入（密码模式/测试按钮）
□ 设计模型配置表单（参数/权重）
□ 设计健康检查指示器
□ 设计负载均衡配置界面
```

**前端开发**：
```
□ 实现 Provider 卡片组件
□ 实现 API Key 安全输入
□ 实现模型配置表单（动态字段）
□ 实现健康检查轮询
□ 实现实时状态指示器
```

**交互要点**：
- API Key 显示/隐藏切换
- 连接测试 Loading 状态
- 模型参数实时预览
- Provider 启用/禁用动画

---

### Phase 3: 重要页面（Week 4-5）

#### 页面 5: Workflows 工作流

**UI 设计师**：
```
□ 设计工作流画布（节点/连线/网格）
□ 设计节点类型（LLM/RAG/HTTP/条件/并行）
□ 设计节点配置面板（侧边栏）
□ 设计执行监控界面（实时状态/日志）
□ 设计变量管理界面
```

**前端开发**：
```
□ 集成 React Flow 画布库
□ 实现自定义节点组件
□ 实现节点配置面板
□ 实现执行监控（WebSocket 实时更新）
□ 实现变量编辑器
```

**交互要点**：
- 节点拖拽创建
- 连线动画
- 节点配置自动保存
- 执行进度实时展示
- 错误节点高亮

---

#### 页面 6: Prompts 提示词管理

**UI 设计师**：
```
□ 设计模板列表（卡片视图）
□ 设计版本历史（时间线）
□ 设计版本对比（Diff 视图）
□ 设计模板编辑器（变量高亮/预览）
□ 设计渲染测试界面
```

**前端开发**：
```
□ 实现模板卡片组件
□ 实现版本时间线
□ 集成 Monaco Editor（代码编辑）
□ 实现变量高亮
□ 实现实时渲染预览
□ 实现 Diff 对比视图
```

**交互要点**：
- 变量自动补全
- 实时渲染预览
- 版本回滚
- 模板导入/导出

---

### Phase 4: 辅助页面（Week 6）

**UI 设计师**：
```
□ Users 用户管理
□ Roles 角色权限
□ Evaluations 评测中心
□ Costs 成本分析
□ Settings 系统设置
□ Login 登录
□ 404 页面
```

**前端开发**：
```
□ 标准 CRUD 页面实现
□ 权限树组件
□ 评测结果可视化
□ 成本图表
□ 系统状态监控
```

---

## 沟通机制

### 1. 每日站会（15 分钟）

```
时间：每天 10:00
参与：UI 设计师 + 前端开发
内容：
- 昨天完成了什么
- 今天计划做什么
- 遇到什么问题
- 需要对方配合什么
```

### 2. 设计评审（每周一次）

```
时间：每周五 14:00
参与：UI 设计师 + 前端开发 + 产品经理
内容：
- 本周设计成果展示
- 前端实现效果对比
- 问题反馈和调整
- 下周计划确认
```

### 3. 即时沟通

```
工具：飞书/钉钉/Slack
规则：
- 设计问题：UI 设计师 @前端开发
- 实现问题：前端开发 @UI 设计师
- 紧急问题：直接电话/视频会议
- 重要决策：邮件确认
```

---

## 文件组织

### 设计文件结构

```
design/
├── figma/                          # Figma 源文件
│   ├── ai-platform-design.fig
│   └── component-library.fig
├── exports/                        # 导出的资源
│   ├── screenshots/                # 页面截图
│   │   ├── dashboard-dark.png
│   │   ├── dashboard-light.png
│   │   └── ...
│   ├── icons/                      # 图标（SVG）
│   │   ├── icon-dashboard.svg
│   │   ├── icon-chat.svg
│   │   └── ...
│   └── illustrations/              # 插画（空状态等）
│       ├── empty-state.svg
│       └── error-state.svg
├── specs/                          # 设计规范文档
│   ├── current-theme-tokens.md     # 当前主题 Token
│   ├── color-system.md             # 色彩系统
│   ├── typography.md               # 排版系统
│   ├── spacing.md                  # 间距系统
│   └── component-specs/            # 组件规范
│       ├── button.md
│       ├── input.md
│       └── ...
├── assets/                         # 静态资源
│   ├── logo/
│   └── fonts/
└── DESIGN_BRIEF.md                 # 设计需求文档
```

### 前端文件结构

```
src/
├── components/                     # 基础组件
│   ├── ui/                         # UI 组件（按设计稿实现）
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Card/
│   │   └── ...
│   └── business/                   # 业务组件
│       ├── ChatBubble/
│       ├── WorkflowNode/
│       └── ...
├── styles/
│   ├── theme.ts                    # 主题配置
│   ├── tokens.ts                   # Design Tokens
│   └── global.css                  # 全局样式
└── pages/                          # 页面（按设计稿重构）
    ├── Dashboard/
    │   ├── Dashboard.tsx
    │   ├── Dashboard.module.css
    │   └── components/
    ├── Chat/
    └── ...
```

---

## 验收标准

### 设计验收

```
□ 像素级还原（间距误差 ≤ 2px）
□ 色彩准确（使用 Design Tokens）
□ 排版一致（字号/字重/行高）
□ 圆角统一（遵循设计系统）
□ 阴影正确（深色/浅色模式）
□ 状态完整（default/hover/active/disabled/loading/error/empty）
□ 响应式适配（1280px / 1440px / 1920px）
□ 深色/浅色双主题支持
```

### 交互验收

```
□ 动画流畅（60fps）
□ 过渡自然（符合设计曲线）
□ 反馈及时（< 100ms）
□ 加载状态明确
□ 错误处理友好
□ 空状态有引导
```

### 性能验收

```
□ 首屏加载 < 2s
□ 页面切换 < 300ms
□ 滚动流畅（无卡顿）
□ 大数据量不卡顿（虚拟滚动）
```

---

## 常见问题

### Q1: 设计稿和 Ant Design 组件冲突怎么办？

**A**: 优先使用 Ant Design 组件，通过 Design Tokens 调整样式。如果 Ant Design 无法满足，再自定义组件。

### Q2: 前端实现时发现设计不合理怎么办？

**A**: 立即反馈给 UI 设计师，共同讨论解决方案。必要时调整设计。

### Q3: 设计稿还没完成，前端可以先做什么？

**A**: 
1. 重构基础组件（Button/Input/Card 等）
2. 调整全局样式（色彩/排版/间距）
3. 实现通用逻辑（API 调用/状态管理）
4. 准备数据 Mock

### Q4: 如何保证深色/浅色双主题一致？

**A**: 
1. UI 设计师同时设计两套主题
2. 前端使用 CSS Variables 实现主题切换
3. 所有颜色使用 Token，不硬编码

### Q5: 设计稿交付格式是什么？

**A**: 
- Figma 文件链接（主要）
- 切图导出（PNG/SVG）
- Design Tokens JSON
- 组件使用文档

---

## 工具和资源

### 设计工具
- **Figma**：UI 设计（推荐）
- **Sketch**：备选
- **Adobe XD**：备选

### 前端工具
- **React**：UI 框架
- **TypeScript**：类型安全
- **Ant Design 5**：组件库
- **Emotion**：CSS-in-JS
- **Recharts**：图表库
- **React Flow**：工作流画布
- **Monaco Editor**：代码编辑器

### 协作工具
- **飞书/钉钉**：即时沟通
- **Figma**：设计协作
- **GitHub**：代码管理
- **Vercel**：预览部署

---

## 下一步

1. **确认 UI 设计师人选**
2. **创建 Figma 项目**
3. **启动 Phase 1: 设计系统**
4. **建立每日站会机制**
5. **准备当前系统截图（供参考）**

---

## 附录

### A. 当前页面截图清单

需要截图的页面（供 UI 设计师参考）：
- [ ] Dashboard（深色/浅色）
- [ ] Chat 对话界面
- [ ] Knowledge Base 列表
- [ ] Document 上传
- [ ] Model Providers
- [ ] Workflows 编辑器
- [ ] Prompts 管理
- [ ] 其他页面...

### B. 竞品参考截图

- [ ] Linear Dashboard
- [ ] Vercel Dashboard
- [ ] Supabase Dashboard
- [ ] OpenAI Platform

### C. 设计资源链接

- [Figma 设计系统模板](https://www.figma.com/community/file/896758808980616684)
- [Ant Design 5 Figma Kit](https://www.figma.com/community/file/1063892447872658883)
- [Apple Design Resources](https://developer.apple.com/design/resources)
