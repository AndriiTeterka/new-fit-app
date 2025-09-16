# -*- coding: utf-8 -*-
from pathlib import Path

path = Path('src/app/workout-builder.jsx')
text = path.read_text()

text = text.replace(
    "function ExerciseCard({ exercise, index, onDelete, onMoveByOffset, onEdit, onDragStateChange }) {\r\n",
    "function ExerciseCard({ exercise, index, count, onDelete, onMoveByOffset, onEdit, onDragStateChange }) {\r\n",
    1,
)

text = text.replace("  const swapCount = useSharedValue(0);\r\n", "", 1)
text = text.replace("  const lastSwapDir = useSharedValue(0);\r\n", "", 1)

old_block = """  const measuredH = useSharedValue(76);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      dragging.value = 1;
      swapCount.value = 0;
      lastSwapDir.value = 0;
      scale.value = withTiming(1.02, { duration: 70 });
      runOnJS(onDragStateChange)?.(true);
    })
    .onUpdate((event) => {
      'worklet';
      const h = measuredH.value || 76;
      const localY = event.translationY - swapCount.value * h;
      translateY.value = localY;
      // Compute absolute offset in rows, move in one step, keep under finger
      const offset = Math.round(localY / h);
      if (offset !== 0) {
        swapCount.value += offset;
        runOnJS(onMoveByOffset)(exercise.id, offset);
      }
    })
    .onEnd(() => {
      dragging.value = 0;
      translateY.value = withTiming(0, { duration: 80 });
      scale.value = withTiming(1, { duration: 80 });
      runOnJS(onDragStateChange)?.(false);
    });

"""

new_block = """  const measuredH = useSharedValue(76);
  const indexPosition = useSharedValue(index);
  const listSize = useSharedValue(count);

  React.useEffect(() => {
    indexPosition.value = index;
  }, [index, indexPosition]);

  React.useEffect(() => {
    listSize.value = count;
  }, [count, listSize]);

  const notifyDragState = React.useCallback(
    (active) => {
      onDragStateChange?.(active);
    },
    [onDragStateChange]
  );

  const handleSwap = React.useCallback(
    (direction) => {
      onMoveByOffset(exercise.id, direction);
      if (typeof Haptics.selectionAsync === "function") {
        Haptics.selectionAsync().catch(() => {});
      }
    },
    [exercise.id, onMoveByOffset]
  );

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .onStart((_, ctx) => {
          'worklet';
          ctx.offsetY = 0;
          dragging.value = 1;
          scale.value = withTiming(1.03, { duration: 90 });
          runOnJS(notifyDragState)(true);
        })
        .onUpdate((event, ctx) => {
          'worklet';
          const baseHeight = (measuredH.value || 76) + 12;
          const offset = ctx.offsetY ?? 0;
          const total = event.translationY + offset;
          const currentIndex = indexPosition.value;
          const maxUp = -currentIndex * baseHeight;
          const maxDown = (listSize.value - 1 - currentIndex) * baseHeight;

          let clamped = total;
          if (clamped < maxUp) {
            clamped = maxUp;
          } else if (clamped > maxDown) {
            clamped = maxDown;
          }

          translateY.value = clamped;
          ctx.offsetY = clamped - event.translationY;

          const threshold = baseHeight * 0.45;

          if (clamped >= threshold && currentIndex < listSize.value - 1) {
            ctx.offsetY -= baseHeight;
            translateY.value = event.translationY + ctx.offsetY;
            indexPosition.value = currentIndex + 1;
            runOnJS(handleSwap)(1);
            return;
          }

          if (clamped <= -threshold && currentIndex > 0) {
            ctx.offsetY += baseHeight;
            translateY.value = event.translationY + ctx.offsetY;
            indexPosition.value = currentIndex - 1;
            runOnJS(handleSwap)(-1);
          }
        })
        .onFinalize(() => {
          'worklet';
          dragging.value = 0;
          translateY.value = withTiming(0, { duration: 140 });
          scale.value = withTiming(1, { duration: 140 });
          runOnJS(notifyDragState)(false);
        }),
    [handleSwap, notifyDragState]
  );

"""

old_block = old_block.replace('\n', '\r\n')
new_block = new_block.replace('\n', '\r\n')
text = text.replace(old_block, new_block, 1)

text = text.replace(
    "                    onEdit={() => openEdit(index)}\r\n                    onDragStateChange={setIsReordering}",
    "                    onEdit={() => openEdit(index)}\r\n                    count={exercises.length}\r\n                    onDragStateChange={setIsReordering}",
    1,
)

path.write_text(text)
