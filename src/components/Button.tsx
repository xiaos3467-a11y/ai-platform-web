/**
 * Button — Apple-style button variants (top-level re-export)
 * — Canonical implementation lives in ./ui/Button.tsx.
 * — This file re-exports it for backward compatibility with imports
 *   like `import { Button } from '@/components'`.
 *
 * Design reference: design/mockups/components.html § 3
 */

export { default } from './ui/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './ui/Button';
