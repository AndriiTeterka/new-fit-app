import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { ChevronLeft, Plus } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { router } from "expo-router";

export default function WorkoutBuilderScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center" }}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color: colors.primary }}>Workout Builder</Text>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.primary, marginBottom: 8 }}>
            Coming Soon
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.secondary }}>
            Design and customize your own workouts here. For now, this screen acts as a placeholder so navigation works end-to-end.
          </Text>
        </View>

        <View style={{ height: 20 }} />

        <TouchableOpacity
          style={{
            backgroundColor: colors.yellow,
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={18} color={colors.background} />
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.background, marginLeft: 8 }}>
            Add Exercise (mock)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

