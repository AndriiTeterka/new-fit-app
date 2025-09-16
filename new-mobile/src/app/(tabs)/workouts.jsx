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
import { Plus, Search, SlidersHorizontal } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [selectedTab, setSelectedTab] = useState("My Workouts");

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Fetch workouts from API
  const {
    data: workoutsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workouts", searchText],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);

      const response = await fetch(`/api/workouts?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workouts");
      }
      const result = await response.json();
      return result.data;
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  // Add "New Workout" card to the beginning of workouts list
  const workouts = [
    {
      id: "new",
      name: "New Workout",
      estimated_duration: 30,
      exercise_count: 0,
      difficulty: "Medium",
      tags: [],
      isNew: true,
    },
    ...(workoutsData || []).map((workout) => ({
      ...workout,
      duration: `${workout.estimated_duration} min`,
      exercises: workout.exercise_count,
    })),
  ];

  const tabs = ["My Workouts", "Recent", "AI Picks"];

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

  const getTagColor = (tag) => {
    switch (tag) {
      case "Strength":
        return "#8B5CF6";
      case "Cardio":
        return "#06B6D4";
      case "Flexibility":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  if (error) {
    Alert.alert("Error", "Failed to load workouts");
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
              fontFamily: "Inter_700Bold",
              fontSize: 32,
              color: "#FFFFFF",
            }}
          >
            Workouts
          </Text>

          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              backgroundColor: "#FFD60A",
              borderRadius: 22,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => router.push("/(tabs)/workout-builder")}
            activeOpacity={0.8}
          >
            <Plus size={24} color="#000000" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
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
              placeholder="Search workouts..."
              placeholderTextColor="#8E8E93"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              backgroundColor: "#1C1C1E",
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={0.8}
          >
            <SlidersHorizontal size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                backgroundColor: selectedTab === tab ? "#FFD60A" : "#1C1C1E",
                borderRadius: 20,
              }}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: selectedTab === tab ? "#000000" : "#FFFFFF",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Workout Cards */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
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
              Loading workouts...
            </Text>
          </View>
        ) : (
          workouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={{
                backgroundColor: "#1C1C1E",
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
              }}
              onPress={() => {
                if (workout.isNew) {
                  router.push("/(tabs)/workout-builder");
                } else {
                  router.push(`/(tabs)/workout/${workout.id}`);
                }
              }}
              activeOpacity={0.9}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 18,
                    color: "#FFFFFF",
                    flex: 1,
                    marginRight: 12,
                  }}
                >
                  {workout.name}
                </Text>

                {workout.isNew && (
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
                      NEW
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 20,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: "#8E8E93",
                  }}
                >
                  {workout.duration || `${workout.estimated_duration} min`}
                </Text>

                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: "#8E8E93",
                  }}
                >
                  {workout.exercises || workout.exercise_count} exercises
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: getDifficultyColor(workout.difficulty),
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: "#000000",
                    }}
                  >
                    {workout.difficulty}
                  </Text>
                </View>

                {(workout.tags || []).map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: getTagColor(tag),
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color: "#FFFFFF",
                      }}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
