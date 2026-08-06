# AI Platform Web - 设计资源

> UI 设计稿、设计规范、组件库、图标等资源

---

## 📁 目录结构

```
design/
├── README.md                           # 本文件
├── DESIGN_BRIEF.md                     # UI 设计需求文档（给设计师的 Brief）
├── DESIGN_SYSTEM.md                    # 完整设计系统文档（v1.0）
├── COLLABORATION_WORKFLOW.md           # UI ↔ 前端协作流程
├── PAGE_INVENTORY.md                   # 页面清单
│
├── figma/                              # Figma 设计文件
│   ├── ai-platform-design.fig         # 完整设计稿
│   └── component-library.fig          # 组件库
│
├── exports/                            # 导出的资源
│   ├── icons/                          # 图标（SVG）
│   ├── illustrations/                  # 插画（空状态等）
│   └── swatches/                       # 颜色样本
│
├── specs/                              # 设计规范文档
│   ├── design-tokens.json              # Design Tokens (JSON)
│   ├── current-theme-tokens.md         # 当前主题 Token（已实现）
│   └── components/                     # 组件规范（逐个交付）
│       └── stat-card.md                # ✅ StatCard 组件规范
│
└── assets/                             # 静态资源
    ├── logo/                           # Logo 文件
    └── fonts/                          # 字体文件
```

---

## 🎯 快速开始

### 给 UI 设计师

1. **阅读需求文档**
   - [DESIGN_BRIEF.md](./DESIGN_BRIEF.md) - 了解项目背景和需求
   - [COLLABORATION_WORKFLOW.md](./COLLABORATION_WORKFLOW.md) - 了解协作流程

2. **参考现有实现**
   - [current-theme-tokens.md](./specs/current-theme-tokens.md) - 当前已实现的主题 Token
   - 访问线上系统：[待填写] - 查看当前功能

3. **开始设计**
   - 创建 Figma 项目
   - 先设计设计系统（色彩/排版/组件）
   - 再设计具体页面

### 给前端开发

1. **了解设计流程**
   - [COLLABORATION_WORKFLOW.md](./COLLABORATION_WORKFLOW.md) - 协作流程
   - 与设计保持沟通

2. **准备重构**
   - 创建 `theme.ts` 配置文件
   - 准备 Design Tokens 导入
   - 准备组件库重构

3. **按设计稿实现**
   - 优先实现设计系统（组件库）
   - 再实现具体页面
   - 保持与设计同步

---

## 📋 设计状态

### Phase 1: 设计系统（Week 1）
- [x] 设计系统文档 (`DESIGN_SYSTEM.md`)
- [x] Design Tokens (`specs/design-tokens.json`)
- [x] 色彩体系 — Apple 系统色板 + CSS Variables
- [x] 排版系统 — SF Pro + Inter
- [x] 间距系统 — 4px 基础单位
- [x] 圆角系统 — 6px → 999px
- [x] 阴影系统 — 5 级高度
- [x] 动效规范 — Apple spring curves
- [x] 深色/浅色双主题 — CSS Variables 切换

### Phase 2: 组件规范（增量交付）
- [x] **StatCard** (`specs/components/stat-card.md`) ✅ — 渐变图标 + 动画数值 + hover 上浮
- [ ] SectionCard — ⏳ 等待 StatCard 反馈
- [ ] GlassCard
- [ ] Button (primary/secondary/ghost/danger)
- [ ] EmptyState
- [ ] StatusPill / HealthPill
- [ ] AnimatedNumber

### Phase 3: 核心页面（Week 2-3）
- [ ] Dashboard 仪表盘
- [ ] Agent 对话界面
- [ ] Knowledge Base 知识库
- [ ] Model Providers 模型管理

### Phase 4: 重要页面（Week 4-5）
- [ ] Workflows 工作流编辑器
- [ ] Prompts 提示词管理
- [ ] Conversations 对话记录
- [ ] Costs 成本分析

---

## 🎨 设计原则

### 关键词
- **专业**（Professional）- 企业级产品，体现专业性
- **现代**（Modern）- 现代设计语言，符合当下审美
- **简洁**（Minimal）- 去除冗余，突出核心功能
- **高效**（Efficient）- 减少操作步骤，提升效率
- **科技感**（Tech-forward）- 体现 AI 技术特性

### 参考风格
- Apple 官网（简洁、留白、精致）
- Linear（专业、高效、深色主题）
- Vercel Dashboard（技术感、信息密度适中）

### 避免
- ❌ 花哨的装饰
- ❌ 过度拟物化
- ❌ 信息过载
- ❌ 低效的交互

---

## 📚 相关文档

### 需求文档
- [DESIGN_BRIEF.md](./DESIGN_BRIEF.md) - 设计需求文档
- [COLLABORATION_WORKFLOW.md](./COLLABORATION_WORKFLOW.md) - 协作流程

### 规范文档
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - 完整设计系统 (v1.0)
- [design-tokens.json](./specs/design-tokens.json) - Design Tokens JSON
- [stat-card.md](./specs/components/stat-card.md) - StatCard 组件规范 ✅
- [current-theme-tokens.md](./specs/current-theme-tokens.md) - 当前主题 Token 源码分析

### 技术文档
- [README.md](../README.md) - 项目说明
- [src/styles/themeTokens.ts](../src/styles/themeTokens.ts) - 主题 Token 源码

---

## 🔗 资源链接

### 设计工具
- [Figma](https://www.figma.com) - UI 设计工具
- [Figma 设计系统模板](https://www.figma.com/community/file/896386453094488292)
- [Ant Design 5 Figma Kit](https://www.figma.com/community/file/1063892447872658883)

### 设计灵感
- [Dribbble - Dashboard](https://dribbble.com/shots/popular/dashboard)
- [Behance - Admin Panel](https://www.behance.net/search/projects?field=0&search=admin+panel)
- [Awwwards - Dashboard](https://www.awwwards.com/websites/dashboard/)

### 竞品参考
- [Linear App](https://linear.app) - 项目管理工具
- [Vercel Dashboard](https://vercel.com/dashboard) - 部署平台
- [Supabase Dashboard](https://supabase.com/dashboard) - 数据库平台
- [OpenAI Platform](https://platform.openai.com) - AI 平台
- [Langchain Studio](https://smith.langchain.com) - LLM 开发平台

### 设计系统参考
- [Ant Design 5](https://ant.design) - 企业级组件库
- [Apple Design Resources](https://developer.apple.com/design/resources)
- [Material Design 3](https://m3.material.io)

---

## 📞 联系方式

**项目经理**：[待填写]  
**UI 设计师**：[待填写]  
**前端开发**：[待填写]  
**产品经理**：[待填写]

---

## 📝 更新日志

### 2026-08-05 (PM)
- ✅ 创建 `DESIGN_SYSTEM.md` — 完整设计系统文档 (色彩/排版/间距/圆角/阴影/动效)
- ✅ 更新 `design-tokens.json` — 新增渐变系统、CSS Variables、StatCard tokens
- ✅ 创建 `specs/components/stat-card.md` — StatCard 组件详细设计规范
- ✅ 实现 StatCard 组件改进 — 新增 AnimatedNumber + 趋势指示器 + hover 增强
- ✅ 新增组件: `AnimatedNumber`, `GradientIcon`, `Button` (4 variants)
- ✅ 更新 `global.css` — 新增渐变 tokens + typing dots + float 动画优化
- ✅ 更新 `themeTokens.ts` — 完善 light mode tokens (Input shadow, Select bg, etc.)
- ⏳ 等待前端反馈后继续 SectionCard 规范

### 2026-08-05
- ✅ 创建设计目录结构
- ✅ 编写 DESIGN_BRIEF.md（设计需求文档）
- ✅ 编写 COLLABORATION_WORKFLOW.md（协作流程）
- ✅ 提取 current-theme-tokens.md（当前主题 Token）
- ⏳ 等待 UI 设计师启动

---

## 💡 常见问题

### Q: 设计稿存放在哪里？
A: Figma 文件链接会放在 `figma/` 目录下，导出资源放在 `exports/` 目录下。

### Q: 如何获取当前系统的截图？
A: 前端开发启动系统后，截图放在 `exports/screenshots/` 目录下。

### Q: 设计稿如何交付给前端？
A: 
1. Figma 文件链接（主要）
2. 切图导出（PNG/SVG）
3. Design Tokens JSON
4. 组件使用文档

### Q: 前端实现时发现问题怎么办？
A: 立即通过飞书/钉钉反馈给 UI 设计师，必要时开视频会议讨论。

### Q: 设计评审多久一次？
A: 每周一次（周五 14:00），有紧急问题随时沟通。

---

## 🚀 下一步

1. **确认 UI 设计师人选**
2. **创建 Figma 项目**
3. **启动 Phase 1: 设计系统**
4. **建立每日站会机制**
5. **准备当前系统截图**

---

**最后更新**：2026-08-05
