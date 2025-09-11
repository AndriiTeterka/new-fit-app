import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
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
  Search,
  Filter,
  Plus,
  Clock,
  Target,
  Flame,
  Brain,
  Star,
  Dumbbell,
  Heart,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { router } from "expo-router";
import { useTemplates } from "@/queries/templates";
import { useFocusEffect } from "@react-navigation/native";
import { getTemplates } from "@/storage/templates";

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState("my-workouts");
  const [searchQuery, setSearchQuery] = useState("");
  const [shortOnly, setShortOnly] = useState(false); // client-side filter: <= 30 min

  const [templates, setTemplates] = useState([]);
  const { data: remoteTemplates = [] } = useTemplates();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mock data for workouts
  const workoutData = {
    "my-workouts": [
      {
        id: 1,
        title: "Upper Body Strength",
        duration: 45,
        exercises: 6,
        calories: 280,
        difficulty: "Medium",
        category: "Strength",
        lastCompleted: "2 days ago",
        isPremium: false,
      },
      {
        id: 2,
        title: "HIIT Cardio Blast",
        duration: 30,
        exercises: 8,
        calories: 350,
        difficulty: "Hard",
        category: "Cardio",
        lastCompleted: "1 week ago",
        isPremium: false,
      },
      {
        id: 3,
        title: "Lower Body Power",
        duration: 50,
        exercises: 7,
        calories: 320,
        difficulty: "Medium",
        category: "Strength",
        lastCompleted: "Never",
        isPremium: false,
      },
    ],
    recent: [
      {
        id: 4,
        title: "Morning Yoga Flow",
        duration: 25,
        exercises: 12,
        calories: 150,
        difficulty: "Easy",
        category: "Flexibility",
        lastCompleted: "Yesterday",
        isPremium: false,
      },
      {
        id: 1,
        title: "Upper Body Strength",
        duration: 45,
        exercises: 6,
        calories: 280,
        difficulty: "Medium",
        category: "Strength",
        lastCompleted: "2 days ago",
        isPremium: false,
      },
    ],
    "ai-picks": [
      {
        id: 5,
        title: "AI Recovery Session",
        duration: 20,
        exercises: 5,
        calories: 120,
        difficulty: "Easy",
        category: "Recovery",
        lastCompleted: "Never",
        isPremium: true,
        aiReason: "Perfect for your current fatigue level",
      },
      {
        id: 6,
        title: "Progressive Overload Push",
        duration: 55,
        exercises: 8,
        calories: 400,
        difficulty: "Hard",
        category: "Strength",
        lastCompleted: "Never",
        isPremium: true,
        aiReason: "Matches your strength progression goals",
      },
    ],
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        const data = await getTemplates();
        if (mounted) setTemplates(data);
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );
  if (!fontsLoaded) {
    return null;
  }

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

const WorkoutCard = ({ workout }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: workout.isPremium ? colors.yellow : colors.border,
      }}
      onPress={() => router.push(`/workout-detail?id=${encodeURIComponent(workout.id)}`)}
    >
      {/* Premium Badge */}
      {workout.isPremium && (
        <View
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            backgroundColor: colors.yellow,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Star size={12} color={colors.background} fill={colors.background} />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 10,
              color: colors.background,
              marginLeft: 4,
            }}
          >
            PRO
          </Text>
        </View>
      )}

      {/* AI Recommendation */}
      {workout.aiReason && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            backgroundColor: colors.yellowLight,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
          }}
        >
          <Brain size={16} color={colors.yellow} />
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: colors.yellow,
              marginLeft: 8,
              flex: 1,
            }}
          >
            {workout.aiReason}
          </Text>
        </View>
      )}

      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 18,
          color: colors.primary,
          marginBottom: 8,
          paddingRight: workout.isPremium ? 60 : 0,
        }}
      >
        {workout.title}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Clock size={14} color={colors.secondary} />
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.secondary,
              marginLeft: 4,
            }}
          >
            {workout.duration} min
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Target size={14} color={colors.secondary} />
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.secondary,
              marginLeft: 4,
            }}
          >
            {Array.isArray(workout.exercises) ? workout.exercises.length : workout.exercises} exercises
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Flame size={14} color={colors.secondary} />
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.secondary,
              marginLeft: 4,
            }}
          >
            {workout.calories} cal
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              backgroundColor: getDifficultyColor(workout.difficulty) + "20",
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
          {workout.lastCompleted}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    const base = (remoteTemplates && remoteTemplates.length)
      ? remoteTemplates
      : (templates.length ? templates : (workoutData[activeTab] || []));
    const workouts = base
      .filter((w) =>
        searchQuery.trim().length === 0
          ? true
          : w.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
      .filter((w) => (shortOnly ? w.duration <= 30 : true));
    return (
      <FlatList
        data={workouts}
        renderItem={({ item }) => <WorkoutCard workout={item} />}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    );
  };

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
            Workouts
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: colors.yellow,
              width: 48,
              height: 48,
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => router.push("/workout-builder")}
          >
            <Plus size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
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
              backgroundColor: colors.surface,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Search size={20} color={colors.secondary} />
            <TextInput
              placeholder="Search workouts..."
              placeholderTextColor={colors.secondary}
              style={{
                flex: 1,
                marginLeft: 12,
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: colors.primary,
              }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: shortOnly ? colors.yellow + "20" : colors.surface,
              width: 48,
              height: 48,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: shortOnly ? colors.yellow : colors.border,
            }}
            onPress={() => setShortOnly((v) => !v)}
          >
            <Filter size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {[
            { key: "my-workouts", label: "My Workouts" },
            { key: "recent", label: "Recent" },
            { key: "ai-picks", label: "AI Picks" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor:
                  activeTab === tab.key ? colors.yellow : "transparent",
              }}
              onPress={() => setActiveTab(tab.key)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                {tab.key === "ai-picks" && (
                  <Brain 
                    size={16} 
                    color={activeTab === tab.key ? colors.background : colors.secondary}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color:
                      activeTab === tab.key ? colors.background : colors.secondary,
                    textAlign: "center",
                  }}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {renderTabContent()}
      </View>
    </View>
  );
}
