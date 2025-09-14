import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  Target,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function WorkoutBuilderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [workoutName, setWorkoutName] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("30");
  const [difficulty, setDifficulty] = useState("Medium");
  const [exercises, setExercises] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Create workout mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async (workoutData) => {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutData),
      });
      if (!response.ok) {
        throw new Error("Failed to create workout");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Workout saved successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to save workout");
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  const difficulties = ["Easy", "Medium", "Hard"];

  const getDifficultyColor = (level) => {
    switch (level) {
      case "Easy":
        return "#4ADE80";
      case "Medium":
        return "#FFD60A";
      case "Hard":
        return "#FF6B6B";
      default:
        return "#FFD60A";
    }
  };

  const addExercise = () => {
    router.push("/(tabs)/exercises?selectMode=true");
  };

  const deleteExercise = (index) => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to remove this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setExercises(exercises.filter((_, i) => i !== index));
          },
        },
      ],
    );
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Error", "Please enter a workout name");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise");
      return;
    }

    const workoutData = {
      name: workoutName,
      notes: workoutNotes || null,
      estimated_duration: estimatedDuration
        ? parseInt(estimatedDuration)
        : null,
      difficulty,
      exercises: exercises.map((exercise) => ({
        exercise_id: exercise.id,
        sets: exercise.sets || exercise.default_sets,
        reps: exercise.reps || exercise.default_reps,
        weight: exercise.weight || null,
        duration: exercise.duration || exercise.default_duration,
        rest_time: exercise.rest_time || exercise.default_rest_time,
        notes: exercise.notes || null,
      })),
    };

    createWorkoutMutation.mutate(workoutData);
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <StatusBar style="light" />

        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 10,
            paddingHorizontal: 20,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#1C1C1E",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#1C1C1E",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>

            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: "#FFFFFF",
              }}
            >
              Workout Builder
            </Text>

            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: createWorkoutMutation.isLoading
                  ? "#8E8E93"
                  : "#FFD60A",
                borderRadius: 20,
              }}
              onPress={saveWorkout}
              activeOpacity={0.8}
              disabled={createWorkoutMutation.isLoading}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: "#000000",
                }}
              >
                {createWorkoutMutation.isLoading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Workout Details */}
          <View style={{ marginTop: 24, marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 20,
                color: "#FFFFFF",
                marginBottom: 20,
              }}
            >
              Workout Details
            </Text>

            {/* Workout Name */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: "#8E8E93",
                  marginBottom: 8,
                }}
              >
                Workout Name
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#1C1C1E",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
                placeholder="Enter workout name..."
                placeholderTextColor="#8E8E93"
                value={workoutName}
                onChangeText={setWorkoutName}
              />
            </View>

            {/* Duration and Difficulty Row */}
            <View style={{ flexDirection: "row", gap: 16, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: "#8E8E93",
                    marginBottom: 8,
                  }}
                >
                  Duration (min)
                </Text>
                <View
                  style={{
                    backgroundColor: "#1C1C1E",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Clock size={16} color="#8E8E93" />
                  <TextInput
                    style={{
                      flex: 1,
                      fontFamily: "Inter_400Regular",
                      fontSize: 16,
                      color: "#FFFFFF",
                    }}
                    placeholder="30"
                    placeholderTextColor="#8E8E93"
                    value={estimatedDuration}
                    onChangeText={setEstimatedDuration}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: "#8E8E93",
                    marginBottom: 8,
                  }}
                >
                  Difficulty
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {difficulties.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor:
                          difficulty === level
                            ? getDifficultyColor(level)
                            : "#1C1C1E",
                        borderRadius: 8,
                      }}
                      onPress={() => setDifficulty(level)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          color: difficulty === level ? "#000000" : "#FFFFFF",
                        }}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Notes */}
            <View>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: "#8E8E93",
                  marginBottom: 8,
                }}
              >
                Notes (Optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#1C1C1E",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: "#FFFFFF",
                  height: 80,
                  textAlignVertical: "top",
                }}
                placeholder="Add any notes about this workout..."
                placeholderTextColor="#8E8E93"
                value={workoutNotes}
                onChangeText={setWorkoutNotes}
                multiline
              />
            </View>
          </View>

          {/* Exercises Section */}
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 20,
                  color: "#FFFFFF",
                }}
              >
                Exercises ({exercises.length})
              </Text>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1C1C1E",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  gap: 6,
                }}
                onPress={addExercise}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFD60A" strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: "#FFD60A",
                  }}
                >
                  Add Exercise
                </Text>
              </TouchableOpacity>
            </View>

            {exercises.length === 0 ? (
              <View
                style={{
                  backgroundColor: "#1C1C1E",
                  borderRadius: 16,
                  padding: 32,
                  alignItems: "center",
                }}
              >
                <Target size={48} color="#8E8E93" strokeWidth={1} />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: "#FFFFFF",
                    marginTop: 16,
                    textAlign: "center",
                  }}
                >
                  No exercises added yet
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: "#8E8E93",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Tap "Add Exercise" to get started
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={`${exercise.id}-${index}`}
                    exercise={exercise}
                    index={index}
                    onDelete={() => deleteExercise(index)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

function ExerciseCard({ exercise, index, onDelete }) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
      scale.value = interpolate(
        Math.abs(event.translationY),
        [0, 100],
        [1, 0.95],
        { extrapolateRight: "clamp" },
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationY) > 100) {
        // Swipe threshold reached - trigger delete
        runOnJS(onDelete)();
      }

      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: interpolate(Math.abs(translateY.value), [0, 100], [1, 0.7], {
      extrapolateRight: "clamp",
    }),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[animatedStyle]}>
        <View
          style={{
            backgroundColor: "#1C1C1E",
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{
              marginRight: 12,
              padding: 4,
            }}
            activeOpacity={0.6}
          >
            <GripVertical size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: "#FFFFFF",
                marginBottom: 4,
              }}
            >
              {exercise.name}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: "#8E8E93",
              }}
            >
              {exercise.default_sets || exercise.sets} sets •{" "}
              {exercise.muscle_group}
            </Text>
          </View>

          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#FF6B6B",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onDelete}
            activeOpacity={0.8}
          >
            <Trash2 size={16} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
