# StatCard 组件设计规范

> **组件路径**: `src/components/StatCard.tsx`
> **版本**: 1.0.0 · **状态**: ✅ 已实现
> **依赖**: `AnimatedNumber`, Ant Design `Card`, `Typography`

---

## 1. 组件概述

StatCard 是平台核心的数据展示组件，用于在 Dashboard、Costs 等页面中展示关键指标。
采用 Apple Numbers 风格：大字体数值 + 渐变图标 + 毛玻璃背景 + 悬停动效。

### 设计目标

| 目标 | 实现 |
|------|------|
| 一眼可读 | 36px 大数值，tabular-nums 对齐 |
| 视觉层次 | 标签 13px → 数值 36px → 图标 44px |
| 品牌一致 | 使用全局 CSS 变量和渐变系统 |
| 交互反馈 | hover 上浮 + 阴影加深 |
| 数据动效 | 数值从 0 动画递增到目标值 |

---

## 2. 解剖图 (Anatomy)

```
┌──────────────────────────────────────────────┐
│                                              │
│  LABEL (13px, secondary)        ┌──────────┐ │
│                                 │  ICON    │ │
│  VALUE (36px, primary)          │ BADGE    │ │
│  ┌──────────────────┐           │ 44×44    │ │
│  │ 1,234   suffix   │           │ radius 14│ │
│  └──────────────────┘           │ gradient │ │
│                                 └──────────┘ │
│  ┌──────────────┐                            │
│  │ ↑ 12% trend  │  (optional)               │
│  └──────────────┘                            │
│                                              │
│  padding: 24px 28px                          │
│  border-radius: 16px                         │
│  backdrop-filter: blur(20px)                 │
└──────────────────────────────────────────────┘
```

### 层次结构

```
<Card>
  ├── <div.flex> (水平布局: space-between)
  │   ├── <div> (左侧数据区)
  │   │   ├── <Text> 标签 (title)
  │   │   ├── <div> 数值 (value / AnimatedNumber + suffix)
  │   │   └── <div> 趋势指示器 (trend, 可选)
  │   └── <div> 图标徽章 (icon badge)
  │       └── icon (ReactNode)
```

---

## 3. Props API

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | ✅ | — | 指标名称，显示在顶部 |
| `value` | `string \| number` | ✅ | — | 指标值。数字类型会自动使用 AnimatedNumber |
| `icon` | `React.ReactNode` | ✅ | — | 图标，通常为 Ant Design Icon |
| `gradient` | `string` | ✅ | — | 图标徽章的 CSS 渐变 |
| `suffix` | `string` | ❌ | — | 数值后缀，如 `¥`、`%`、`M` |
| `trend` | `{ value: number; label?: string }` | ❌ | — | 趋势指示器。正=绿↑，负=红↓ |

### 使用示例

```tsx
// 基础用法
<StatCard
  title="本月请求"
  value={12345}
  icon={<ThunderboltOutlined />}
  gradient="linear-gradient(135deg, #0a84ff, #5e5ce6)"
/>

// 带后缀
<StatCard
  title="Token 消耗"
  value="2.4M"
  icon={<MessageOutlined />}
  gradient="linear-gradient(135deg, #30d158, #34c759)"
/>

// 带趋势指示器
<StatCard
  title="本月成本"
  value={`$128.50`}
  icon={<DollarOutlined />}
  gradient="linear-gradient(135deg, #ffd60a, #ff9f0a)"
  trend={{ value: 12.5, label: 'vs 上月' }}
/>
```

---

## 4. 视觉规格

### 4.1 尺寸

| 元素 | 尺寸 | 说明 |
|------|------|------|
| 卡片圆角 | `16px` | 与 SectionCard / GlassCard 一致 |
| 卡片内边距 | `24px 28px` | 上下 24px，左右 28px |
| 图标徽章 | `44 × 44px` | 正方形 |
| 图标圆角 | `14px` | 约 32% 圆角 |
| 图标大小 | `20px` | font-size |
| 标签到数值间距 | `10px` | margin-top |
| 数值到趋势间距 | `8px` | margin-top |

### 4.2 排版

| 元素 | 字号 | 字重 | 颜色 (Dark) | 字间距 |
|------|------|------|-------------|--------|
| 标签 (title) | 13px | 500 | `var(--text-secondary)` | `0.02em` |
| 数值 (value) | 36px | 700 | `var(--text-primary)` | `−0.04em` |
| 后缀 (suffix) | 16px | 500 | `var(--text-muted)` | 0 |
| 趋势文字 | 12px | 500 | 绿/红 | 0 |

**数值特殊处理**:
- `font-variant-numeric: tabular-nums` — 等宽数字，避免跳动
- `line-height: 1` — 紧凑行高
- 数字类型自动触发 AnimatedNumber 动画

### 4.3 颜色系统

#### 卡片背景

| Token | Dark | Light |
|-------|------|-------|
| background | `var(--bg-card)` = `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.8)` |
| border | `0.5px solid var(--border-subtle)` | `0.5px solid rgba(0,0,0,0.08)` |
| backdrop-filter | `blur(20px)` | `blur(20px)` |

#### 预设渐变

| 名称 | 渐变值 | 用途 |
|------|--------|------|
| Primary Blue | `linear-gradient(135deg, #0a84ff, #5e5ce6)` | 请求数、默认 |
| Success Green | `linear-gradient(135deg, #30d158, #34c759)` | Token、成功 |
| Warning Yellow | `linear-gradient(135deg, #ffd60a, #ff9f0a)` | 成本、警告 |
| Error Red | `linear-gradient(135deg, #ff453a, #ff6961)` | 错误、异常 |
| Purple | `linear-gradient(135deg, #5e5ce6, #bf5af2)` | 创意功能 |
| Teal | `linear-gradient(135deg, #64d2ff, #0a84ff)` | 信息 |

#### 图标徽章阴影

```
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3)
```

### 4.4 趋势指示器

| 方向 | 颜色 | 背景 | 箭头 |
|------|------|------|------|
| 正 (↑) | `#30d158` | `rgba(48, 209, 88, 0.08)` | ↑ |
| 负 (↓) | `#ff453a` | `rgba(255, 69, 58, 0.08)` | ↓ |

- 圆角: `6px`
- 内边距: `2px 8px`
- 字号: `12px`，字重 500
- 可选 label 文字: `var(--text-muted)`

---

## 5. 交互状态

### 5.1 默认状态

```
transform: translateY(0)
box-shadow: none
border: 0.5px solid var(--border-subtle)
```

### 5.2 Hover 状态

```css
/* 卡片上浮 */
transform: translateY(-2px);
/* 阴影加深 */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35),
            0 0 0 0.5px rgba(255, 255, 255, 0.06);
/* 过渡曲线 */
transition:
  transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
  box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
  border-color 0.3s ease;
```

### 5.3 入场动画

```css
/* fade-in-up 入场 */
animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;

/* 数值从 0 递增到目标值 */
/* AnimatedNumber: duration 800ms, easeOutExpo */
```

### 5.4 多卡片交错入场

在 Dashboard 中 4 张 StatCard 以 stagger 模式入场：

```css
.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.10s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.15s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.20s; }
```

---

## 6. 布局规则

### 6.1 网格布局

StatCard 使用 Ant Design `Row` + `Col` 进行布局：

```tsx
<Row gutter={[20, 20]}>
  <Col xs={24} sm={12} lg={6}>
    <StatCard ... />
  </Col>
  <Col xs={24} sm={12} lg={6}>
    <StatCard ... />
  </Col>
  <Col xs={24} sm={12} lg={6}>
    <StatCard ... />
  </Col>
  <Col xs={24} sm={12} lg={6}>
    <StatCard ... />
  </Col>
</Row>
```

| 断点 | 列数 | 卡片宽度 |
|------|------|---------|
| `xs` (< 576px) | 1 列 (24/24) | 100% |
| `sm` (≥ 576px) | 2 列 (12/24) | 50% - 10px |
| `lg` (≥ 992px) | 4 列 (6/24) | 25% - 15px |

### 6.2 与页面其他元素间距

```
页面标题
  ↓ margin-bottom: 32px
StatCard 行
  ↓ margin-bottom: 24px
SectionCard (图表/表格)
```

---

## 7. Loading 状态

使用 `StatCardSkeleton` 作为加载占位：

```tsx
// Skeletons.tsx
export const StatCardSkeleton: React.FC = () => (
  <Card style={glassCardBase} styles={{ body: { padding: '24px 28px' } }}>
    <Skeleton active paragraph={{ rows: 1 }} title={{ width: 100 }} />
  </Card>
);
```

Skeleton 使用 `shimmer` 动画：

```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
```

---

## 8. 主题适配

### 8.1 Dark Mode (默认)

| 元素 | 值 |
|------|-----|
| 画布背景 | `#000000` |
| 卡片背景 | `rgba(255,255,255,0.04)` + `blur(20px)` |
| 边框 | `rgba(255,255,255,0.08)` at 0.5px |
| 文字主色 | `#f5f5f7` |
| 文字副色 | `rgba(255,255,255,0.45)` |
| Hover 阴影 | `rgba(0,0,0,0.35)` |

### 8.2 Light Mode

| 元素 | 值 |
|------|-----|
| 画布背景 | `#f5f5f7` |
| 卡片背景 | `rgba(255,255,255,0.8)` + `blur(20px)` |
| 边框 | `rgba(0,0,0,0.08)` at 0.5px |
| 文字主色 | `#1d1d1f` |
| 文字副色 | `rgba(0,0,0,0.45)` |
| Hover 阴影 | 通过 `.glass-card` 自动适配 |

切换通过 `<html class="light">` + CSS 自定义属性实现。

---

## 9. Do's and Don'ts

### ✅ Do

- 数字类型 value 自动触发 AnimatedNumber 动画
- 使用预定义的渐变色保持视觉一致
- 在 4 列网格中使用（Dashboard 标准布局）
- 保持标签简短（≤ 6 个中文字符）
- 趋势值使用百分比

### ❌ Don't

- 不要在一张卡片中放多个指标
- 不要使用超过 4 种渐变变体
- 不要移除 backdrop-filter（毛玻璃效果）
- 不要改变 36px 数值大小（视觉一致性）
- 不要在移动端以外减少卡片间距

---

## 10. 可访问性

| 要求 | 实现 |
|------|------|
| 色彩对比 | 数值/背景 > 7:1 (AAA) |
| 减弱动画 | `prefers-reduced-motion` 自动禁用动画 |
| 数值可读 | `tabular-nums` 保证等宽，不跳动 |
| 语义化 | Card 元素自带 role |

---

## 11. 设计资源

### 图标推荐

| 指标类型 | 推荐图标 | 渐变 |
|----------|---------|------|
| 请求数 | `ThunderboltOutlined` | Primary Blue |
| Token 消耗 | `MessageOutlined` | Success Green |
| 成本 | `DollarOutlined` | Warning Yellow |
| 系统状态 | `CheckCircleOutlined` / `WarningOutlined` | Success Green / Error Red |
| 用户数 | `TeamOutlined` | Purple |
| 知识库 | `BookOutlined` | Teal |
| Agent | `RobotOutlined` | Primary Blue |

---

*此规范为 StatCard 组件的单一真实来源。前端实现请参考 `src/components/StatCard.tsx`。*
