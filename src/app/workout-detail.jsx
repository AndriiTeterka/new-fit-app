import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  ChevronLeft,
  Play,
  Edit,
  Copy,
  Calendar,
  Trash2,
  Clock,
  Target,
  Flame,
  Dumbbell,
  RotateCcw,
  Zap,
  Info,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams();
  const [isStarting, setIsStarting] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mock workout data - in real app this would come from params/API
  const workout = {
    id: 1,
    title: "Upper Body Strength",
    description:
      "Build strength in your chest, shoulders, back, and arms with this comprehensive upper body workout.",
    duration: 45,
    calories: 280,
    difficulty: "Medium",
    category: "Strength",
    equipment: ["Dumbbells", "Barbell", "Bench"],
    muscles: ["Chest", "Shoulders", "Back", "Arms"],
    lastCompleted: "2 days ago",
    completions: 12,
    exercises: [
      {
        id: 1,
        name: "Bench Press",
        sets: 4,
        reps: "8-10",
        weight: "135 lbs",
        restTime: 90,
        instructions:
          "Keep your back flat on the bench and lower the bar to your chest with control.",
        muscleGroups: ["Chest", "Shoulders", "Triceps"],
        equipment: "Barbell",
      },
      {
        id: 2,
        name: "Incline Dumbbell Press",
        sets: 3,
        reps: "10-12",
        weight: "35 lbs",
        restTime: 60,
        instructions:
          "Set the bench to 30-45 degrees and press the dumbbells up and slightly together.",
        muscleGroups: ["Upper Chest", "Shoulders"],
        equipment: "Dumbbells",
      },
      {
        id: 3,
        name: "Bent-Over Barbell Rows",
        sets: 4,
        reps: "8-10",
        weight: "115 lbs",
        restTime: 90,
        instructions:
          "Keep your back straight and pull the bar to your lower chest.",
        muscleGroups: ["Back", "Biceps"],
        equipment: "Barbell",
      },
      {
        id: 4,
        name: "Overhead Press",
        sets: 3,
        reps: "8-10",
        weight: "85 lbs",
        restTime: 75,
        instructions:
          "Stand tall and press the bar directly overhead, keeping your core tight.",
        muscleGroups: ["Shoulders", "Triceps"],
        equipment: "Barbell",
      },
      {
        id: 5,
        name: "Pull-ups",
        sets: 3,
        reps: "6-8",
        weight: "Bodyweight",
        restTime: 90,
        instructions:
          "Pull yourself up until your chin clears the bar, then lower with control.",
        muscleGroups: ["Back", "Biceps"],
        equipment: "Pull-up Bar",
      },
      {
        id: 6,
        name: "Dips",
        sets: 3,
        reps: "8-12",
        weight: "Bodyweight",
        restTime: 60,
        instructions:
          "Lower yourself until your shoulders are below your elbows, then push back up.",
        muscleGroups: ["Chest", "Shoulders", "Triceps"],
        equipment: "Dip Bars",
      },
    ],
  };

  if (!fontsLoaded) {
    return null;
  }

  const handleStartWorkout = () => {
    setIsStarting(true);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to workout session
      router.push("/workout-session");
    });
  };

  const handleSchedule = () => {
    Alert.alert(
      "Schedule Workout",
      "This feature would allow you to schedule this workout for a specific date and time.",
    );
  };

  const handleEdit = () => {
    router.push("/workout-builder");
  };

  const handleCopy = () => {
    Alert.alert(
      "Copy Workout",
      "This workout has been copied to your library.",
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => router.back() },
      ],
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return colors.green;
      case "Medium":
        return colors.yellow;
      case "Hard":
        return colors.orange;
      default:
        return colors.secondary;
    }
  };

  const ExerciseCard = ({ exercise, index }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      onPress={() => router.push("/exercise-detail")}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <View
              style={{
                backgroundColor: colors.yellow,
                width: 24,
                height: 24,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                  color: colors.background,
                }}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: colors.primary,
                flex: 1,
              }}
            >
              {exercise.name}
            </Text>
          </View>

          <View style={{ marginLeft: 36 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.secondary,
                  marginRight: 16,
                }}
              >
                {exercise.sets} sets × {exercise.reps}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.secondary,
                  marginRight: 16,
                }}
              >
                {exercise.weight}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Clock size={12} color={colors.secondary} />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                    marginLeft: 4,
                  }}
                >
                  {exercise.restTime}s rest
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.tertiary,
                lineHeight: 20,
                marginBottom: 8,
              }}
            >
              {exercise.instructions}
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {exercise.muscleGroups.map((muscle, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: colors.border + "40",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 11,
                      color: colors.secondary,
                    }}
                  >
                    {muscle}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: colors.background,
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
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={handleEdit}
            >
              <Edit size={18} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={handleCopy}
            >
              <Copy size={18} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={handleDelete}
            >
              <Trash2 size={18} color={colors.red} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Workout Info */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 28,
              color: colors.primary,
              marginBottom: 8,
            }}
          >
            {workout.title}
          </Text>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: colors.secondary,
              lineHeight: 24,
              marginBottom: 20,
            }}
          >
            {workout.description}
          </Text>

          {/* Stats */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View style={{ alignItems: "center", flex: 1 }}>
                <Clock
                  size={20}
                  color={colors.blue}
                  style={{ marginBottom: 8 }}
                />
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 18,
                    color: colors.primary,
                  }}
                >
                  {workout.duration}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                  }}
                >
                  Minutes
                </Text>
              </View>

              <View style={{ alignItems: "center", flex: 1 }}>
                <Target
                  size={20}
                  color={colors.green}
                  style={{ marginBottom: 8 }}
                />
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 18,
                    color: colors.primary,
                  }}
                >
                  {workout.exercises.length}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                  }}
                >
                  Exercises
                </Text>
              </View>

              <View style={{ alignItems: "center", flex: 1 }}>
                <Flame
                  size={20}
                  color={colors.orange}
                  style={{ marginBottom: 8 }}
                />
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 18,
                    color: colors.primary,
                  }}
                >
                  {workout.calories}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                  }}
                >
                  Calories
                </Text>
              </View>

              <View style={{ alignItems: "center", flex: 1 }}>
                <RotateCcw
                  size={20}
                  color={colors.purple}
                  style={{ marginBottom: 8 }}
                />
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 18,
                    color: colors.primary,
                  }}
                >
                  {workout.completions}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                  }}
                >
                  Completed
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    backgroundColor:
                      getDifficultyColor(workout.difficulty) + "20",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: getDifficultyColor(workout.difficulty),
                    }}
                  >
                    {workout.difficulty}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.border + "40",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: colors.secondary,
                    }}
                  >
                    {workout.category}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: colors.tertiary,
                }}
              >
                Last: {workout.lastCompleted}
              </Text>
            </View>
          </View>

          {/* Equipment & Muscles */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: colors.primary,
                  marginBottom: 8,
                }}
              >
                Equipment Needed
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {workout.equipment.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.yellow + "20",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color: colors.yellow,
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: colors.primary,
                  marginBottom: 8,
                }}
              >
                Target Muscles
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {workout.muscles.map((muscle, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.blue + "20",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color: colors.blue,
                      }}
                    >
                      {muscle}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Exercises */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.primary,
              marginBottom: 16,
            }}
          >
            Exercises ({workout.exercises.length})
          </Text>

          {workout.exercises.map((exercise, index) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background,
          paddingTop: 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.border,
              flex: 1,
            }}
            onPress={handleSchedule}
          >
            <Calendar size={20} color={colors.primary} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: colors.primary,
                marginLeft: 8,
              }}
            >
              Schedule
            </Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 2 }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.yellow,
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: isStarting ? 0.8 : 1,
              }}
              onPress={handleStartWorkout}
              disabled={isStarting}
            >
              <Play
                size={20}
                color={colors.background}
                fill={colors.background}
              />
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 16,
                  color: colors.background,
                  marginLeft: 8,
                }}
              >
                {isStarting ? "Starting..." : "Start Workout"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
