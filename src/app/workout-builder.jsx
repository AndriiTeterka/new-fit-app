import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Plus, Trash2, GripVertical, Clock, Target, Edit } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Layout } from "react-native-reanimated";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import FocusTransitionView from "@/components/FocusTransitionView";
import { onSelectExercise } from "@/utils/selectionBus";
import { useQueryClient } from "@tanstack/react-query";
import { getTemplateById, upsertTemplate } from "@/storage/templates";
import { upsertTemplateRemote } from "@/queries/templates";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";

export default function WorkoutBuilderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

  const [workoutName, setWorkoutName] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("30");
  const [difficulty, setDifficulty] = useState("Medium");
  const [exercises, setExercises] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ sets: "", reps: "", weight: "", time: "" });
  const [isReordering, setIsReordering] = useState(false);

  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    (async () => {
      const tpl = await getTemplateById(String(id));
      if (!tpl) return;
      setWorkoutName(tpl.title || "Workout");
      setEstimatedDuration(String(tpl.duration || 30));
      setDifficulty(tpl.difficulty || "Medium");
      setExercises(
        Array.isArray(tpl.exercises)
          ? tpl.exercises.map((e) => ({
              id: e.id,
              name: e.name,
              muscle_group: e.muscle_group || "",
              default_sets: e.sets ?? 3,
              default_reps: e.reps ?? "10",
              default_duration: null,
              default_rest_time: e.restSec ?? 60,
            }))
          : []
      );
    })();
  }, [params?.id]);

  useEffect(() => {
    const unsub = onSelectExercise((ex) => {
      setExercises((prev) => {
        const exists = prev.some((p) => String(p.id) === String(ex.id));
        if (exists) return prev;
        return [
          ...prev,
          {
            id: ex.id,
            name: ex.name,
            muscle_group: ex.muscle_group,
            default_sets: ex.default_sets ?? 3,
            default_reps: ex.default_reps ?? "10",
            default_duration: ex.default_duration ?? null,
            default_rest_time: ex.default_rest_time ?? 60,
          },
        ];
      });
    });
    return () => { try { unsub(); } catch {} };
  }, []);

  if (!fontsLoaded) return null;

  const difficulties = ["Easy", "Medium", "Hard"];
  const getDifficultyColor = (level) => (level === "Easy" ? "#4ADE80" : level === "Medium" ? "#FFD60A" : "#FF6B6B");

  const addExercise = () => router.push("/exercises?selectMode=true");

  const deleteExercise = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const moveExerciseById = (exerciseId, direction) => {
    setExercises((prev) => {
      const fromIndex = prev.findIndex((e) => String(e.id) === String(exerciseId));
      if (fromIndex === -1) return prev;
      const toIndex = fromIndex + direction;
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const moveExerciseByOffset = (exerciseId, offset) => {
    if (!offset) return;
    setExercises((prev) => {
      const fromIndex = prev.findIndex((e) => String(e.id) === String(exerciseId));
      if (fromIndex === -1) return prev;
      let toIndex = fromIndex + offset;
      if (toIndex < 0) toIndex = 0;
      if (toIndex > prev.length - 1) toIndex = prev.length - 1;
      if (toIndex === fromIndex) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const openEdit = (idx) => {
    const ex = exercises[idx];
    if (!ex) return;
    setEditingIndex(idx);
    setEditForm({
      sets: String(ex.sets ?? ex.default_sets ?? ""),
      reps: String(ex.reps ?? ex.default_reps ?? ""),
      weight: String(ex.weight ?? ""),
      time: String(ex.restSec ?? ex.default_rest_time ?? ""),
    });
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    setExercises((prev) => prev.map((e, i) => (
      i === editingIndex
        ? {
            ...e,
            sets: parseInt(editForm.sets || '0', 10) || e.sets || e.default_sets || 0,
            reps: editForm.reps || e.reps || e.default_reps || '',
            weight: editForm.weight || e.weight || '',
            restSec: parseInt(editForm.time || String(e.restSec || e.default_rest_time || 0), 10) || e.restSec || e.default_rest_time || 0,
          }
        : e
    )));
    setEditingIndex(null);
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) { Alert.alert("Error", "Please enter a workout name"); return; }
    if (exercises.length === 0) { Alert.alert("Error", "Please add at least one exercise"); return; }
    const template = {
      id: params?.id ?? null,
      title: workoutName,
      duration: estimatedDuration ? parseInt(String(estimatedDuration), 10) : 0,
      difficulty,
      category: "",
      exercises: exercises.map((e) => ({ id: e.id, name: e.name, muscle_group: e.muscle_group, sets: e.sets ?? e.default_sets ?? 3, reps: e.reps ?? e.default_reps ?? "10", restSec: e.restSec ?? e.default_rest_time ?? 60 })),
    };
    try { await upsertTemplateRemote(template); } catch {}
    const saved = await upsertTemplate(template);
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(`/workout-detail?id=${encodeURIComponent(saved.id)}`);
  };

  return (
    <FocusTransitionView style={{ flex: 1, backgroundColor: "#000000" }}>
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />

        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#1C1C1E" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#1C1C1E", justifyContent: "center", alignItems: "center" }} onPress={() => router.back()} activeOpacity={0.8}>
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 18, color: "#FFFFFF" }}>Workout Builder</Text>
            <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#FFD60A", borderRadius: 20 }} onPress={saveWorkout} activeOpacity={0.8}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#000000" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isReordering}
        >
          <View style={{ marginTop: 24, marginBottom: 32 }}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 20, color: "#FFFFFF", marginBottom: 20 }}>Workout Details</Text>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#8E8E93", marginBottom: 8 }}>Workout Name</Text>
              <TextInput style={{ backgroundColor: "#1C1C1E", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: "Inter_400Regular", fontSize: 16, color: "#FFFFFF" }} placeholder="Enter workout name..." placeholderTextColor="#8E8E93" value={workoutName} onChangeText={setWorkoutName} />
            </View>

            <View style={{ flexDirection: "row", gap: 16, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#8E8E93", marginBottom: 8 }}>Duration (min)</Text>
                <View style={{ backgroundColor: "#1C1C1E", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Clock size={16} color="#8E8E93" />
                  <TextInput style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 16, color: "#FFFFFF" }} placeholder="30" placeholderTextColor="#8E8E93" value={estimatedDuration} onChangeText={setEstimatedDuration} keyboardType="numeric" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#8E8E93", marginBottom: 8 }}>Difficulty</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {difficulties.map((level) => (
                    <TouchableOpacity key={level} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: difficulty === level ? getDifficultyColor(level) : "#1C1C1E", borderRadius: 8 }} onPress={() => setDifficulty(level)} activeOpacity={0.8}>
                      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: difficulty === level ? "#000000" : "#FFFFFF" }}>{level}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#8E8E93", marginBottom: 8 }}>Notes (Optional)</Text>
              <TextInput style={{ backgroundColor: "#1C1C1E", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: "Inter_400Regular", fontSize: 16, color: "#FFFFFF", height: 80, textAlignVertical: "top" }} placeholder="Add any notes about this workout..." placeholderTextColor="#8E8E93" value={workoutNotes} onChangeText={setWorkoutNotes} multiline />
            </View>
          </View>

          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 20, color: "#FFFFFF" }}>Exercises ({exercises.length})</Text>
              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C1E", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 }} onPress={addExercise} activeOpacity={0.8}>
                <Plus size={16} color="#FFD60A" strokeWidth={2} />
                <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#FFD60A" }}>Add Exercise</Text>
              </TouchableOpacity>
            </View>

            {exercises.length === 0 ? (
              <View style={{ backgroundColor: "#1C1C1E", borderRadius: 16, padding: 32, alignItems: "center" }}>
                <Target size={48} color="#8E8E93" strokeWidth={1} />
                <Text style={{ fontFamily: "Inter_500Medium", fontSize: 16, color: "#FFFFFF", marginTop: 16, textAlign: "center" }}>No exercises added yet</Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: "#8E8E93", marginTop: 8, textAlign: "center" }}>Tap "Add Exercise" to get started</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={String(exercise.id)}
                    exercise={exercise}
                    index={index}
                    count={exercises.length}
                    onDelete={() => deleteExercise(index)}
                    onMoveByOffset={moveExerciseByOffset}
                    onEdit={() => openEdit(index)}
                    onDragStateChange={setIsReordering}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {editingIndex !== null && (
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '90%', backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2C2C2E' }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFFFFF', marginBottom: 12 }}>Edit Exercise</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', color: '#8E8E93', marginBottom: 4 }}>Sets</Text>
                  <TextInput keyboardType="number-pad" value={editForm.sets} onChangeText={(v) => setEditForm((f) => ({ ...f, sets: v }))} style={{ backgroundColor: '#111', borderRadius: 10, padding: 10, color: '#fff' }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', color: '#8E8E93', marginBottom: 4 }}>Reps</Text>
                  <TextInput value={editForm.reps} onChangeText={(v) => setEditForm((f) => ({ ...f, reps: v }))} style={{ backgroundColor: '#111', borderRadius: 10, padding: 10, color: '#fff' }} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', color: '#8E8E93', marginBottom: 4 }}>Weight</Text>
                  <TextInput value={editForm.weight} onChangeText={(v) => setEditForm((f) => ({ ...f, weight: v }))} placeholder="e.g. 40 kg" placeholderTextColor="#8E8E93" style={{ backgroundColor: '#111', borderRadius: 10, padding: 10, color: '#fff' }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', color: '#8E8E93', marginBottom: 4 }}>Rest (sec)</Text>
                  <TextInput keyboardType="number-pad" value={editForm.time} onChangeText={(v) => setEditForm((f) => ({ ...f, time: v }))} style={{ backgroundColor: '#111', borderRadius: 10, padding: 10, color: '#fff' }} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <TouchableOpacity onPress={() => setEditingIndex(null)} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2C2C2E' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#8E8E93' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveEdit} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#FFD60A' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#000' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingAnimatedView>
    </FocusTransitionView>
  );
}

function ExerciseCard({ exercise, index, count, onDelete, onMoveByOffset, onEdit, onDragStateChange }) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const dragging = useSharedValue(0);
  const measuredH = useSharedValue(76);
  const swapOffset = useSharedValue(0);
  const startIndex = useSharedValue(index);
  const totalCount = useSharedValue(count);

  const triggerDragStartHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const triggerSwapHaptic = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(150)
    .maxPointers(1)
    .onStart(() => {
      dragging.value = 1;
      swapOffset.value = 0;
      startIndex.value = index;
      totalCount.value = count;
      translateY.value = 0;
      scale.value = withTiming(1.02, { duration: 120 });
      runOnJS(onDragStateChange)?.(true);
      runOnJS(triggerDragStartHaptic)();
    })
    .onUpdate((event) => {
      'worklet';
      const itemHeight = measuredH.value || 76;
      const relativeY = event.translationY - swapOffset.value * itemHeight;
      translateY.value = relativeY;

      if (relativeY > itemHeight / 2 && startIndex.value + swapOffset.value < totalCount.value - 1) {
        swapOffset.value += 1;
        translateY.value = event.translationY - swapOffset.value * itemHeight;
        runOnJS(onMoveByOffset)(exercise.id, 1);
        runOnJS(triggerSwapHaptic)();
      } else if (relativeY < -itemHeight / 2 && startIndex.value + swapOffset.value > 0) {
        swapOffset.value -= 1;
        translateY.value = event.translationY - swapOffset.value * itemHeight;
        runOnJS(onMoveByOffset)(exercise.id, -1);
        runOnJS(triggerSwapHaptic)();
      }
    })
    .onFinalize(() => {
      dragging.value = 0;
      swapOffset.value = 0;
      translateY.value = withTiming(0, { duration: 160 });
      scale.value = withTiming(1, { duration: 160 });
      runOnJS(onDragStateChange)?.(false);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    zIndex: dragging.value ? 10 : 0,
  }));

  const setsValue = exercise.sets ?? exercise.default_sets;
  const metaPieces = [];
  if (setsValue !== undefined && setsValue !== null && setsValue !== '') {
    metaPieces.push(`${setsValue} sets`);
  }
  if (exercise.muscle_group) {
    metaPieces.push(exercise.muscle_group);
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[animatedStyle]}
        layout={Layout.springify().damping(18).stiffness(220)}
        onLayout={(e) => {
          measuredH.value = e.nativeEvent.layout.height || measuredH.value;
        }}
      >
        <View style={{ backgroundColor: "#1C1C1E", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={{ marginRight: 12, padding: 4 }} activeOpacity={0.6}>
            <GripVertical size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#FFFFFF", marginBottom: 4 }}>
              {exercise.name}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: "#8E8E93" }}>
              {metaPieces.join(' | ')}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#2C2C2E", justifyContent: "center", alignItems: "center" }} onPress={onEdit} activeOpacity={0.8}>
              <Edit size={16} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#FF6B6B", justifyContent: "center", alignItems: "center" }} onPress={onDelete} activeOpacity={0.8}>
              <Trash2 size={16} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
