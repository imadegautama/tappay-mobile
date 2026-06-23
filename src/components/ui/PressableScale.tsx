import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { mass: 0.4, damping: 12, stiffness: 220 } as const;

type PressableScaleProps = PressableProps & {
  /** Scale applied while pressed. Defaults to a subtle 0.97. */
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Pressable that springs to a slightly smaller scale on press — the project-wide
 * tap feedback for buttons, cards, tiles and list rows. Reanimated honors the
 * system "Reduce Motion" setting automatically.
 */
export function PressableScale({
  scaleTo = 0.97,
  style,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(event) => {
        scale.value = withSpring(scaleTo, SPRING);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, SPRING);
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
