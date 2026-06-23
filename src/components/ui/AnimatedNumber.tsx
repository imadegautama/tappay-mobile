import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

type AnimatedNumberProps = {
  value: number;
  /** Formatter applied to the interpolated value (e.g. formatCurrency). */
  format: (value: number) => string;
  duration?: number;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  accessibilityLabel?: string;
};

/**
 * Counts up to `value` with an ease-out curve on the JS thread, then renders the
 * formatted result. Runs only on mount and when the value actually changes, and
 * snaps instantly when the user has Reduce Motion enabled.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 900,
  style,
  numberOfLines,
  adjustsFontSizeToFit,
  accessibilityLabel,
}: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;

    if (reduceMotion || from === to) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, reduceMotion]);

  return (
    <Text
      style={style}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      accessibilityLabel={accessibilityLabel ?? format(value)}
    >
      {format(display)}
    </Text>
  );
}
