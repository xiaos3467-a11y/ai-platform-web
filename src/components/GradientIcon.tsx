/**
 * GradientIcon — Reusable gradient badge for icons
 * — Centralizes the gradient icon pattern used across StatCards,
 *   chat avatars, agent list badges, and empty states.
 */

import React from 'react';

export interface GradientIconProps {
  icon: React.ReactNode;
  gradient?: string;
  size?: number;
  borderRadius?: number;
  fontSize?: number;
  /** Optional shadow — defaults to dark glow. */
  shadow?: string;
  className?: string;
}

const GradientIcon: React.FC<GradientIconProps> = ({
  icon,
  gradient = 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
  size = 44,
  borderRadius = 14,
  fontSize = 20,
  shadow = '0 4px 16px rgba(0, 0, 0, 0.3)',
  className,
}) => (
  <div
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius,
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize,
      boxShadow: shadow,
      flexShrink: 0,
    }}
  >
    {icon}
  </div>
);

export default GradientIcon;
