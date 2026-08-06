# 当前主题 Token（已实现）

> 提取自 `src/styles/themeTokens.ts`，供 UI 设计师参考

## 深色模式（Dark Mode）

### 色彩

```css
/* 品牌色 */
--color-primary: #0a84ff;          /* Apple Blue */
--color-success: #30d158;          /* Apple Green */
--color-warning: #ffd60a;          /* Apple Yellow */
--color-error: #ff453a;            /* Apple Red */
--color-info: #0a84ff;

/* 背景色 */
--color-bg-base: #000000;          /* 纯黑背景 */
--color-bg-layout: #000000;        /* 布局背景 */
--color-bg-container: rgba(255, 255, 255, 0.04);  /* 容器背景 */
--color-bg-elevated: rgba(255, 255, 255, 0.08);   /* 弹出层背景 */
--color-bg-spotlight: rgba(255, 255, 255, 0.12);  /* 高亮背景 */

/* 填充色 */
--color-fill: rgba(255, 255, 255, 0.06);
--color-fill-secondary: rgba(255, 255, 255, 0.08);
--color-fill-tertiary: rgba(255, 255, 255, 0.04);
--color-fill-quaternary: rgba(255, 255, 255, 0.02);

/* 边框色 */
--color-border: rgba(255, 255, 255, 0.12);         /* 主边框 */
--color-border-secondary: rgba(255, 255, 255, 0.06); /* 次边框 */

/* 文本色 */
--color-text: #f5f5f7;             /* 主文本 - 近白 */
--color-text-secondary: #a1a1a6;   /* 次文本 - 中灰 */
--color-text-tertiary: #6e6e73;    /* 三级文本 - 暗灰 */
--color-text-quaternary: #48484a;  /* 占位符 - 深灰 */
```

### 排版

```css
/* 字体 */
--font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 
               'SF Pro Text', 'Inter', 'Helvetica Neue', 
               'PingFang SC', sans-serif;

/* 字号 */
--font-size-base: 14px;
--font-size-heading-1: 40px;
--font-size-heading-2: 28px;
--font-size-heading-3: 22px;
--font-size-heading-4: 17px;
--font-size-heading-5: 15px;

/* 字重 */
--font-weight-strong: 600;
--font-weight-normal: 400;

/* 行高 */
--line-height: 1.5714;
```

### 圆角

```css
--border-radius-xs: 6px;
--border-radius-sm: 8px;
--border-radius: 12px;
--border-radius-lg: 16px;
```

### 间距

```css
--padding-xs: 8px;
--padding-sm: 12px;
--padding: 16px;
--padding-lg: 24px;

--margin-xs: 8px;
--margin-sm: 12px;
--margin: 16px;
--margin-lg: 24px;
```

### 阴影

```css
/* 基础阴影 */
--box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 
              0 0 1px rgba(255, 255, 255, 0.05);

/* 弹出层阴影 */
--box-shadow-secondary: 0 8px 32px rgba(0, 0, 0, 0.5), 
                        0 0 1px rgba(255, 255, 255, 0.08);
```

### 动效

```css
--motion-duration-mid: 0.3s;
--motion-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--motion-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

### 组件特定样式

```css
/* Layout */
--layout-sider-bg: rgba(22, 22, 24, 0.8);
--layout-header-bg: rgba(0, 0, 0, 0.72);
--layout-body-bg: #000000;

/* Menu */
--menu-item-height: 40px;
--menu-item-border-radius: 10px;
--menu-item-hover-bg: rgba(255, 255, 255, 0.06);
--menu-item-selected-bg: rgba(10, 132, 255, 0.15);
--menu-item-selected-color: #0a84ff;

/* Card */
--card-padding: 24px;
--card-border-radius: 16px;
--card-bg: rgba(255, 255, 255, 0.04);
--card-border: rgba(255, 255, 255, 0.08);

/* Button */
--button-height: 40px;
--button-height-lg: 48px;
--button-border-radius: 10px;
--button-primary-shadow: 0 1px 4px rgba(10, 132, 255, 0.4);

/* Input */
--input-height: 40px;
--input-height-lg: 48px;
--input-border-radius: 10px;
--input-bg: rgba(255, 255, 255, 0.06);
--input-border: rgba(255, 255, 255, 0.1);
--input-active-border: #0a84ff;
--input-active-shadow: 0 0 0 3px rgba(10, 132, 255, 0.15);

/* Table */
--table-border-radius: 12px;
--table-header-bg: rgba(255, 255, 255, 0.03);
--table-header-color: #a1a1a6;
--table-row-hover-bg: rgba(255, 255, 255, 0.04);
--table-border-color: rgba(255, 255, 255, 0.06);
--table-cell-padding: 14px 16px;

/* Modal */
--modal-border-radius: 20px;
--modal-padding: 28px;
--modal-title-size: 18px;
--modal-bg: rgba(28, 28, 30, 0.95);
```

---

## 浅色模式（Light Mode）

### 色彩

```css
/* 品牌色 */
--color-primary: #0071e3;
--color-success: #34c759;
--color-warning: #ff9f0a;
--color-error: #ff3b30;
--color-info: #0071e3;

/* 背景色 */
--color-bg-base: #ffffff;
--color-bg-layout: #f5f5f7;
--color-bg-container: #ffffff;
--color-bg-elevated: #ffffff;

/* 边框色 */
--color-border: #d2d2d7;
--color-border-secondary: #e8e8ed;

/* 文本色 */
--color-text: #1d1d1f;
--color-text-secondary: #6e6e73;
--color-text-tertiary: #86868b;
```

### 组件特定样式

```css
/* Layout */
--layout-sider-bg: #ffffff;
--layout-header-bg: rgba(255, 255, 255, 0.72);
--layout-body-bg: #f5f5f7;

/* Menu */
--menu-item-hover-bg: rgba(0, 113, 227, 0.06);
--menu-item-selected-bg: rgba(0, 113, 227, 0.1);
--menu-item-selected-color: #0071e3;

/* Card */
--card-bg: #ffffff;
--card-border: #d2d2d7;

/* Button */
--button-primary-shadow: 0 1px 3px rgba(0, 113, 227, 0.3);

/* Table */
--table-header-bg: #fafafa;
--table-header-color: #6e6e73;
--table-row-hover-bg: rgba(0, 0, 0, 0.02);
--table-border-color: #f0f0f2;
```

---

## 使用方式

### 在 Figma 中创建样式

1. **创建颜色样式**
   - 按上述色彩系统创建色板
   - 命名规则：`Brand/Primary`、`Neutral/Text`、`Background/Base` 等

2. **创建文字样式**
   - H1-H5 + Body + Caption
   - 命名规则：`Typography/H1`、`Typography/Body` 等

3. **创建效果样式**
   - 阴影、圆角
   - 命名规则：`Shadow/Small`、`Shadow/Large` 等

### 导出为 Design Tokens

```json
{
  "color": {
    "primary": {
      "dark": "#0a84ff",
      "light": "#0071e3"
    },
    "success": {
      "dark": "#30d158",
      "light": "#34c759"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px"
  },
  "borderRadius": {
    "xs": "6px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px"
  }
}
```

---

## 参考资源

- [Ant Design 5 Design Tokens](https://ant.design/docs/react/customize-theme)
- [Figma Design Tokens Plugin](https://www.figma.com/community/plugin/888356643515855270/Design-Tokens)
- [Style Dictionary](https://amzn.github.io/style-dictionary/) - Token 转换工具
