import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
  Dumbbell,
  Heart,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [viewType, setViewType] = useState("week"); // week or month
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userSchedule, setUserSchedule] = useState({}); // persisted additions
  const SCHEDULE_KEY = "@schedule_data";

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mock schedule data
  const scheduleData = {
    "2024-11-25": [
      {
        id: 1,
        title: "Upper Body Strength",
        time: "09:00",
        duration: 45,
        status: "scheduled", // scheduled, completed, missed, ai-suggested
        type: "workout",
        aiConflict: false,
      },
      {
        id: 2,
        title: "Evening Yoga",
        time: "19:00",
        duration: 30,
        status: "scheduled",
        type: "workout",
        aiConflict: false,
      },
    ],
    "2024-11-26": [
      {
        id: 3,
        title: "Lower Body Power",
        time: "10:00",
        duration: 50,
        status: "scheduled",
        type: "workout",
        aiConflict: true,
        aiSuggestion: "Consider rest day due to high fatigue indicators",
      },
      {
        id: 4,
        title: "Active Recovery Walk",
        time: "16:00",
        duration: 20,
        status: "ai-suggested",
        type: "recovery",
        aiConflict: false,
      },
    ],
    "2024-11-24": [
      {
        id: 5,
        title: "HIIT Cardio",
        time: "08:00",
        duration: 30,
        status: "completed",
        type: "workout",
        aiConflict: false,
      },
    ],
    "2024-11-23": [
      {
        id: 6,
        title: "Morning Run",
        time: "07:00",
        duration: 40,
        status: "missed",
        type: "workout",
        aiConflict: false,
      },
    ],
  };

  // Load saved schedule from storage (must be before any early returns)
  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SCHEDULE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") setUserSchedule(parsed);
        }
      } catch {}
    })();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const persistUserSchedule = async (next) => {
    setUserSchedule(next);
    try { await AsyncStorage.setItem(SCHEDULE_KEY, JSON.stringify(next)); } catch {}
  };

  const formatTimeHM = (date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const addScheduleItem = async (dateObj) => {
    const dateKey = formatDate(dateObj);
    const defaultItem = {
      id: Date.now(),
      title: "Custom Workout",
      time: formatTimeHM(new Date(Date.now() + 60 * 60 * 1000)), // +1h
      duration: 45,
      status: "scheduled",
      type: "workout",
      aiConflict: false,
      userItem: true,
    };
    const next = { ...userSchedule, [dateKey]: [ ...(userSchedule[dateKey] || []), defaultItem ] };
    await persistUserSchedule(next);
  };

  const deleteUserItem = async (dateKey, id) => {
    const list = userSchedule[dateKey] || [];
    const next = { ...userSchedule, [dateKey]: list.filter((it) => it.id !== id) };
    await persistUserSchedule(next);
  };

  const addMinutesToTime = (timeStr, minutes) => {
    const [h, m] = timeStr.split(":").map((n) => parseInt(n, 10));
    const d = new Date();
    d.setHours(h, m, 0, 0);
    d.setMinutes(d.getMinutes() + minutes);
    return formatTimeHM(d);
  };

  const rescheduleUserItem = async (dateKey, id, minutes = 30) => {
    const list = userSchedule[dateKey] || [];
    const nextList = list.map((it) => (it.id === id ? { ...it, time: addMinutesToTime(it.time, minutes) } : it));
    const next = { ...userSchedule, [dateKey]: nextList };
    await persistUserSchedule(next);
  };

  const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} color={colors.green} />;
      case "missed":
        return <XCircle size={16} color={colors.red} />;
      case "ai-suggested":
        return <Brain size={16} color={colors.yellow} />;
      default:
        return <Clock size={16} color={colors.secondary} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return colors.green;
      case "missed":
        return colors.red;
      case "ai-suggested":
        return colors.yellow;
      default:
        return colors.blue;
    }
  };

  const WorkoutItem = ({ item, dateKey }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: item.aiConflict ? colors.orange : colors.border,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(item.status),
      }}
    >
      {/* AI Conflict Warning */}
      {item.aiConflict && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.orangeLight,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <AlertCircle size={16} color={colors.orange} />
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: colors.orange,
              marginLeft: 8,
              flex: 1,
            }}
          >
            {item.aiSuggestion}
          </Text>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
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
            {item.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Clock size={14} color={colors.secondary} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.secondary,
                marginLeft: 6,
              }}
            >
              {item.time} • {item.duration} min
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {getStatusIcon(item.status)}
          {item.type === "workout" ? (
            <Dumbbell size={16} color={colors.secondary} style={{ marginLeft: 8 }} />
          ) : (
            <Heart size={16} color={colors.secondary} style={{ marginLeft: 8 }} />
          )}
        </View>
      </View>

      {item.status === "ai-suggested" && (
        <View
          style={{
            backgroundColor: colors.yellowLight,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 10,
              color: colors.yellow,
            }}
          >
            AI RECOMMENDED
          </Text>
        </View>
      )}

      {item.userItem && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => rescheduleUserItem(dateKey, item.id, 30)}
          >
            <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.primary }}>
              +30 min
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: colors.red,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
            onPress={() =>
              Alert.alert(
                "Delete",
                "Remove this scheduled workout?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => deleteUserItem(dateKey, item.id) },
                ]
              )
            }
          >
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.background }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const DayCard = ({ day, isSelected, onSelect }) => {
    const dateKey = formatDate(day);
    const daySchedule = scheduleData[dateKey] || [];
    const isToday = formatDate(day) === formatDate(new Date());
    
    const completedCount = daySchedule.filter(item => item.status === "completed").length;
    const totalCount = daySchedule.filter(item => item.status !== "ai-suggested").length;
    const hasAIConflicts = daySchedule.some(item => item.aiConflict);

    return (
      <TouchableOpacity
        style={{
          backgroundColor: isSelected ? colors.yellow : colors.surface,
          borderRadius: 16,
          padding: 16,
          marginRight: 12,
          minWidth: 80,
          alignItems: "center",
          borderWidth: 1,
          borderColor: isToday ? colors.yellow : colors.border,
        }}
        onPress={onSelect}
      >
        {hasAIConflicts && (
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.orange,
            }}
          />
        )}

        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 12,
            color: isSelected ? colors.background : colors.secondary,
            marginBottom: 4,
          }}
        >
          {day.toLocaleDateString("en", { weekday: "short" })}
        </Text>
        
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 18,
            color: isSelected ? colors.background : colors.primary,
            marginBottom: 8,
          }}
        >
          {day.getDate()}
        </Text>

        {daySchedule.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: completedCount === totalCount 
                  ? colors.green 
                  : completedCount > 0 
                  ? colors.yellow 
                  : colors.blue,
                marginRight: 4,
              }}
            />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 10,
                color: isSelected ? colors.background : colors.secondary,
              }}
            >
              {daySchedule.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getMergedForDate = (dateKey) => {
    const base = scheduleData[dateKey] || [];
    const extra = userSchedule[dateKey] || [];
    // simple sort by time HH:mm
    const merged = [...base, ...extra].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    return merged;
  };
  const selectedDateSchedule = getMergedForDate(formatDate(selectedDate));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
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
              fontSize: 28,
              color: colors.primary,
            }}
          >
            Schedule
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
            >
              <CalendarIcon size={20} color={colors.primary} />
            </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.yellow,
              width: 48,
              height: 48,
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => addScheduleItem(selectedDate)}
          >
            <Plus size={24} color={colors.background} />
          </TouchableOpacity>
          </View>
        </View>

        {/* View Toggle */}
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
          {["week", "month"].map((type) => (
            <TouchableOpacity
              key={type}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor:
                  viewType === type ? colors.yellow : "transparent",
              }}
              onPress={() => setViewType(type)}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color:
                    viewType === type ? colors.background : colors.secondary,
                  textAlign: "center",
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Week View */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 20,
          paddingRight: 8,
          paddingBottom: 20,
        }}
        style={{ flexGrow: 0 }}
      >
        {getWeekDays().map((day, index) => (
          <DayCard
            key={index}
            day={day}
            isSelected={formatDate(day) === formatDate(selectedDate)}
            onSelect={() => setSelectedDate(day)}
          />
        ))}
      </ScrollView>

      {/* Selected Day Schedule */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
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
              fontSize: 18,
              color: colors.primary,
            }}
          >
            {selectedDate.toLocaleDateString("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>

          {selectedDateSchedule.some(item => item.aiConflict) && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.orangeLight,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Brain size={14} color={colors.orange} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: colors.orange,
                  marginLeft: 6,
                }}
              >
                AI Alert
              </Text>
            </View>
          )}
        </View>

        {selectedDateSchedule.length > 0 ? (
          <FlatList
            data={selectedDateSchedule}
            renderItem={({ item }) => <WorkoutItem item={item} dateKey={formatDate(selectedDate)} />}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 100,
            }}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <CalendarIcon size={32} color={colors.secondary} />
            </View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.primary,
                marginBottom: 8,
              }}
            >
              No workouts scheduled
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.secondary,
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              This is a perfect day for rest or try an AI recommended workout
            </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.yellow,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => addScheduleItem(selectedDate)}
          >
            <Plus size={16} color={colors.background} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: colors.background,
                marginLeft: 8,
              }}
            >
              Add Workout
            </Text>
          </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
