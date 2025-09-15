type Listener = (exercise: any) => void;

const listeners = new Set<Listener>();

export function publishSelectedExercise(exercise: any) {
  listeners.forEach((l) => {
    try { l(exercise); } catch {}
  });
}

export function onSelectExercise(listener: Listener) {
  listeners.add(listener);
  return () => {
    try { listeners.delete(listener); } catch {}
  };
}

