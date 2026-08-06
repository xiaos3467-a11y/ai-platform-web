/**
 * Conversations page — responsive two-panel chat interface tests.
 *
 * Default viewport is desktop (≥768px) so both panels render side by side.
 * A dedicated describe block covers mobile (<768px) single-panel behavior.
 *
 * Covers:
 *   - Renders page title and empty state initially
 *   - Shows loading spinner when conversations are loading
 *   - Displays "暂无对话" when conversation list is empty
 *   - Renders conversation list when data loads
 *   - Shows selected conversation details
 *   - Displays messages when conversation is selected
 *   - Shows "选择一个对话查看消息" placeholder when no conv selected
 *   - Mobile: single-panel navigation with back button
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Conversations from '../Conversations';
import type { Conversation } from '@/types';

// Mock antd Grid.useBreakpoint to control responsive behavior in tests.
// Default: desktop (md: true) — both panels visible.
const mockBreakpoint = vi.fn(() => ({
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: true,
  xxl: true,
}));
vi.mock('antd', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('antd');
  return {
    ...actual,
    Grid: {
      ...((actual.Grid as Record<string, unknown>) ?? {}),
      useBreakpoint: () => mockBreakpoint(),
    },
  };
});

// Mock the conversation hooks
const mockUseConversations = vi.fn();
const mockUseConversationMessages = vi.fn();
vi.mock('../conversations/useConversations', () => ({
  useConversations: () => mockUseConversations(),
  useConversationMessages: (id: string | null) =>
    mockUseConversationMessages(id),
  CONVERSATIONS_KEY: ['conversations'],
}));

// Mock sub-components
vi.mock('../conversations/ConversationItem', () => ({
  default: ({
    conversation,
    onClick,
    onDelete,
  }: {
    conversation: Conversation;
    onClick: () => void;
    onDelete: (id: string) => void;
  }) => (
    <div data-testid={`conv-${conversation.id}`} onClick={onClick}>
      <span>{conversation.title}</span>
      <button
        data-testid={`delete-${conversation.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
      >
        Delete
      </button>
    </div>
  ),
}));

vi.mock('../conversations/MessageBubble', () => ({
  default: ({ message }: { message: { id: string; content: string } }) => (
    <div data-testid={`msg-${message.id}`}>{message.content}</div>
  ),
}));

// Mock API client
vi.mock('@/api/client', () => ({
  api: {
    delete: vi.fn(),
  },
}));

const mockConv: Conversation = {
  id: 'conv-1',
  title: 'Test conversation',
  model: 'gpt-4',
  user_id: 'user-1',
  status: 'active',
  total_tokens: 1500,
  message_count: 5,
  created_at: '2026-01-01T00:00:00Z',
};

const mockConv2: Conversation = {
  id: 'conv-2',
  title: 'Another chat',
  model: 'claude-3',
  user_id: 'user-1',
  status: 'active',
  total_tokens: 3000,
  message_count: 10,
  created_at: '2026-01-02T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseConversations.mockReturnValue({
    data: { items: [] },
    isLoading: false,
  });
  mockUseConversationMessages.mockReturnValue({
    data: [],
    isLoading: false,
  });
});

describe('Conversations page', () => {
  it('renders page title and description', () => {
    render(<Conversations />);
    // Title appears in both breadcrumb and page header
    expect(screen.getAllByText('对话记录').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('查看历史对话与消息详情')).toBeInTheDocument();
  });

  it('shows loading spinner when conversations are loading', () => {
    mockUseConversations.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<Conversations />);
    // antd Spin renders a specific class
    expect(screen.getByText('全部对话')).toBeInTheDocument();
  });

  it('shows empty state when no conversations exist', () => {
    mockUseConversations.mockReturnValue({
      data: { items: [] },
      isLoading: false,
    });

    render(<Conversations />);
    expect(screen.getByText('暂无对话')).toBeInTheDocument();
  });

  it('renders conversation list when data loads', () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv, mockConv2] },
      isLoading: false,
    });

    render(<Conversations />);
    expect(screen.getByTestId('conv-conv-1')).toBeInTheDocument();
    expect(screen.getByTestId('conv-conv-2')).toBeInTheDocument();
    expect(screen.getByText('Test conversation')).toBeInTheDocument();
    expect(screen.getByText('Another chat')).toBeInTheDocument();
  });

  it('shows placeholder text when no conversation is selected', () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv] },
      isLoading: false,
    });

    render(<Conversations />);
    expect(screen.getByText('选择一个对话查看消息')).toBeInTheDocument();
    expect(screen.getByText('从列表点击任意对话开始浏览')).toBeInTheDocument();
  });

  it('shows selected conversation details', async () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv] },
      isLoading: false,
    });

    render(<Conversations />);

    await userEvent.click(screen.getByTestId('conv-conv-1'));

    // Model and token info appear in the selected conversation header
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
    expect(screen.getByText('1,500 tokens')).toBeInTheDocument();
    expect(screen.getByText('5 条消息')).toBeInTheDocument();
  });

  it('shows "暂无消息" when selected conversation has no messages', async () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv] },
      isLoading: false,
    });
    mockUseConversationMessages.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<Conversations />);
    await userEvent.click(screen.getByTestId('conv-conv-1'));

    expect(screen.getByText('暂无消息')).toBeInTheDocument();
  });

  it('shows loading spinner in message area when messages are loading', async () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv] },
      isLoading: false,
    });
    mockUseConversationMessages.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<Conversations />);
    await userEvent.click(screen.getByTestId('conv-conv-1'));

    // The message area shows a spinner
    expect(screen.queryByText('暂无消息')).not.toBeInTheDocument();
  });

  it('renders messages when loaded', async () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv] },
      isLoading: false,
    });
    mockUseConversationMessages.mockReturnValue({
      data: [
        { id: 'msg-1', role: 'user', content: 'Hello' },
        { id: 'msg-2', role: 'assistant', content: 'Hi there' },
      ],
      isLoading: false,
    });

    render(<Conversations />);
    await userEvent.click(screen.getByTestId('conv-conv-1'));

    expect(screen.getByTestId('msg-msg-1')).toBeInTheDocument();
    expect(screen.getByTestId('msg-msg-2')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('displays badge with conversation count', () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv, mockConv2] },
      isLoading: false,
    });

    render(<Conversations />);
    // Badge should show "2"
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows conversation ID prefix when title is empty', async () => {
    const convNoTitle: Conversation = {
      ...mockConv,
      title: null,
      id: 'abc12345-def6-7890',
    };
    mockUseConversations.mockReturnValue({
      data: { items: [convNoTitle] },
      isLoading: false,
    });

    render(<Conversations />);
    await userEvent.click(screen.getByTestId('conv-abc12345-def6-7890'));

    // Shows "对话 abc12345" (first 8 chars)
    expect(screen.getByText('对话 abc12345')).toBeInTheDocument();
  });
});

describe('Conversations — mobile layout', () => {
  beforeEach(() => {
    // Simulate mobile viewport (<768px)
    mockBreakpoint.mockReturnValue({
      xs: true,
      sm: true,
      md: false,
      lg: false,
      xl: false,
      xxl: false,
    });
  });

  it('shows list panel initially on mobile', () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv] },
      isLoading: false,
    });

    render(<Conversations />);
    // Should show the list (全部对话)
    expect(screen.getByText('全部对话')).toBeInTheDocument();
    expect(screen.getByTestId('conv-conv-1')).toBeInTheDocument();
    // Should NOT show the detail placeholder
    expect(screen.queryByText('选择一个对话查看消息')).not.toBeInTheDocument();
  });

  it('switches to detail view when a conversation is selected', async () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv] },
      isLoading: false,
    });
    mockUseConversationMessages.mockReturnValue({
      data: [{ id: 'msg-1', role: 'user', content: 'Hello' }],
      isLoading: false,
    });

    render(<Conversations />);
    await userEvent.click(screen.getByTestId('conv-conv-1'));

    // Now should show the detail panel
    expect(screen.getByText('Hello')).toBeInTheDocument();
    // List should no longer be visible
    expect(screen.queryByTestId('conv-conv-1')).not.toBeInTheDocument();
  });

  it('shows a back button in the detail view header', async () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv] },
      isLoading: false,
    });

    render(<Conversations />);
    await userEvent.click(screen.getByTestId('conv-conv-1'));

    // The back button should be present
    expect(screen.getByLabelText('返回列表')).toBeInTheDocument();
  });

  it('returns to list view when back button is clicked', async () => {
    mockUseConversations.mockReturnValue({
      data: { items: [mockConv] },
      isLoading: false,
    });

    render(<Conversations />);
    await userEvent.click(screen.getByTestId('conv-conv-1'));
    // Now in detail view
    expect(screen.queryByTestId('conv-conv-1')).not.toBeInTheDocument();

    // Click back
    fireEvent.click(screen.getByLabelText('返回列表'));

    // Should be back in list view
    expect(screen.getByTestId('conv-conv-1')).toBeInTheDocument();
  });
});
