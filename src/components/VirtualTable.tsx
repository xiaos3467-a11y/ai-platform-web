/**
 * VirtualTable — virtualized data table using @tanstack/react-virtual.
 *
 * Designed for large datasets where rendering all rows at once would cause
 * jank. Only the visible rows (+overscan) are mounted.
 *
 * Features:
 *   - Fixed header, virtualized body
 *   - Apple glass aesthetic with theme tokens
 *   - Compatible column API with AntD Table (title, dataIndex, key, width, render)
 *   - Configurable row height and overscan
 *   - Empty state support
 */

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Empty } from 'antd';
import { radius } from '@/styles/themeTokens';

/* ── Column definition ─────────────────────────────────────────── */

export interface VirtualTableColumn<T> {
  /** Column header label. */
  title: React.ReactNode;
  /** Field key on the row object. */
  dataIndex?: string;
  /** Unique key for the column (defaults to dataIndex). */
  key?: string;
  /** Fixed width in px. If omitted the column flexes. */
  width?: number;
  /** Custom cell renderer. */
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  /** Horizontal alignment — default 'left'. */
  align?: 'left' | 'center' | 'right';
}

/* ── Props ─────────────────────────────────────────────────────── */

export interface VirtualTableProps<T> {
  columns: VirtualTableColumn<T>[];
  dataSource: T[];
  /** Key field on each row (string path or function). */
  rowKey: string | ((record: T) => string);
  /** Fixed row height in px — default 54. */
  rowHeight?: number;
  /** Number of rows to render outside the visible area — default 5. */
  overscan?: number;
  /** Max height of the scrollable body — default 500. */
  maxHeight?: number;
  /** Optional className for the wrapper. */
  className?: string;
  /** Custom empty state. */
  emptyText?: React.ReactNode;
}

/* ── Helpers ───────────────────────────────────────────────────── */

function getRowKeyValue<T>(record: T, rowKey: string | ((r: T) => string), index: number): string {
  if (typeof rowKey === 'function') return rowKey(record);
  const val = (record as Record<string, unknown>)[rowKey];
  return val != null ? String(val) : String(index);
}

function getCellValue<T>(record: T, dataIndex?: string): unknown {
  if (!dataIndex) return undefined;
  return (record as Record<string, unknown>)[dataIndex];
}

/* ── Component ─────────────────────────────────────────────────── */

function VirtualTableInner<T>({
  columns,
  dataSource,
  rowKey,
  rowHeight = 54,
  overscan = 5,
  maxHeight = 500,
  emptyText,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: dataSource.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          padding: '0 16px',
          height: 44,
          alignItems: 'center',
          borderBottom: '0.5px solid var(--border-divider)',
          background: 'var(--bg-subtle)',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
      >
        {columns.map((col, ci) => {
          const colKey = col.key ?? col.dataIndex ?? ci;
          const style: React.CSSProperties = {
            textAlign: col.align ?? 'left',
            fontVariantNumeric: 'tabular-nums',
          };
          if (col.width) {
            style.width = col.width;
            style.flexShrink = 0;
          } else {
            style.flex = 1;
          }
          // Pad for spacing
          if (ci > 0) style.paddingLeft = 12;
          return (
            <div key={colKey} style={style}>
              {col.title}
            </div>
          );
        })}
      </div>

      {/* Virtual body */}
      <div
        ref={parentRef}
        style={{
          height: maxHeight,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {dataSource.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            {emptyText ?? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: 'var(--text-subtle)' }}>暂无数据</span>
                }
              />
            )}
          </div>
        ) : (
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const record = dataSource[virtualRow.index];
              const key = getRowKeyValue(record, rowKey, virtualRow.index);
              return (
                <div
                  key={key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    borderBottom: '0.5px solid var(--border-divider)',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    transition: 'background 0.15s ease',
                  }}
                  className="virtual-table-row"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      'transparent';
                  }}
                >
                  {columns.map((col, ci) => {
                    const colKey = col.key ?? col.dataIndex ?? ci;
                    const cellValue = getCellValue(record, col.dataIndex);
                    const cellContent = col.render
                      ? col.render(cellValue, record, virtualRow.index)
                      : cellValue != null
                        ? String(cellValue)
                        : '';
                    const style: React.CSSProperties = {
                      textAlign: col.align ?? 'left',
                      fontVariantNumeric: 'tabular-nums',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    };
                    if (col.width) {
                      style.width = col.width;
                      style.flexShrink = 0;
                    } else {
                      style.flex = 1;
                    }
                    if (ci > 0) style.paddingLeft = 12;
                    return (
                      <div key={colKey} style={style}>
                        {cellContent}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * VirtualTable — wraps the inner table in a themed glass container.
 */
const VirtualTable = <T extends object>(
  props: VirtualTableProps<T> & { className?: string },
) => {
  const { className, ...rest } = props;

  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-subtle)',
        borderRadius: radius.lg,
        overflow: 'hidden',
      }}
    >
      <VirtualTableInner<T> {...(rest as VirtualTableProps<T>)} />
    </div>
  );
};

export default VirtualTable;
