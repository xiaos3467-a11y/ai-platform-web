/**
 * ErrorState — Vitest tests
 *
 * Coverage targets (100%):
 *   - Inline variant renders error message (string)
 *   - Inline variant renders error message (Error object)
 *   - Fullscreen variant renders
 *   - Retry button appears only when onRetry is provided
 *   - Retry button triggers onRetry callback
 *   - Auto-reports to Sentry via captureError
 *   - Custom title and description override defaults
 *   - Theme-aware (dark/light)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import ErrorState from '../ErrorState';

// Mock Sentry
vi.mock('@/lib/sentry', () => ({
  captureError: vi.fn(),
}));

import { captureError } from '@/lib/sentry';

const mockCaptureError = vi.mocked(captureError);

describe('ErrorState', () => {
  beforeEach(() => {
    mockCaptureError.mockClear();
  });

  describe('inline variant (default)', () => {
    it('renders error message from string', () => {
      render(<ErrorState error="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByTestId('error-state-inline')).toBeInTheDocument();
    });

    it('renders error message from Error object', () => {
      const error = new Error('Network timeout');
      render(<ErrorState error={error} />);
      expect(screen.getByText('Network timeout')).toBeInTheDocument();
    });

    it('shows default title', () => {
      render(<ErrorState error="Oops" />);
      expect(screen.getByText('出了点问题')).toBeInTheDocument();
    });

    it('shows custom title', () => {
      render(<ErrorState error="Oops" title="自定义错误标题" />);
      expect(screen.getByText('自定义错误标题')).toBeInTheDocument();
    });

    it('shows custom description', () => {
      render(<ErrorState error="Oops" description="附加描述信息" />);
      expect(screen.getByText('附加描述信息')).toBeInTheDocument();
    });

    it('does not show retry button when onRetry is not provided', () => {
      render(<ErrorState error="Oops" />);
      expect(screen.queryByTestId('error-state-retry')).not.toBeInTheDocument();
    });

    it('shows retry button when onRetry is provided', () => {
      const onRetry = vi.fn();
      render(<ErrorState error="Oops" onRetry={onRetry} />);
      expect(screen.getByTestId('error-state-retry')).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn();
      render(<ErrorState error="Oops" onRetry={onRetry} />);
      fireEvent.click(screen.getByTestId('error-state-retry'));
      expect(onRetry).toHaveBeenCalledOnce();
    });
  });

  describe('fullscreen variant', () => {
    it('renders fullscreen layout', () => {
      render(<ErrorState error="Fatal" variant="fullscreen" />);
      expect(screen.getByTestId('error-state-fullscreen')).toBeInTheDocument();
    });

    it('shows default description in fullscreen', () => {
      render(<ErrorState error="Fatal" variant="fullscreen" />);
      expect(screen.getByText(/应用遇到了意外错误/)).toBeInTheDocument();
    });

    it('shows custom description over default in fullscreen', () => {
      render(
        <ErrorState error="Fatal" variant="fullscreen" description="自定义全屏描述" />,
      );
      expect(screen.getByText('自定义全屏描述')).toBeInTheDocument();
    });

    it('shows "返回首页" button', () => {
      render(<ErrorState error="Fatal" variant="fullscreen" />);
      expect(screen.getByText('返回首页')).toBeInTheDocument();
    });

    it('shows retry button in fullscreen when onRetry is provided', () => {
      const onRetry = vi.fn();
      render(<ErrorState error="Fatal" variant="fullscreen" onRetry={onRetry} />);
      expect(screen.getByTestId('error-state-retry')).toBeInTheDocument();
    });
  });

  describe('Sentry integration', () => {
    it('reports Error object to Sentry on mount', () => {
      const error = new Error('Test error');
      render(<ErrorState error={error} />);
      expect(mockCaptureError).toHaveBeenCalledWith(error, {
        component: 'ErrorState',
        variant: 'inline',
      });
    });

    it('reports string error to Sentry as Error object', () => {
      render(<ErrorState error="string error" />);
      expect(mockCaptureError).toHaveBeenCalled();
      const firstArg = mockCaptureError.mock.calls[0][0];
      expect(firstArg).toBeInstanceOf(Error);
      expect((firstArg as Error).message).toBe('string error');
    });

    it('reports with fullscreen variant context', () => {
      render(<ErrorState error="Fatal" variant="fullscreen" />);
      expect(mockCaptureError).toHaveBeenCalledWith(expect.any(Error), {
        component: 'ErrorState',
        variant: 'fullscreen',
      });
    });
  });
});
