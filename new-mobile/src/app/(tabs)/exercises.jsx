import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Search,
  SlidersHorizontal,
  Target,
  Dumbbell,
  Heart,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function ExercisesScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectMode } = useLocalSearchParams();

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch exercises from API
  const {
    data: exercisesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["exercises", searchText, selectedCategory, selectedDifficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (selectedCategory !== "All")
        params.append("category", selectedCategory);
      if (selectedDifficulty !== "All")
        params.append("difficulty", selectedDifficulty);

      const response = await fetch(`/api/exercises?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }
      const result = await response.json();
      return result.data;
    },
  });

  const exercises = exercisesData || [];

  const categories = [
    "All",
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Arms",
    "Core",
    "Cardio",
  ];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
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

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return <Target size={16} color="#4ADE80" />;
      case "Medium":
        return <Zap size={16} color="#FFD60A" />;
      case "Hard":
        return <AlertTriangle size={16} color="#FF6B6B" />;
      default:
        return <Target size={16} color="#FFD60A" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Cardio":
        return <Heart size={20} color="#06B6D4" />;
      case "Core":
        return <Target size={20} color="#10B981" />;
      default:
        return <Dumbbell size={20} color="#8B5CF6" />;
    }
  };

  const onRefresh = useCallback(() => {
    refetch();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [refetch]);

  const selectExercise = (exercise) => {
    if (selectMode === "true") {
      // TODO: Add to workout builder
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.back();
    } else {
      router.push(`/(tabs)/exercise/${exercise.id}`);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  if (error) {
    Alert.alert("Error", "Failed to load exercises");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 32,
            color: "#FFFFFF",
            marginBottom: 20,
          }}
        >
          {selectMode === "true" ? "Select Exercise" : "Exercise Library"}
        </Text>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1C1C1E",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 12,
            }}
          >
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={{
                flex: 1,
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: "#FFFFFF",
              }}
              placeholder="Search exercises..."
              placeholderTextColor="#8E8E93"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              backgroundColor: showFilters ? "#FFD60A" : "#1C1C1E",
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.8}
          >
            <SlidersHorizontal
              size={20}
              color={showFilters ? "#000000" : "#8E8E93"}
            />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={{ gap: 12 }}>
            {/* Categories */}
            <View>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: "#8E8E93",
                  marginBottom: 8,
                }}
              >
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor:
                        selectedCategory === category ? "#FFD60A" : "#1C1C1E",
                      borderRadius: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onPress={() => setSelectedCategory(category)}
                    activeOpacity={0.8}
                  >
                    {category !== "All" && getCategoryIcon(category)}
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        color:
                          selectedCategory === category ? "#000000" : "#FFFFFF",
                      }}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Difficulty */}
            <View>
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
                {difficulties.map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor:
                        selectedDifficulty === difficulty
                          ? getDifficultyColor(difficulty)
                          : "#1C1C1E",
                      borderRadius: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onPress={() => setSelectedDifficulty(difficulty)}
                    activeOpacity={0.8}
                  >
                    {difficulty !== "All" && getDifficultyIcon(difficulty)}
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        color:
                          selectedDifficulty === difficulty
                            ? "#000000"
                            : "#FFFFFF",
                      }}
                    >
                      {difficulty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>

      {/* Exercise List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 16,
            color: "#8E8E93",
            marginBottom: 16,
          }}
        >
          {exercises.length} exercises found
        </Text>

        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 40,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: "#8E8E93",
              }}
            >
              Loading exercises...
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={{
                  backgroundColor: "#1C1C1E",
                  borderRadius: 16,
                  padding: 20,
                }}
                onPress={() => selectExercise(exercise)}
                activeOpacity={0.9}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 18,
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
                      {exercise.muscle_group}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <View
                      style={{
                        backgroundColor: getDifficultyColor(
                          exercise.difficulty,
                        ),
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {getDifficultyIcon(exercise.difficulty)}
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          color: "#000000",
                        }}
                      >
                        {exercise.difficulty}
                      </Text>
                    </View>

                    {exercise.equipment && exercise.equipment !== "None" && (
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: "#8E8E93",
                        }}
                      >
                        {exercise.equipment}
                      </Text>
                    )}
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  {exercise.default_sets && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Target size={14} color="#8E8E93" />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: "#8E8E93",
                        }}
                      >
                        {exercise.default_sets} sets
                      </Text>
                    </View>
                  )}

                  {exercise.default_reps && (
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: "#8E8E93",
                      }}
                    >
                      {exercise.default_reps} reps
                    </Text>
                  )}

                  {exercise.default_duration && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Clock size={14} color="#8E8E93" />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: "#8E8E93",
                        }}
                      >
                        {exercise.default_duration}
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }} />

                  {selectMode === "true" && (
                    <View
                      style={{
                        backgroundColor: "#FFD60A",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          color: "#000000",
                        }}
                      >
                        SELECT
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
