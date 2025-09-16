import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Brain,
  Play,
  Plus,
  Droplets,
  Scale,
  Flame,
  Target,
  Calendar,
  Clock,
  Dumbbell,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import FocusTransitionView from "@/components/FocusTransitionView";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [todaysWorkout, setTodaysWorkout] = useState({
    title: "Upper Body Strength",
    duration: 45,
    exerciseCount: 6,
    status: "scheduled", // scheduled, completed, missed, none
    time: "09:00 AM",
  });

  const [progress, setProgress] = useState({
    streak: 0,
    caloriesBurned: 0,
    weeklyGoalPercentage: 0,
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  React.useEffect(() => {
    // Pulse animation for AI recommendation badge
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim]);

  // Derive today's progress and streak from local workout logs
  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@workout_logs");
        const logs = raw ? JSON.parse(raw) : [];
        const todayKey = new Date().toISOString().slice(0, 10);
        const byDate = new Map();
        for (const l of logs) {
          const key = (l.completedAt || "").slice(0, 10);
          if (!key) continue;
          byDate.set(key, (byDate.get(key) || 0) + 1);
        }
        // Streak: consecutive days ending today with at least one workout
        let streak = 0;
        const d = new Date();
        for (;;) {
          const key = d.toISOString().slice(0, 10);
          if (byDate.has(key)) {
            streak += 1;
            d.setDate(d.getDate() - 1);
          } else {
            break;
          }
        }
        // Today's calories
        let calories = 0;
        for (const l of logs) {
          if ((l.completedAt || "").slice(0, 10) === todayKey) {
            calories += l.calories || 0;
          }
        }
        // Weekly goal percentage based on minutes vs 300 min goal
        const weekStart = (() => { const w = new Date(); const day = w.getDay(); w.setHours(0,0,0,0); w.setDate(w.getDate()-day); return w; })();
        let minutes = 0;
        for (const l of logs) {
          const t = new Date(l.completedAt);
          if (isNaN(t.getTime())) continue;
          if (t >= weekStart) {
            minutes += Math.round((l.durationSeconds || 0) / 60);
          }
        }
        const weeklyGoalPercentage = Math.min(100, Math.round((minutes / 300) * 100));
        setProgress({ streak, caloriesBurned: calories, weeklyGoalPercentage });
      } catch {}
    })();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const CircularProgress = ({ percentage, size = 60 }) => {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: colors.border,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: size - 6,
            height: size - 6,
            borderRadius: (size - 6) / 2,
            borderWidth: 3,
            borderColor: colors.yellow,
            borderTopColor: "transparent",
            borderRightColor: percentage > 25 ? colors.yellow : "transparent",
            borderBottomColor: percentage > 50 ? colors.yellow : "transparent",
            borderLeftColor: percentage > 75 ? colors.yellow : "transparent",
          }}
        />
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: colors.primary,
          }}
        >
          {percentage}%
        </Text>
      </View>
    );
  };

  return (
    <FocusTransitionView fadeOnBlur style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 24,
              color: colors.primary,
              lineHeight: 32,
              marginBottom: 8,
            }}
          >
            {getGreeting()}, Alex
          </Text>
        </View>

        {/* AI Recommended Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
                backgroundColor: colors.yellow,
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Brain size={18} color={colors.background} />
            </Animated.View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.primary,
              }}
            >
              AI Recommended
            </Text>
          </View>

          {/* Today's Workout Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 22,
                    color: colors.primary,
                    marginBottom: 8,
                  }}
                >
                  {todaysWorkout.title}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Clock size={16} color={colors.secondary} />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: colors.secondary,
                      marginLeft: 6,
                      marginRight: 16,
                    }}
                  >
                    {todaysWorkout.duration} min
                  </Text>
                  <Target size={16} color={colors.secondary} />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: colors.secondary,
                      marginLeft: 6,
                    }}
                  >
                    {todaysWorkout.exerciseCount} exercises
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: colors.tertiary,
                    marginTop: 8,
                  }}
                >
                  Scheduled for {todaysWorkout.time}
                </Text>
              </View>
            </View>

            

            <TouchableOpacity
              style={{
                backgroundColor: colors.yellow,
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => router.push("/workout-session")}
            >
              <Play
                size={20}
                color={colors.background}
                fill={colors.background}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: colors.background,
                }}
              >
                Start Workout
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            marginBottom: 30,
            gap: 12,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Plus size={24} color={colors.orange} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.primary,
                marginTop: 8,
              }}
            >
              Log Meal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Droplets size={24} color={colors.blue} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.primary,
                marginTop: 8,
              }}
            >
              Log Water
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Scale size={24} color={colors.green} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.primary,
                marginTop: 8,
              }}
            >
              Add Progress
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Progress */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.primary,
              marginBottom: 20,
            }}
          >
            Today's Progress
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: colors.yellow,
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Target size={24} color={colors.background} />
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 20,
                    color: colors.primary,
                  }}
                >
                  {progress.streak}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                  }}
                >
                  Day Streak
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: colors.orange,
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Flame size={24} color={colors.primary} />
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 20,
                    color: colors.primary,
                  }}
                >
                  {progress.caloriesBurned.toLocaleString()}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                  }}
                >
                  Calories Burned
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <CircularProgress
                  percentage={progress.weeklyGoalPercentage}
                  size={60}
                />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                    marginTop: 8,
                  }}
                >
                  Weekly Goal
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Upcoming Workout */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.primary,
              marginBottom: 20,
            }}
          >
            Upcoming Workout
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.push("/workout-detail")}
          >
            <View
              style={{
                backgroundColor: colors.purple,
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Dumbbell size={28} color={colors.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: colors.primary,
                  marginBottom: 4,
                }}
              >
                Lower Body Power
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Calendar size={14} color={colors.secondary} />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: colors.secondary,
                    marginLeft: 6,
                  }}
                >
                  Tomorrow, 10:00 AM
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: colors.yellowLight,
                paddingHorizontal: 12,
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
                Scheduled
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </FocusTransitionView>
  );
}





