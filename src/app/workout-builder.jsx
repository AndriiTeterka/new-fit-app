import React from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { ChevronLeft, Plus, Trash2, Copy, Save, Check } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { router, useLocalSearchParams } from "expo-router";
import { getTemplateById, upsertTemplate, deleteTemplate, duplicateTemplate } from "@/storage/templates";

export default function WorkoutBuilderScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams();
  const [template, setTemplate] = React.useState({
    id: null,
    title: "New Workout",
    duration: 30,
    difficulty: "Medium",
    category: "",
    exercises: [
      { id: String(Date.now()), name: "Exercise", sets: 3, reps: "8-12", restSec: 60 },
    ],
  });
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Load when editing existing
  React.useEffect(() => {
    const id = params?.id;
    if (!id) return;
    (async () => {
      const tpl = await getTemplateById(id);
      if (tpl) setTemplate({
        id: tpl.id,
        title: tpl.title || "Workout",
        duration: tpl.duration || 30,
        difficulty: tpl.difficulty || "Medium",
        category: tpl.category || "",
        exercises: Array.isArray(tpl.exercises) && tpl.exercises.length ? tpl.exercises : [{ id: String(Date.now()), name: "Exercise", sets: 3, reps: "8-12", restSec: 60 }],
      });
    })();
  }, [params?.id]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center" }}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color: colors.primary }}>Workout Builder</Text>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Title & Meta */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.secondary, marginBottom: 8 }}>Title</Text>
          <TextInput
            value={template.title}
            onChangeText={(v) => setTemplate((t) => ({ ...t, title: v }))}
            placeholder="Workout title"
            placeholderTextColor={colors.secondary}
            style={{ backgroundColor: colors.surfaceVariant, borderRadius: 12, padding: 12, color: colors.primary, fontFamily: "Inter_500Medium", marginBottom: 12 }}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.secondary, marginBottom: 8 }}>Duration (min)</Text>
              <TextInput
                keyboardType="number-pad"
                value={String(template.duration)}
                onChangeText={(v) => setTemplate((t) => ({ ...t, duration: parseInt(v || '0', 10) || 0 }))}
                style={{ backgroundColor: colors.surfaceVariant, borderRadius: 12, padding: 12, color: colors.primary, fontFamily: "Inter_500Medium" }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.secondary, marginBottom: 8 }}>Difficulty</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["Easy", "Medium", "Hard"].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setTemplate((t) => ({ ...t, difficulty: d }))}
                    style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: template.difficulty === d ? colors.yellow : colors.surface }}
                  >
                    <Text style={{ fontFamily: "Inter_500Medium", color: template.difficulty === d ? colors.background : colors.primary }}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Exercises */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.primary }}>Exercises</Text>
            <TouchableOpacity
              onPress={() => setTemplate((t) => ({ ...t, exercises: [...t.exercises, { id: String(Date.now()), name: "New Exercise", sets: 3, reps: "10", restSec: 60 }] }))}
              style={{ backgroundColor: colors.yellow, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Plus size={16} color={colors.background} />
                <Text style={{ fontFamily: "Inter_600SemiBold", marginLeft: 6, color: colors.background }}>Add</Text>
              </View>
            </TouchableOpacity>
          </View>

          {template.exercises.map((ex, idx) => (
            <View key={ex.id} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <TextInput
                value={ex.name}
                onChangeText={(v) => setTemplate((t) => ({ ...t, exercises: t.exercises.map((e) => (e.id === ex.id ? { ...e, name: v } : e)) }))}
                placeholder={`Exercise ${idx + 1}`}
                placeholderTextColor={colors.secondary}
                style={{ backgroundColor: colors.surfaceVariant, borderRadius: 10, padding: 10, color: colors.primary, fontFamily: "Inter_500Medium", marginBottom: 8 }}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter_500Medium", color: colors.secondary, marginBottom: 4 }}>Sets</Text>
                  <TextInput
                    keyboardType="number-pad"
                    value={String(ex.sets)}
                    onChangeText={(v) => setTemplate((t) => ({ ...t, exercises: t.exercises.map((e) => (e.id === ex.id ? { ...e, sets: parseInt(v || '0', 10) || 0 } : e)) }))}
                    style={{ backgroundColor: colors.surfaceVariant, borderRadius: 10, padding: 10, color: colors.primary }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter_500Medium", color: colors.secondary, marginBottom: 4 }}>Reps</Text>
                  <TextInput
                    value={String(ex.reps)}
                    onChangeText={(v) => setTemplate((t) => ({ ...t, exercises: t.exercises.map((e) => (e.id === ex.id ? { ...e, reps: v } : e)) }))}
                    style={{ backgroundColor: colors.surfaceVariant, borderRadius: 10, padding: 10, color: colors.primary }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter_500Medium", color: colors.secondary, marginBottom: 4 }}>Rest (sec)</Text>
                  <TextInput
                    keyboardType="number-pad"
                    value={String(ex.restSec)}
                    onChangeText={(v) => setTemplate((t) => ({ ...t, exercises: t.exercises.map((e) => (e.id === ex.id ? { ...e, restSec: parseInt(v || '0', 10) || 0 } : e)) }))}
                    style={{ backgroundColor: colors.surfaceVariant, borderRadius: 10, padding: 10, color: colors.primary }}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setTemplate((t) => ({ ...t, exercises: t.exercises.filter((e) => e.id !== ex.id) }))}
                style={{ alignSelf: "flex-end", marginTop: 8 }}
              >
                <Trash2 size={18} color={colors.red} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={{ height: 16 }} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={async () => {
              const saved = await upsertTemplate(template);
              router.replace(`/workout-detail?id=${encodeURIComponent(saved.id)}`);
            }}
            style={{ flex: 1, backgroundColor: colors.yellow, borderRadius: 14, paddingVertical: 14, alignItems: "center" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Check size={18} color={colors.background} />
              <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.background, marginLeft: 8 }}>Save</Text>
            </View>
          </TouchableOpacity>

          {template.id && (
            <TouchableOpacity
              onPress={async () => {
                const copy = await duplicateTemplate(template.id);
                if (copy) router.push(`/workout-detail?id=${encodeURIComponent(copy.id)}`);
              }}
              style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Copy size={18} color={colors.primary} />
                <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.primary, marginLeft: 8 }}>Duplicate</Text>
              </View>
            </TouchableOpacity>
          )}

          {template.id && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Delete Workout", "This cannot be undone.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: async () => { await deleteTemplate(template.id); router.replace("/(tabs)/workouts"); } },
                ])
              }
              style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.red }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Trash2 size={18} color={colors.background} />
                <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.background, marginLeft: 8 }}>Delete</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
