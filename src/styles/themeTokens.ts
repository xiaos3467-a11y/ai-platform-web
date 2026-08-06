/**
 * Apple-inspired design tokens — shared between the two themes.
 *
 * Both objects have the same shape so the AntD ConfigProvider can
 * swap between them on the fly.
 */

/**
 * Radius scale — use these instead of hardcoded borderRadius values.
 * Maps to CSS variables --radius-* defined in global.css.
 */
export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '999px',
} as const;

export type RadiusKey = keyof typeof radius;

export const darkTokens = {
  token: {
    // ─── Core palette ──────────────────────────────────────────
    colorPrimary: '#0a84ff', // Apple system blue (dark mode)
    colorSuccess: '#30d158', // Apple system green
    colorWarning: '#ffd60a', // Apple system yellow
    colorError: '#ff453a', // Apple system red
    colorInfo: '#0a84ff',

    // ─── Fills (replaces algorithm-derived values) ─────────────
    colorFill: 'rgba(255, 255, 255, 0.06)',
    colorFillSecondary: 'rgba(255, 255, 255, 0.08)',
    colorFillTertiary: 'rgba(255, 255, 255, 0.04)',
    colorFillQuaternary: 'rgba(255, 255, 255, 0.02)',

    // ─── Surface layers ────────────────────────────────────────
    colorBgBase: '#000000',
    colorBgLayout: '#000000', // Pure black canvas (like apple.com)
    colorBgContainer: 'rgba(255, 255, 255, 0.04)', // Elevated surface
    colorBgElevated: 'rgba(255, 255, 255, 0.08)', // Popover / modal
    colorBgSpotlight: 'rgba(255, 255, 255, 0.12)',

    // ─── Borders ───────────────────────────────────────────────
    colorBorder: 'rgba(255, 255, 255, 0.12)', // Subtle divider
    colorBorderSecondary: 'rgba(255, 255, 255, 0.06)', // Even more subtle

    // ─── Text hierarchy ────────────────────────────────────────
    colorText: '#f5f5f7', // Primary — near-white
    colorTextSecondary: '#a1a1a6', // Secondary — medium gray
    colorTextTertiary: '#6e6e73', // Tertiary — muted
    colorTextQuaternary: '#48484a', // Placeholder / disabled

    // ─── Typography ────────────────────────────────────────────
    fontFamily: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', 'PingFang SC', sans-serif`,
    fontSize: 14,
    fontSizeHeading1: 40,
    fontSizeHeading2: 28,
    fontSizeHeading3: 22,
    fontSizeHeading4: 17,
    fontSizeHeading5: 15,
    fontWeightStrong: 600,
    lineHeight: 1.5714,

    // ─── Shapes — generous rounding (reference radius tokens) ────
    borderRadius: parseInt(radius.md, 10), // 12
    borderRadiusLG: parseInt(radius.lg, 10), // 16
    borderRadiusSM: parseInt(radius.sm, 10), // 8
    borderRadiusXS: 6,

    // ─── Spacing — airy ────────────────────────────────────────
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    margin: 16,
    marginLG: 24,

    // ─── Shadows — subtle glows on dark ────────────────────────
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.05)',
    boxShadowSecondary: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.08)',

    // ─── Motion — Apple spring curves ──────────────────────────
    motionDurationMid: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  components: {
    Layout: {
      siderBg: 'rgba(22, 22, 24, 0.8)',
      headerBg: 'rgba(0, 0, 0, 0.72)',
      bodyBg: '#000000',
    },
    Menu: {
      itemBorderRadius: parseInt(radius.sm, 10),
      itemMarginInline: 8,
      itemPaddingInline: 12,
      itemHeight: 40,
      itemBg: 'transparent',
      itemHoverBg: 'rgba(255, 255, 255, 0.06)',
      itemSelectedBg: 'rgba(10, 132, 255, 0.15)',
      itemSelectedColor: '#0a84ff',
      itemColor: 'rgba(255, 255, 255, 0.72)',
      itemHoverColor: '#ffffff',
      itemActiveBg: 'rgba(10, 132, 255, 0.2)',
      subMenuItemBg: 'transparent',
      iconSize: 18,
      fontSize: 14,
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemColor: 'rgba(255, 255, 255, 0.6)',
      darkItemHoverColor: '#ffffff',
      darkItemSelectedColor: '#0a84ff',
      darkItemSelectedBg: 'rgba(10, 132, 255, 0.15)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
    },
    Card: {
      paddingLG: 24,
      borderRadiusLG: parseInt(radius.lg, 10),
      colorBgContainer: 'rgba(255, 255, 255, 0.04)',
      colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
    },
    Button: {
      borderRadius: parseInt(radius.md, 10),
      borderRadiusLG: parseInt(radius.md, 10),
      borderRadiusSM: parseInt(radius.sm, 10),
      controlHeight: 40,
      controlHeightLG: 48,
      fontWeight: 500,
      primaryShadow: '0 1px 4px rgba(10, 132, 255, 0.4)',
      defaultBg: 'rgba(255, 255, 255, 0.06)',
      defaultBorderColor: 'rgba(255, 255, 255, 0.12)',
      defaultColor: '#f5f5f7',
    },
    Input: {
      borderRadius: parseInt(radius.md, 10),
      controlHeight: 40,
      controlHeightLG: 48,
      colorBgContainer: 'rgba(255, 255, 255, 0.06)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
      activeBorderColor: '#0a84ff',
      hoverBorderColor: 'rgba(255, 255, 255, 0.2)',
      activeShadow: '0 0 0 3px rgba(10, 132, 255, 0.15)',
    },
    Select: {
      borderRadius: parseInt(radius.md, 10),
      controlHeight: 40,
      colorBgContainer: 'rgba(255, 255, 255, 0.06)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
    },
    Table: {
      borderRadius: parseInt(radius.md, 10),
      headerBg: 'rgba(255, 255, 255, 0.03)',
      headerColor: '#a1a1a6',
      headerSplitColor: 'transparent',
      rowHoverBg: 'rgba(255, 255, 255, 0.04)',
      borderColor: 'rgba(255, 255, 255, 0.06)',
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
      fontSize: 14,
      colorBgContainer: 'rgba(255, 255, 255, 0.02)',
    },
    Tag: {
      borderRadiusSM: 6,
      defaultBg: 'rgba(255, 255, 255, 0.08)',
      defaultColor: '#a1a1a6',
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 32,
    },
    Descriptions: {
      titleColor: '#a1a1a6',
      contentColor: '#f5f5f7',
    },
    Modal: {
      borderRadiusLG: parseInt(radius.xl, 10),
      paddingContentHorizontalLG: 28,
      titleFontSize: 18,
      headerBg: 'rgba(28, 28, 30, 0.95)',
      contentBg: 'rgba(28, 28, 30, 0.95)',
    },
    Drawer: {
      paddingLG: 24,
      colorBgElevated: 'rgba(28, 28, 30, 0.98)',
    },
    Tooltip: {
      colorBgSpotlight: 'rgba(44, 44, 46, 0.95)',
      colorTextLightSolid: '#f5f5f7',
      borderRadius: parseInt(radius.sm, 10),
    },
    Popover: {
      colorBgElevated: 'rgba(44, 44, 46, 0.95)',
    },
    Dropdown: {
      controlItemBgHover: 'rgba(255, 255, 255, 0.06)',
      colorBgElevated: 'rgba(44, 44, 46, 0.95)',
    },
    Tabs: {
      itemSelectedColor: '#f5f5f7',
      itemHoverColor: '#a1a1a6',
      inkBarColor: '#0a84ff',
    },
    Alert: {
      borderRadiusLG: parseInt(radius.md, 10),
    },
    Pagination: {
      borderRadius: parseInt(radius.sm, 10),
    },
    Skeleton: {
      colorFill: 'rgba(255, 255, 255, 0.06)',
      colorFillContent: 'rgba(255, 255, 255, 0.1)',
    },
  },
};

export const lightTokens = {
  token: {
    // ─── Core palette ──────────────────────────────────────────
    colorPrimary: '#0071e3',
    colorSuccess: '#34c759',
    colorWarning: '#ff9f0a',
    colorError: '#ff3b30',
    colorInfo: '#0071e3',

    // ─── Fills ────────────────────────────────────────────────
    colorFill: '#f5f5f7',
    colorFillSecondary: '#e8e8ed',
    colorFillTertiary: '#fafafa',
    colorFillQuaternary: '#ffffff',

    // ─── Surface layers ────────────────────────────────────────
    colorBgBase: '#ffffff',
    colorBgLayout: '#f5f5f7',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgSpotlight: '#f5f5f7',

    // ─── Borders ───────────────────────────────────────────────
    colorBorder: '#d2d2d7',
    colorBorderSecondary: '#e8e8ed',

    // ─── Text hierarchy ────────────────────────────────────────
    colorText: '#1d1d1f',
    colorTextSecondary: '#6e6e73',
    colorTextTertiary: '#86868b',
    colorTextQuaternary: '#86868b',

    // ─── Typography ────────────────────────────────────────────
    fontFamily: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', 'PingFang SC', sans-serif`,
    fontSize: 14,
    fontSizeHeading1: 40,
    fontSizeHeading2: 28,
    fontSizeHeading3: 22,
    fontSizeHeading4: 17,
    fontSizeHeading5: 15,
    fontWeightStrong: 600,
    lineHeight: 1.5714,

    // ─── Shapes ────────────────────────────────────────────────
    borderRadius: parseInt(radius.md, 10),
    borderRadiusLG: parseInt(radius.lg, 10),
    borderRadiusSM: parseInt(radius.sm, 10),
    borderRadiusXS: 6,

    // ─── Spacing ───────────────────────────────────────────────
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    margin: 16,
    marginLG: 24,

    // ─── Shadows ───────────────────────────────────────────────
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 8px 24px rgba(0, 0, 0, 0.12)',

    // ─── Motion ────────────────────────────────────────────────
    motionDurationMid: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      headerBg: 'rgba(255, 255, 255, 0.72)',
      bodyBg: '#f5f5f7',
    },
    Menu: {
      itemBorderRadius: parseInt(radius.sm, 10),
      itemMarginInline: 8,
      itemPaddingInline: 12,
      itemHeight: 40,
      itemBg: 'transparent',
      itemHoverBg: 'rgba(0, 113, 227, 0.06)',
      itemSelectedBg: 'rgba(0, 113, 227, 0.1)',
      itemSelectedColor: '#0071e3',
      itemColor: '#1d1d1f',
      itemHoverColor: '#0071e3',
      itemActiveBg: 'rgba(0, 113, 227, 0.14)',
      subMenuItemBg: 'transparent',
      iconSize: 18,
      fontSize: 14,
    },
    Card: {
      paddingLG: 24,
      borderRadiusLG: parseInt(radius.lg, 10),
      colorBgContainer: '#ffffff',
      colorBorderSecondary: '#e8e8ed',
    },
    Button: {
      borderRadius: parseInt(radius.md, 10),
      borderRadiusLG: parseInt(radius.md, 10),
      borderRadiusSM: parseInt(radius.sm, 10),
      controlHeight: 40,
      controlHeightLG: 48,
      fontWeight: 500,
      primaryShadow: '0 1px 3px rgba(0, 113, 227, 0.3)',
      defaultBg: '#ffffff',
      defaultBorderColor: '#d2d2d7',
      defaultColor: '#1d1d1f',
    },
    Input: {
      borderRadius: parseInt(radius.md, 10),
      controlHeight: 40,
      controlHeightLG: 48,
      colorBgContainer: '#ffffff',
      colorBorder: '#d2d2d7',
      activeBorderColor: '#0071e3',
      hoverBorderColor: '#86868b',
      activeShadow: '0 0 0 3px rgba(0, 113, 227, 0.12)',
    },
    Select: {
      borderRadius: parseInt(radius.md, 10),
      controlHeight: 40,
      colorBgContainer: '#ffffff',
      colorBorder: '#d2d2d7',
    },
    Table: {
      borderRadius: parseInt(radius.md, 10),
      headerBg: '#fafafa',
      headerColor: '#6e6e73',
      headerSplitColor: 'transparent',
      rowHoverBg: 'rgba(0, 0, 0, 0.02)',
      borderColor: '#f0f0f2',
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
      fontSize: 14,
      colorBgContainer: '#ffffff',
    },
    Tag: {
      borderRadiusSM: 6,
      defaultBg: '#f5f5f7',
      defaultColor: '#6e6e73',
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 32,
    },
    Descriptions: {
      titleColor: '#6e6e73',
      contentColor: '#1d1d1f',
    },
    Modal: {
      borderRadiusLG: parseInt(radius.xl, 10),
      paddingContentHorizontalLG: 28,
      titleFontSize: 18,
      headerBg: '#ffffff',
      contentBg: '#ffffff',
    },
    Drawer: {
      paddingLG: 24,
      colorBgElevated: '#ffffff',
    },
    Tooltip: {
      colorBgSpotlight: 'rgba(44, 44, 46, 0.95)',
      colorTextLightSolid: '#f5f5f7',
      borderRadius: parseInt(radius.sm, 10),
    },
    Popover: {
      colorBgElevated: '#ffffff',
    },
    Dropdown: {
      controlItemBgHover: 'rgba(0, 0, 0, 0.04)',
      colorBgElevated: '#ffffff',
    },
    Tabs: {
      itemSelectedColor: '#1d1d1f',
      itemHoverColor: '#6e6e73',
      inkBarColor: '#0071e3',
    },
    Alert: {
      borderRadiusLG: parseInt(radius.md, 10),
    },
    Pagination: {
      borderRadius: parseInt(radius.sm, 10),
    },
    Skeleton: {
      colorFill: 'rgba(0, 0, 0, 0.06)',
      colorFillContent: 'rgba(0, 0, 0, 0.1)',
    },
  },
};
