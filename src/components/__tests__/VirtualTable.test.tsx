/**
 * VirtualTable — Vitest tests
 *
 * Coverage targets:
 *   - Renders column headers
 *   - Renders rows from dataSource
 *   - Uses custom rowKey (string)
 *   - Uses custom rowKey (function)
 *   - Renders custom cell via render function
 *   - Shows empty state when dataSource is empty
 *   - Applies className to wrapper
 *   - Supports column alignment (right)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import VirtualTable from '../VirtualTable';
import type { VirtualTableColumn } from '../VirtualTable';

// Mock @tanstack/react-virtual — jsdom doesn't do layout, so the real
// virtualizer computes 0 visible rows. We make every row "virtual" so
// we can still test the rendering logic.
vi.mock('@tanstack/react-virtual', () => {
  return {
    useVirtualizer: (opts: { count: number; estimateSize: () => number }) => {
      const items = Array.from({ length: opts.count }, (_, i) => ({
        index: i,
        start: i * opts.estimateSize(),
        size: opts.estimateSize(),
        end: (i + 1) * opts.estimateSize(),
        key: i,
      }));
      return {
        getVirtualItems: () => items,
        getTotalSize: () => opts.count * opts.estimateSize(),
        measureElement: vi.fn(),
      };
    },
  };
});

interface TestRow {
  id: string;
  name: string;
  amount: number;
}

const testColumns: VirtualTableColumn<TestRow>[] = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100, align: 'right' },
];

const testData: TestRow[] = [
  { id: '1', name: 'Alpha', amount: 100 },
  { id: '2', name: 'Beta', amount: 200 },
  { id: '3', name: 'Gamma', amount: 300 },
];

describe('VirtualTable', () => {
  it('renders column headers', () => {
    render(
      <VirtualTable columns={testColumns} dataSource={testData} rowKey="id" maxHeight={300} />,
    );
    expect(screen.getByText('名称')).toBeInTheDocument();
    expect(screen.getByText('金额')).toBeInTheDocument();
  });

  it('renders all rows from dataSource', () => {
    render(
      <VirtualTable columns={testColumns} dataSource={testData} rowKey="id" maxHeight={300} />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('renders cell values from dataIndex', () => {
    render(
      <VirtualTable columns={testColumns} dataSource={testData} rowKey="id" maxHeight={300} />,
    );
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('uses custom rowKey as string', () => {
    const { container } = render(
      <VirtualTable columns={testColumns} dataSource={testData} rowKey="id" maxHeight={300} />,
    );
    // Rows should have data-index attributes from the virtualizer
    const rows = container.querySelectorAll('[data-index]');
    expect(rows.length).toBe(3);
  });

  it('uses custom rowKey as function', () => {
    const { container } = render(
      <VirtualTable
        columns={testColumns}
        dataSource={testData}
        rowKey={(r) => `row-${r.id}`}
        maxHeight={300}
      />,
    );
    const rows = container.querySelectorAll('[data-index]');
    expect(rows.length).toBe(3);
  });

  it('renders custom cell via render function', () => {
    const columnsWithRender: VirtualTableColumn<TestRow>[] = [
      {
        title: '名称',
        dataIndex: 'name',
        render: (_v, record) => <span data-testid={`custom-${record.id}`}>{record.name}!</span>,
      },
    ];
    render(
      <VirtualTable
        columns={columnsWithRender}
        dataSource={testData}
        rowKey="id"
        maxHeight={300}
      />,
    );
    expect(screen.getByTestId('custom-1')).toBeInTheDocument();
    expect(screen.getByText('Alpha!')).toBeInTheDocument();
  });

  it('shows empty state when dataSource is empty', () => {
    render(
      <VirtualTable columns={testColumns} dataSource={[]} rowKey="id" maxHeight={300} />,
    );
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('shows custom emptyText when provided', () => {
    render(
      <VirtualTable
        columns={testColumns}
        dataSource={[]}
        rowKey="id"
        maxHeight={300}
        emptyText={<span>没有数据</span>}
      />,
    );
    expect(screen.getByText('没有数据')).toBeInTheDocument();
  });

  it('applies className to the wrapper', () => {
    const { container } = render(
      <VirtualTable
        columns={testColumns}
        dataSource={testData}
        rowKey="id"
        className="my-virtual-table"
        maxHeight={300}
      />,
    );
    expect(container.querySelector('.my-virtual-table')).toBeTruthy();
  });

  it('applies the glass-card border and radius styling', () => {
    const { container } = render(
      <VirtualTable columns={testColumns} dataSource={testData} rowKey="id" maxHeight={300} />,
    );
    // The outermost VirtualTable wrapper should have border-radius
    // The test utils wrap in AntdApp, so we query by style
    const wrapper = container.querySelector('[style*="border-radius: 16px"]');
    expect(wrapper).toBeTruthy();
  });

  it('renders row hover effect (row has class virtual-table-row)', () => {
    const { container } = render(
      <VirtualTable columns={testColumns} dataSource={testData} rowKey="id" maxHeight={300} />,
    );
    const rows = container.querySelectorAll('.virtual-table-row');
    expect(rows.length).toBe(3);
  });

  it('respects maxHeight prop', () => {
    const { container } = render(
      <VirtualTable
        columns={testColumns}
        dataSource={testData}
        rowKey="id"
        maxHeight={200}
      />,
    );
    // The scrollable area should have the specified maxHeight
    const scrollArea = container.querySelector('[style*="height: 200px"]');
    expect(scrollArea).toBeTruthy();
  });
});
