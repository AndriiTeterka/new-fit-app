import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Search, SlidersHorizontal, Target, Dumbbell, Heart, Zap, Clock, AlertTriangle, Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useExercises } from "@/queries/exercises";
import { publishSelectedExercise } from "@/utils/selectionBus";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import FocusTransitionView from "@/components/FocusTransitionView";

export default function ExercisesScreen() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectMode } = useLocalSearchParams();

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const { data: exercises = [], isLoading, error, refetch } = useExercises({
    search: searchText,
    category: selectedCategory,
    difficulty: selectedDifficulty,
  });

  const categories = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "#4ADE80";
      case "Medium": return "#FFD60A";
      case "Hard": return "#FF6B6B";
      default: return "#FFD60A";
    }
  };
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "Easy": return <Target size={16} color="#4ADE80" />;
      case "Medium": return <Zap size={16} color="#FFD60A" />;
      case "Hard": return <AlertTriangle size={16} color="#FF6B6B" />;
      default: return <Target size={16} color="#FFD60A" />;
    }
  };
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Cardio": return <Heart size={20} color="#06B6D4" />;
      case "Core": return <Target size={20} color="#10B981" />;
      default: return <Dumbbell size={20} color="#8B5CF6" />;
    }
  };

  const onRefresh = useCallback(() => { refetch(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }, [refetch]);
  const openDetails = (exercise) => {
    router.push(`/exercise-detail?id=${encodeURIComponent(exercise.id)}`);
  };
  const addToWorkout = (exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try { publishSelectedExercise(exercise); } catch {}
    if (selectMode === "true") {
      router.back();
    } else {
      Alert.alert("Added", `${exercise.name} added to workout builder`);
    }
  };

  if (!fontsLoaded) return null;
  if (error) { Alert.alert("Error", "Failed to load exercises"); }

  return (
    <FocusTransitionView style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text style={{ fontFamily: "Inter_700Bold", fontSize: 32, color: "#fff", marginBottom: 20 }}>
          {selectMode === "true" ? "Select Exercise" : "Exercise Library"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C1E", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
            <Search size={20} color="#8E8E93" />
            <TextInput style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 16, color: "#fff" }} placeholder="Search exercises..." placeholderTextColor="#8E8E93" value={searchText} onChangeText={setSearchText} />
          </View>
          <TouchableOpacity style={{ width: 44, height: 44, backgroundColor: showFilters ? "#FFD60A" : "#1C1C1E", borderRadius: 12, justifyContent: "center", alignItems: "center" }} onPress={() => setShowFilters(!showFilters)} activeOpacity={0.8}>
            <SlidersHorizontal size={20} color={showFilters ? "#000" : "#8E8E93"} />
          </TouchableOpacity>
        </View>
        {showFilters && (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#8E8E93", marginBottom: 8 }}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {categories.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setSelectedCategory(c)} style={{ backgroundColor: selectedCategory === c ? "#FFD60A" : "#1C1C1E", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {getCategoryIcon(c)}
                    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: selectedCategory === c ? "#000" : "#8E8E93" }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#8E8E93", marginBottom: 8 }}>Difficulty</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {difficulties.map((d) => (
                  <TouchableOpacity key={d} onPress={() => setSelectedDifficulty(d)} style={{ backgroundColor: selectedDifficulty === d ? "#FFD60A" : "#1C1C1E", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {getDifficultyIcon(d)}
                    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: selectedDifficulty === d ? "#000" : "#8E8E93" }}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#fff" />}>
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#8E8E93", marginBottom: 12 }}>{exercises.length} exercises found</Text>
        {isLoading ? (
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: "#8E8E93" }}>Loading exercises...</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {exercises.map((exercise) => (
              <TouchableOpacity key={exercise.id} style={{ backgroundColor: "#111", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#1C1C1E" }} onPress={() => openDetails(exercise)} activeOpacity={0.9}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff" }}>{exercise.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {getDifficultyIcon(exercise.difficulty)}
                    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: getDifficultyColor(exercise.difficulty) }}>{exercise.difficulty}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {getCategoryIcon(exercise.muscle_group)}
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#8E8E93" }}>{exercise.muscle_group}</Text>
                </View>
                {exercise.equipment && exercise.equipment !== 'None' && (
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#8E8E93" }}>Equipment: {exercise.equipment}</Text>
                )}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
                  {exercise.default_sets ? (
                    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: "#8E8E93" }}>{exercise.default_sets} sets</Text>
                  ) : null}
                  {exercise.default_reps ? (
                    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: "#8E8E93" }}>{exercise.default_reps} reps</Text>
                  ) : null}
                  {exercise.default_duration ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="#8E8E93" />
                      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: "#8E8E93" }}>{exercise.default_duration}</Text>
                    </View>
                  ) : null}
                </View>
                {(exercise.default_sets || exercise.default_reps) && (
                  <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: "#8E8E93", marginTop: 6 }}>
                    Recommended: {exercise.default_sets ? `${exercise.default_sets} sets` : ''}{exercise.default_sets && exercise.default_reps ? ' • ' : ''}{exercise.default_reps ? `${exercise.default_reps} reps` : ''}
                  </Text>
                )}
                <View style={{ marginTop: 12, alignItems: "flex-end" }}>
                  <TouchableOpacity
                    onPress={() => addToWorkout(exercise)}
                    style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FFD60A", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
                    activeOpacity={0.9}
                  >
                    <Plus size={16} color="#000" />
                    <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#000", marginLeft: 6 }}>Add to workout</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </FocusTransitionView>
  );
}
