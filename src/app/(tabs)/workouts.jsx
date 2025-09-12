import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Search, Filter, Plus, Clock, Target, Dumbbell } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useTemplates, subscribeTemplates } from "@/queries/templates";
import { getTemplates } from "@/storage/templates";

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState("my-workouts");
  const [searchQuery, setSearchQuery] = useState("");
  const [shortOnly, setShortOnly] = useState(false);

  const [templates, setTemplates] = useState([]);
  const { data: remoteTemplates = [] } = useTemplates();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const queryClient = useQueryClient();

  // Legacy local mocks as fallback
  const workoutData = {
    "my-workouts": [
      { id: 1, title: "Upper Body Strength", duration: 45, exercises: 6, difficulty: "Medium", category: "Strength", isPremium: false },
      { id: 2, title: "HIIT Cardio Blast", duration: 30, exercises: 8, difficulty: "Hard", category: "Cardio", isPremium: false },
      { id: 3, title: "Lower Body Power", duration: 50, exercises: 7, difficulty: "Medium", category: "Strength", isPremium: false },
    ],
    recent: [],
    "ai-picks": [],
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        const data = await getTemplates();
        if (mounted) setTemplates(data);
      })();
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      const unsubscribe = subscribeTemplates(() =>
        queryClient.invalidateQueries({ queryKey: ["templates"] })
      );
      return () => {
        try { unsubscribe(); } catch {}
        mounted = false;
      };
    }, [queryClient])
  );
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
        marginBottom: 12,
        borderWidth: 1,
        borderColor: workout.isPremium ? colors.yellow : colors.border,
      }}
      onPress={() => router.push(`/workout-detail?id=${encodeURIComponent(workout.id)}`)}
    >
      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.primary, marginBottom: 6 }}>
        {workout.title}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Clock size={14} color={colors.secondary} />
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.secondary, marginLeft: 6 }}>
          {workout.duration} min
        </Text>
        <Target size={14} color={colors.secondary} style={{ marginLeft: 12 }} />
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.secondary, marginLeft: 6 }}>
          {Array.isArray(workout.exercises) ? workout.exercises.length : workout.exercises} exercises
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ backgroundColor: getDifficultyColor(workout.difficulty) + "20", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: getDifficultyColor(workout.difficulty) }}>{workout.difficulty}</Text>
        </View>
        <View style={{ backgroundColor: colors.border + "40", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.secondary }}>{workout.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderItem = useCallback(({ item }) => <WorkoutCard workout={item} />, []);
  const keyExtractor = useCallback((item, index) => `${item?.id ?? index}-${item?.updated_at ?? item?.updatedAt ?? ''}` , []);

  const renderTabContent = useMemo(() => {
    const base = (remoteTemplates && remoteTemplates.length)
      ? remoteTemplates
      : (templates.length ? templates : (workoutData[activeTab] || []));
    const workouts = base
      .filter((w) => (searchQuery.trim() ? w.title?.toLowerCase().includes(searchQuery.trim().toLowerCase()) : true))
      .filter((w) => (shortOnly ? (w.duration || 0) <= 30 : true));
    return (
      <FlatList
        data={workouts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
    );
  }, [remoteTemplates, templates, activeTab, searchQuery, shortOnly]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 28, color: colors.primary }}>Workouts</Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.yellow, width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" }}
            onPress={() => router.push("/workout-builder")}
          >
            <Plus size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border }}>
            <Search size={20} color={colors.secondary} />
            <TextInput
              placeholder="Search workouts..."
              placeholderTextColor={colors.secondary}
              style={{ flex: 1, marginLeft: 12, fontFamily: "Inter_400Regular", fontSize: 16, color: colors.primary }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={{ backgroundColor: shortOnly ? colors.yellow + "20" : colors.surface, width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: shortOnly ? colors.yellow : colors.border }}
            onPress={() => setShortOnly((v) => !v)}
          >
            <Filter size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: colors.border }}>
          {[{ key: "my-workouts", label: "My Workouts" }, { key: "recent", label: "Recent" }, { key: "ai-picks", label: "AI Picks" }].map((tab) => (
            <TouchableOpacity key={tab.key} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: activeTab === tab.key ? colors.yellow : "transparent" }} onPress={() => setActiveTab(tab.key)}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: activeTab === tab.key ? colors.background : colors.secondary, textAlign: "center" }}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {renderTabContent}
      </View>
    </View>
  );
}