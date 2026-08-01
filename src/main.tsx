import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';

/**
 * Apple-inspired design tokens
 * — Neutral palette, minimal color, generous whitespace, soft shadows
 */
const theme = {
  token: {
    // Core palette — restrained indigo accent on neutral canvas
    colorPrimary: '#0071e3',       // Apple blue
    colorSuccess: '#34c759',       // Apple green
    colorWarning: '#ff9f0a',       // Apple orange
    colorError: '#ff3b30',         // Apple red
    colorInfo: '#0071e3',

    // Neutral scale — warm grays (Apple uses #86868b family)
    colorBgBase: '#ffffff',
    colorBgLayout: '#f5f5f7',      // Apple's signature light gray
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#d2d2d7',        // Subtle border
    colorBorderSecondary: '#e8e8ed',
    colorText: '#1d1d1f',          // Apple's near-black
    colorTextSecondary: '#6e6e73', // Apple's secondary gray
    colorTextTertiary: '#86868b',  // Apple's tertiary gray

    // Typography — clean, hierarchical
    fontFamily: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', sans-serif`,
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 17,
    fontSizeHeading5: 15,
    fontWeightStrong: 600,
    lineHeight: 1.5,

    // Shapes — generous rounding (Apple uses 12-16px)
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,

    // Spacing — airy
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    margin: 16,
    marginLG: 24,

    // Shadows — soft, layered depth
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 4px 24px rgba(0, 0, 0, 0.12)',

    // Motion
    motionDurationMid: '0.25s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      headerBg: 'rgba(255, 255, 255, 0.72)',
      bodyBg: '#f5f5f7',
    },
    Menu: {
      itemBorderRadius: 10,
      itemMarginInline: 8,
      itemPaddingInline: 12,
      itemHeight: 40,
      itemHoverBg: 'rgba(0, 113, 227, 0.06)',
      itemSelectedBg: 'rgba(0, 113, 227, 0.1)',
      itemSelectedColor: '#0071e3',
      itemColor: '#1d1d1f',
      itemHoverColor: '#0071e3',
      subMenuItemBg: 'transparent',
      iconSize: 18,
      fontSize: 14,
    },
    Card: {
      paddingLG: 24,
      borderRadiusLG: 16,
    },
    Button: {
      borderRadius: 10,
      borderRadiusLG: 12,
      borderRadiusSM: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      fontWeight: 500,
      primaryShadow: '0 1px 3px rgba(0, 113, 227, 0.3)',
    },
    Input: {
      borderRadius: 10,
      controlHeight: 40,
      controlHeightLG: 48,
    },
    Select: {
      borderRadius: 10,
      controlHeight: 40,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#fafafa',
      headerColor: '#6e6e73',
      headerSplitColor: 'transparent',
      rowHoverBg: 'rgba(0, 0, 0, 0.02)',
      borderColor: '#f0f0f2',
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
      fontSize: 14,
    },
    Tag: {
      borderRadiusSM: 8,
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 28,
    },
    Descriptions: {
      titleColor: '#6e6e73',
      contentColor: '#1d1d1f',
    },
    Modal: {
      borderRadiusLG: 20,
      paddingContentHorizontalLG: 28,
      titleFontSize: 18,
    },
    Drawer: {
      paddingLG: 24,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={theme}>
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
