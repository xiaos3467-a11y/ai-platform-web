/**
 * AnimatedNumber — Count-up number animation
 * — Smoothly interpolates from 0 (or a previous value) to the target value.
 * — Uses requestAnimationFrame with easeOutExpo for a spring-like feel.
 * — Supports formatted display (localeString, toFixed, suffix, prefix).
 */

import React, { useEffect, useRef, useState } from 'react';

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

/** Ease-out expo: fast start, smooth deceleration */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 800,
  format,
  className,
  style,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = prevValue.current;
    const diff = value - startValue;
    if (diff === 0) return;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = startValue + diff * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration]);

  const formatted = format ? format(displayValue) : displayValue.toLocaleString();

  return (
    <span className={className} style={style}>
      {formatted}
    </span>
  );
};

export default AnimatedNumber;
