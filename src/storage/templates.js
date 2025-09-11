import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@workout_templates";

const DEFAULT_TEMPLATES = [
  {
    id: String(Date.now() - 30000),
    title: "Upper Body Strength",
    duration: 45,
    calories: 280,
    difficulty: "Medium",
    category: "Strength",
    lastCompleted: "Never",
    isPremium: false,
    tags: ["upper", "push"],
    exercises: [
      { id: "e1", name: "Bench Press", sets: 4, reps: "8-10", restSec: 90 },
      { id: "e2", name: "Incline Dumbbell Press", sets: 3, reps: "10-12", restSec: 60 },
      { id: "e3", name: "Bent-Over Barbell Rows", sets: 4, reps: "8-10", restSec: 90 },
    ],
    updatedAt: Date.now() - 30000,
  },
  {
    id: String(Date.now() - 20000),
    title: "HIIT Cardio Blast",
    duration: 30,
    calories: 350,
    difficulty: "Hard",
    category: "Cardio",
    lastCompleted: "Never",
    isPremium: false,
    tags: ["cardio", "hiit"],
    exercises: [
      { id: "e1", name: "Burpees", sets: 5, reps: "40s", restSec: 20 },
      { id: "e2", name: "Mountain Climbers", sets: 5, reps: "40s", restSec: 20 },
    ],
    updatedAt: Date.now() - 20000,
  },
  {
    id: String(Date.now() - 10000),
    title: "Lower Body Power",
    duration: 50,
    calories: 320,
    difficulty: "Medium",
    category: "Strength",
    lastCompleted: "Never",
    isPremium: false,
    tags: ["lower", "legs"],
    exercises: [
      { id: "e1", name: "Squat", sets: 4, reps: "6-8", restSec: 120 },
      { id: "e2", name: "Romanian Deadlift", sets: 3, reps: "8-10", restSec: 90 },
      { id: "e3", name: "Walking Lunges", sets: 3, reps: "12-14", restSec: 60 },
    ],
    updatedAt: Date.now() - 10000,
  },
];

export async function getTemplates() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      await AsyncStorage.setItem(KEY, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export async function saveTemplates(templates) {
  await AsyncStorage.setItem(KEY, JSON.stringify(templates));
}

export async function getTemplateById(id) {
  const all = await getTemplates();
  return all.find((t) => String(t.id) === String(id)) || null;
}

export async function upsertTemplate(template) {
  const all = await getTemplates();
  let next;
  if (!template.id) {
    template.id = String(Date.now());
  }
  template.updatedAt = Date.now();
  const idx = all.findIndex((t) => String(t.id) === String(template.id));
  if (idx >= 0) {
    next = [...all];
    next[idx] = { ...all[idx], ...template };
  } else {
    next = [...all, template];
  }
  await saveTemplates(next);
  return template;
}

export async function deleteTemplate(id) {
  const all = await getTemplates();
  const next = all.filter((t) => String(t.id) !== String(id));
  await saveTemplates(next);
}

export async function duplicateTemplate(id) {
  const t = await getTemplateById(id);
  if (!t) return null;
  const copy = { ...t, id: String(Date.now()), title: `${t.title} (Copy)`, updatedAt: Date.now() };
  const all = await getTemplates();
  const next = [...all, copy];
  await saveTemplates(next);
  return copy;
}

