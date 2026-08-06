/**
 * Table — Apple-style data table
 * — Hover row highlight
 * — Tabular numbers
 * — Custom head/body styles matching design tokens
 * — Design reference: design/mockups/components.html § 6
 */

import { Table as AntTable } from 'antd';
import type { TableProps as AntTableProps } from 'antd';

import { radius } from '@/styles/themeTokens';
export interface TableProps<T extends object = object> extends AntTableProps<T> {}

const Table = <T extends object>(props: TableProps<T>) => {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-subtle)',
        borderRadius: radius.lg,
        overflow: 'hidden',
      }}
    >
      <AntTable<T>
        {...props}
        pagination={false}
        style={{
          background: 'transparent',
          ...props.style,
        }}
      />
    </div>
  );
};

export default Table;
