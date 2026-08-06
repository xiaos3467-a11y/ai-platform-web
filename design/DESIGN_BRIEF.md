# UI 设计需求文档（Design Brief）

## 项目概述

**项目名称**：AI Platform Web Console（AI 中台管理控制台）  
**产品类型**：企业管理后台（B2B SaaS）  
**目标用户**：企业 IT 管理员、AI 应用开发者、运营人员  
**设计目标**：打造现代化、专业、易用的企业级 AI 管理平台界面

---

## 当前状态

### 技术栈
- **框架**：React 18 + TypeScript
- **组件库**：Ant Design 5
- **样式**：CSS-in-JS（Emotion）+ Design Tokens
- **主题**：Apple 风格（深色/浅色双主题）

### 已完成页面（14 个）
| 路由 | 页面 | 功能描述 |
|------|------|----------|
| `/login` | 登录 | 用户名/密码登录 |
| `/` | 仪表盘 | 平台概览、健康状态、成本趋势图表 |
| `/models` | 模型管理 | LLM Provider CRUD、API Key 加密管理 |
| `/knowledge` | 知识库 | 知识库 CRUD、文档上传、状态追踪 |
| `/agents` | Agent 管理 | Agent CRUD、在线对话测试 |
| `/conversations` | 对话记录 | 会话列表、消息详情查看 |
| `/prompts` | Prompt 管理 | 模板 CRUD、版本历史、渲染预览 |
| `/workflows` | 工作流 | 工作流 CRUD、发布、执行监控 |
| `/evaluations` | 评测中心 | RAG 五维评测、LLM-as-Judge |
| `/costs` | 成本分析 | 成本趋势、模型分布、预算检查 |
| `/users` | 用户管理 | 用户 CRUD、角色分配 |
| `/roles` | 角色权限 | 角色 CRUD、权限配置 |
| `/settings` | 系统设置 | 组件状态、基础设施监控 |
| `/404` | 404 | 页面不存在提示 |

---

## 设计需求

### 1. 整体风格

**参考风格**：
- Apple 官网（简洁、现代、留白充足）
- Linear（专业、高效、深色主题）
- Vercel Dashboard（技术感、信息密度适中）

**设计关键词**：
- ✅ 专业（Professional）
- ✅ 现代（Modern）
- ✅ 简洁（Minimal）
- ✅ 高效（Efficient）
- ✅ 科技感（Tech-forward）

**避免**：
- ❌ 花哨的装饰
- ❌ 过度拟物化
- ❌ 信息过载
- ❌ 低效的交互

---

### 2. 色彩体系

#### 品牌色（Brand Colors）
```
主色（Primary）:
- 深色模式: #0a84ff (Apple Blue)
- 浅色模式: #0071e3

辅助色:
- Success: #30d158 / #34c759
- Warning: #ffd60a / #ff9f0a
- Error:   #ff453a / #ff3b30
- Info:    #0a84ff / #0071e3
```

#### 中性色（Neutral Colors）
```
深色模式:
- 背景: #000000 (纯黑)
- 容器: rgba(255, 255, 255, 0.04)
- 边框: rgba(255, 255, 255, 0.12)
- 主文本: #f5f5f7
- 次文本: #a1a1a6
- 占位符: #48484a

浅色模式:
- 背景: #f5f5f7
- 容器: #ffffff
- 边框: #d2d2d7
- 主文本: #1d1d1f
- 次文本: #6e6e73
- 占位符: #86868b
```

---

### 3. 排版系统（Typography）

**字体**：
```
英文: SF Pro Display / Inter / Helvetica Neue
中文: PingFang SC / Microsoft YaHei
等宽: SF Mono / Monaco / Consolas
```

**字号层级**：
```
H1: 40px / 600 weight / line-height 1.2
H2: 28px / 600 weight / line-height 1.3
H3: 22px / 600 weight / line-height 1.4
H4: 17px / 600 weight / line-height 1.5
Body: 14px / 400 weight / line-height 1.57
Caption: 13px / 400 weight
Small: 12px / 400 weight
```

---

### 4. 间距系统（Spacing）

**基础单位**：4px

```
XS: 4px
SM: 8px
MD: 12px
LG: 16px
XL: 24px
XXL: 32px
```

**常用间距**：
- 卡片内边距: 24px
- 卡片间距: 16px
- 表单字段间距: 16px
- 按钮内边距: 12px 24px

---

### 5. 圆角系统（Border Radius）

```
XS: 6px  (小按钮、标签)
SM: 8px  (输入框、小卡片)
MD: 12px (卡片、模态框)
LG: 16px (大卡片、弹窗)
XL: 20px (特殊组件)
Full: 999px (圆形按钮、头像)
```

---

### 6. 阴影系统（Shadows）

**深色模式**：
```css
/* 基础阴影 */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 
            0 0 1px rgba(255, 255, 255, 0.05);

/* 弹出层阴影 */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 
            0 0 1px rgba(255, 255, 255, 0.08);
```

**浅色模式**：
```css
/* 基础阴影 */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

/* 弹出层阴影 */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
```

---

### 7. 组件库（基于 Ant Design 5）

**必须使用的组件**：
- Layout（布局）: Header / Sider / Content / Footer
- Navigation（导航）: Menu / Breadcrumb / Tabs / Pagination
- Data Entry（数据录入）: Form / Input / Button / Select / Checkbox / Radio / Switch
- Data Display（数据展示）: Table / Card / Statistic / Tag / Badge / Timeline
- Feedback（反馈）: Modal / Drawer / Message / Notification / Alert / Progress
- Other（其他）: Tooltip / Popover / Dropdown / Avatar

**自定义组件**（需要设计）：
- 数据可视化卡片（Dashboard Stats）
- 对话界面（Chat Interface）
- 工作流编辑器（Workflow Editor）
- 知识库文档列表（Document List）
- Prompt 版本对比（Version Diff）

---

## 页面设计优先级

### P0 - 核心页面（必须优先设计）
1. **Dashboard 仪表盘** - 平台概览，第一印象
2. **Chat/Agent 对话界面** - 核心交互场景
3. **Knowledge Base 知识库** - 文档管理核心流程
4. **Model Providers 模型管理** - 配置入口

### P1 - 重要页面
5. **Workflows 工作流** - 复杂交互（需要可视化编辑器）
6. **Prompts 提示词管理** - 版本控制界面
7. **Conversations 对话记录** - 历史查询
8. **Costs 成本分析** - 数据可视化

### P2 - 辅助页面
9. **Users 用户管理** - 标准 CRUD
10. **Roles 角色权限** - 权限配置
11. **Evaluations 评测中心** - 专业功能
12. **Settings 系统设置** - 配置页面
13. **Login 登录** - 简单但重要

---

## 交互设计要求

### 1. 响应式设计
- **桌面端**：1280px - 1920px（主要）
- **平板端**：768px - 1024px（次要）
- **移动端**：375px - 767px（暂不支持）

### 2. 状态设计
每个组件需要设计以下状态：
- Default（默认）
- Hover（悬停）
- Active（激活）
- Disabled（禁用）
- Loading（加载中）
- Error（错误）
- Empty（空状态）

### 3. 动效要求
- **过渡时长**：0.3s（中等）
- **缓动曲线**：cubic-bezier(0.4, 0, 0.2, 1)
- **弹簧动画**：cubic-bezier(0.16, 1, 0.3, 1)

### 4. 反馈机制
- 按钮点击：即时反馈（< 100ms）
- 表单提交：Loading 状态 + 成功/失败提示
- 数据加载：Skeleton 骨架屏
- 长操作：Progress 进度条

---

## 交付物清单

### 1. 设计文件（Figma）
- [ ] 完整设计稿（所有页面）
- [ ] 组件库（Design System）
- [ ] 图标库（Icon Set）
- [ ] 交互原型（Prototype）

### 2. 导出资源
- [ ] 切图（PNG/SVG）
- [ ] 标注（尺寸、颜色、字号）
- [ ] 设计规范文档（Design Spec）

### 3. 交接文件
- [ ] Design Tokens（JSON/CSS Variables）
- [ ] 组件使用说明
- [ ] 交互说明文档

---

## 参考链接

### 竞品参考
- [Linear App](https://linear.app) - 项目管理工具
- [Vercel Dashboard](https://vercel.com/dashboard) - 部署平台
- [Supabase Dashboard](https://supabase.com/dashboard) - 数据库平台
- [OpenAI Platform](https://platform.openai.com) - AI 平台
- [Langchain Studio](https://smith.langchain.com) - LLM 开发平台

### 设计系统参考
- [Ant Design 5](https://ant.design) - 企业级组件库
- [Apple Design Resources](https://developer.apple.com/design/resources) - Apple 设计资源
- [Material Design 3](https://m3.material.io) - Google 设计系统

### 灵感来源
- [Dribbble - Dashboard](https://dribbble.com/shots/popular/dashboard)
- [Behance - Admin Panel](https://www.behance.net/search/projects?field=0&search=admin+panel)

---

## 时间计划

### Phase 1: 设计系统（Week 1）
- [ ] 色彩体系确认
- [ ] 排版系统确认
- [ ] 组件库设计（Button / Input / Card / Table / Modal）
- [ ] 图标库设计

### Phase 2: 核心页面（Week 2-3）
- [ ] Dashboard 仪表盘
- [ ] Chat/Agent 对话界面
- [ ] Knowledge Base 知识库
- [ ] Model Providers 模型管理

### Phase 3: 重要页面（Week 4-5）
- [ ] Workflows 工作流编辑器
- [ ] Prompts 提示词管理
- [ ] Conversations 对话记录
- [ ] Costs 成本分析

### Phase 4: 辅助页面（Week 6）
- [ ] Users / Roles / Settings / Evaluations / Login

---

## 协作流程

```
UI 设计师                          前端开发
    │                                  │
    ├─→ 设计系统（Week 1）              │
    │   └─→ 组件库 + Tokens             │
    │                                  │
    ├─→ 核心页面设计（Week 2）           │
    │   ├─→ Dashboard                  │
    │   └─→ Chat                       ├─→ 前端实现（同步进行）
    │                                  │   ├─→ 调整组件样式
    ├─→ 设计评审 ←─────────────────────┤   └─→ 反馈问题
    │   └─→ 修改优化                    │
    │                                  │
    ├─→ 第二批页面（Week 3-4）           │
    │   ├─→ Knowledge                  │
    │   └─→ Models                     ├─→ 前端实现
    │                                  │
    └─→ 持续迭代                        │
        ├─→ 用户反馈                    │
        └─→ 优化改进                    └─→ 持续优化
```

---

## 联系方式

**项目经理**：[待填写]  
**UI 设计师**：[待填写]  
**前端开发**：[待填写]  
**产品经理**：[待填写]

---

## 附录

### A. 当前主题 Token（已实现）
见 `design/specs/current-theme-tokens.md`

### B. 页面截图（待补充）
UI 设计师启动后，需要获取当前系统截图作为参考。

### C. 用户调研（待补充）
如有用户调研数据，请提供给 UI 设计师参考。
