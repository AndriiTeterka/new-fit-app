import React from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';

// Fades content in whenever a screen gains focus (e.g., switching tabs)
// Uses a slower duration to make the effect more noticeable across the app
export default function FocusTransitionView({ style, children, duration = 500, fadeOnBlur = false, startOpacity = 0.88 }) {
  const focused = useIsFocused();
  const opacity = useSharedValue(1);
  const prevFocusedRef = React.useRef(focused);

  React.useEffect(() => {
    const easeOut = Easing.out(Easing.cubic);
    const easeIn = Easing.in(Easing.cubic);
    const wasFocused = prevFocusedRef.current;

    if (focused && !wasFocused) {
      // Focus gained
      if (fadeOnBlur) {
        // Tabs: start near-opaque then fade to 1
        opacity.value = startOpacity;
        opacity.value = withTiming(1, { duration, easing: easeOut });
      } else {
        // Stack: fade in from 0
        opacity.value = 0;
        opacity.value = withTiming(1, { duration, easing: easeOut });
      }
    } else if (!focused && wasFocused) {
      // Focus lost
      if (fadeOnBlur) {
        const blurDuration = Math.min(200, Math.max(80, Math.floor(duration * 0.35)));
        opacity.value = withTiming(startOpacity, { duration: blurDuration, easing: easeIn });
      } else {
        opacity.value = 1;
      }
    }

    prevFocusedRef.current = focused;
  }, [focused, duration, fadeOnBlur, startOpacity, opacity]);

  const styleA = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // Keep background static while only content fades to avoid white flashes
  return (
    <View style={[{ flex: 1 }, style]}>
      <Animated.View style={[{ flex: 1 }, styleA]}>{children}</Animated.View>
    </View>
  );
}
