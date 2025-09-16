import React from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';

export default function FocusTransitionView({
  style,
  children,
  duration = 500,
  fadeOnBlur = false,
  startOpacity: startOpacityProp,
}) {
  const focused = useIsFocused();
  const prevFocusedRef = React.useRef(null);

  const normalizedStartOpacity = React.useMemo(() => {
    const fallback = fadeOnBlur ? 0.1 : 0;
    const value = startOpacityProp ?? fallback;
    return Math.min(1, Math.max(0, value));
  }, [fadeOnBlur, startOpacityProp]);

  const focusStart = fadeOnBlur ? normalizedStartOpacity : 0;
  const blurTarget = fadeOnBlur ? normalizedStartOpacity : 0;

  const opacity = useSharedValue(focused ? focusStart : blurTarget);

  React.useEffect(() => {
    const easeOut = Easing.out(Easing.cubic);
    const easeIn = Easing.in(Easing.cubic);
    const wasFocused = prevFocusedRef.current;

    const focusDuration = Math.max(120, duration);
    const blurDuration = fadeOnBlur
      ? Math.min(focusDuration, Math.max(90, Math.floor(duration * 0.35)))
      : Math.min(260, Math.max(120, Math.floor(duration * 0.55)));

    if (focused) {
      const shouldAnimateIn = wasFocused !== true;
      if (shouldAnimateIn) {
        opacity.value = focusStart;
        opacity.value = withTiming(1, { duration: focusDuration, easing: easeOut });
      }
    } else {
      const target = blurTarget;
      const shouldAnimateOut = wasFocused === true || opacity.value !== target;
      if (shouldAnimateOut) {
        opacity.value = withTiming(target, { duration: blurDuration, easing: easeIn });
      }
    }

    prevFocusedRef.current = focused;
  }, [focused, duration, fadeOnBlur, focusStart, blurTarget, opacity]);

  const styleA = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[{ flex: 1 }, style]}>
      <Animated.View style={[{ flex: 1 }, styleA]}>{children}</Animated.View>
    </View>
  );
}
