import React from 'react';
import { Platform } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function ModalTransitionView({ visible = true, children, style }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);

  React.useEffect(() => {
    const duration = 240;
    const easing = Easing.out(Easing.cubic);
    if (visible) {
      opacity.value = 0;
      scale.value = Platform.OS === 'ios' ? 0.96 : 0.98;
      opacity.value = withTiming(1, { duration, easing });
      scale.value = withTiming(1, { duration, easing });
    } else {
      opacity.value = withTiming(0, { duration: 140, easing: Easing.in(Easing.cubic) });
      scale.value = withTiming(0.98, { duration: 140, easing: Easing.in(Easing.cubic) });
    }
  }, [visible, opacity, scale]);

  const styleA = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={[style, styleA]}>{children}</Animated.View>;
}


