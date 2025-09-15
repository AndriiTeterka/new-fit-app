import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { Share as RNShare } from "react-native";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  TrendingUp,
  Award,
  Target,
  Flame,
  Dumbbell,
  Clock,
  Calendar,
  Share,
  Download,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import FocusTransitionView from "@/components/FocusTransitionView";

const { width } = Dimensions.get("window");

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [logs, setLogs] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mock progress data (fallback if no logs yet)
  const progressStats = {
    week: {
      workouts: 5,
      totalDuration: 240, // minutes
      caloriesBurned: 1280,
      personalRecords: 2,
    },
    month: {
      workouts: 18,
      totalDuration: 920,
      caloriesBurned: 4750,
      personalRecords: 7,
    },
    year: {
      workouts: 156,
      totalDuration: 7800,
      caloriesBurned: 42000,
      personalRecords: 23,
    },
  };

  const achievements = [
    {
      id: 1,
      title: "Week Warrior",
      description: "Complete 5 workouts in a week",
      icon: "🏆",
      earnedDate: "2024-11-24",
      isRecent: true,
    },
    {
      id: 2,
      title: "Strength Beast",
      description: "Deadlift personal record: 185 lbs",
      icon: "💪",
      earnedDate: "2024-11-22",
      isRecent: true,
    },
    {
      id: 3,
      title: "Consistency King",
      description: "15-day workout streak",
      icon: "🔥",
      earnedDate: "2024-11-20",
      isRecent: false,
    },
    {
      id: 4,
      title: "Cardio Champion",
      description: "Burn 1000+ calories in a week",
      icon: "❤️",
      earnedDate: "2024-11-18",
      isRecent: false,
    },
  ];

  const weeklyData = [
    { day: "Mon", workouts: 1, calories: 280 },
    { day: "Tue", workouts: 0, calories: 0 },
    { day: "Wed", workouts: 1, calories: 320 },
    { day: "Thu", workouts: 0, calories: 0 },
    { day: "Fri", workouts: 1, calories: 250 },
    { day: "Sat", workouts: 1, calories: 310 },
    { day: "Sun", workouts: 1, calories: 290 },
  ];

  const personalRecords = [
    {
      exercise: "Deadlift",
      weight: "185 lbs",
      date: "Nov 22",
      improvement: "+15 lbs",
      isNew: true,
    },
    {
      exercise: "Bench Press",
      weight: "145 lbs",
      date: "Nov 20",
      improvement: "+10 lbs",
      isNew: true,
    },
    {
      exercise: "Squat",
      weight: "165 lbs",
      date: "Nov 15",
      improvement: "+20 lbs",
      isNew: false,
    },
    {
      exercise: "Pull-ups",
      weight: "12 reps",
      date: "Nov 10",
      improvement: "+2 reps",
      isNew: false,
    },
  ];

  // Load logs before any early return to keep consistent hooks order
  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@workout_logs");
        setLogs(raw ? JSON.parse(raw) : []);
      } catch {}
    })();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const startOf = (timeframe) => {
    const now = new Date();
    const d = new Date(now);
    if (timeframe === "week") {
      const day = d.getDay();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - day);
    } else if (timeframe === "month") {
      d.setHours(0, 0, 0, 0);
      d.setDate(1);
    } else if (timeframe === "year") {
      d.setHours(0, 0, 0, 0);
      d.setMonth(0, 1);
    }
    return d;
  };

  const calculateFromLogs = (timeframe) => {
    if (!Array.isArray(logs) || logs.length === 0) return null;
    const since = startOf(timeframe);
    let workouts = 0;
    let totalDuration = 0;
    let caloriesBurned = 0;
    for (const l of logs) {
      const t = new Date(l.completedAt);
      if (isNaN(t.getTime())) continue;
      if (t >= since) {
        workouts += 1;
        totalDuration += Math.round((l.durationSeconds || 0) / 60);
        caloriesBurned += l.calories || 0;
      }
    }
    return { workouts, totalDuration, caloriesBurned, personalRecords: 0 };
  };

  const derived = calculateFromLogs(selectedTimeframe);
  const currentStats = derived || progressStats[selectedTimeframe];

  const shareSummaryText = () => {
    return `My ${selectedTimeframe} progress:\n\n` +
      `Workouts: ${currentStats.workouts}\n` +
      `Duration: ${currentStats.totalDuration} min\n` +
      `Calories: ${currentStats.caloriesBurned}\n` +
      `PRs: ${currentStats.personalRecords}`;
  };

  const onShare = async () => {
    try {
      await RNShare.share({ message: shareSummaryText() });
    } catch (e) {
      Alert.alert("Share Failed", "Unable to open share dialog.");
    }
  };

  const onDownload = async () => {
    const csv = `timeframe,workouts,totalDuration,caloriesBurned,personalRecords\n${selectedTimeframe},${currentStats.workouts},${currentStats.totalDuration},${currentStats.caloriesBurned},${currentStats.personalRecords}`;
    try {
      await Clipboard.setStringAsync(csv);
      Alert.alert("Export Ready", "CSV summary copied to clipboard.");
    } catch (e) {
      Alert.alert("Export Failed", "Could not copy data to clipboard.");
    }
  };

  const StatCard = ({ icon, title, value, unit, color }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        flex: 1,
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          backgroundColor: color + "20",
          width: 48,
          height: 48,
          borderRadius: 24,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 24,
          color: colors.primary,
          marginBottom: 4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 12,
          color: colors.secondary,
          marginBottom: 2,
        }}
      >
        {unit}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 14,
          color: colors.primary,
        }}
      >
        {title}
      </Text>
    </View>
  );

  const WeeklyChart = () => {
    const maxCalories = Math.max(...weeklyData.map(d => d.calories));
    
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 18,
            color: colors.primary,
            marginBottom: 20,
          }}
        >
          This Week's Activity
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            height: 120,
            marginBottom: 12,
          }}
        >
          {weeklyData.map((day, index) => (
            <View key={index} style={{ alignItems: "center", flex: 1 }}>
              <View
                style={{
                  backgroundColor: day.calories > 0 ? colors.yellow : colors.border,
                  width: 24,
                  height: Math.max(4, (day.calories / maxCalories) * 80),
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: day.calories > 0 ? colors.primary : colors.secondary,
                }}
              >
                {day.day}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 10,
                  color: colors.secondary,
                  marginTop: 2,
                }}
              >
                {day.calories > 0 ? `${day.calories}` : "-"}
              </Text>
            </View>
          ))}
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
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              color: colors.secondary,
            }}
          >
            Total: {weeklyData.reduce((sum, day) => sum + day.calories, 0)} calories
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              color: colors.primary,
            }}
          >
            {weeklyData.filter(day => day.workouts > 0).length}/7 days
          </Text>
        </View>
      </View>
    );
  };

  const AchievementCard = ({ achievement }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        width: 200,
        borderWidth: 1,
        borderColor: achievement.isRecent ? colors.yellow : colors.border,
      }}
    >
      {achievement.isRecent && (
        <View
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: colors.yellow,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 10,
              color: colors.background,
            }}
          >
            NEW
          </Text>
        </View>
      )}

      <Text
        style={{
          fontSize: 32,
          marginBottom: 12,
        }}
      >
        {achievement.icon}
      </Text>

      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 16,
          color: colors.primary,
          marginBottom: 8,
        }}
      >
        {achievement.title}
      </Text>

      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          color: colors.secondary,
          marginBottom: 12,
          lineHeight: 20,
        }}
      >
        {achievement.description}
      </Text>

      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 12,
          color: colors.tertiary,
        }}
      >
        Earned {achievement.earnedDate}
      </Text>
    </TouchableOpacity>
  );

  const PRCard = ({ record }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: record.isNew ? colors.yellow : colors.border,
        borderLeftWidth: 4,
        borderLeftColor: record.isNew ? colors.yellow : colors.green,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: colors.primary,
              marginBottom: 4,
            }}
          >
            {record.exercise}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 18,
              color: colors.yellow,
              marginBottom: 4,
            }}
          >
            {record.weight}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: colors.secondary,
            }}
          >
            {record.date}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <View
            style={{
              backgroundColor: colors.green + "20",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
                color: colors.green,
              }}
            >
              {record.improvement}
            </Text>
          </View>
          {record.isNew && (
            <View
              style={{
                backgroundColor: colors.yellow,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 10,
                  color: colors.background,
                }}
              >
                NEW PR
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

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
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
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
                fontSize: 28,
                color: colors.primary,
              }}
            >
              Progress
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={onShare}
              >
                <Share size={20} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={onDownload}
              >
                <Download size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Timeframe Toggle */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 4,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {["week", "month", "year"].map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor:
                    selectedTimeframe === timeframe ? colors.yellow : "transparent",
                }}
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color:
                      selectedTimeframe === timeframe ? colors.background : colors.secondary,
                    textAlign: "center",
                  }}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{ paddingHorizontal: 14, marginBottom: 30 }}>
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <StatCard
              icon={<Dumbbell size={24} color={colors.blue} />}
              title="Workouts"
              value={currentStats.workouts}
              unit="completed"
              color={colors.blue}
            />
            <StatCard
              icon={<Clock size={24} color={colors.green} />}
              title="Duration"
              value={Math.floor(currentStats.totalDuration / 60)}
              unit={`${currentStats.totalDuration % 60}m`}
              color={colors.green}
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <StatCard
              icon={<Flame size={24} color={colors.orange} />}
              title="Calories"
              value={currentStats.caloriesBurned.toLocaleString()}
              unit="burned"
              color={colors.orange}
            />
            <StatCard
              icon={<Award size={24} color={colors.yellow} />}
              title="PRs"
              value={currentStats.personalRecords}
              unit="achieved"
              color={colors.yellow}
            />
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <WeeklyChart />
        </View>

        {/* Achievements */}
        <View style={{ marginBottom: 30 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.primary,
              }}
            >
              Recent Achievements
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.yellow,
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: 20,
              paddingRight: 8,
            }}
          >
            {achievements.slice(0, 3).map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </ScrollView>
        </View>

        {/* Personal Records */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.primary,
              }}
            >
              Personal Records
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.yellow,
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {personalRecords.slice(0, 4).map((record, index) => (
            <PRCard key={index} record={record} />
          ))}
        </View>
      </ScrollView>
    </FocusTransitionView>
  );
}





