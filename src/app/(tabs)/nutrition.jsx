import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
  Plus,
  Droplets,
  Scale,
  Target,
  Brain,
  Star,
  Apple,
  Coffee,
  Utensils,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import FocusTransitionView from "@/components/FocusTransitionView";

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [waterGlasses, setWaterGlasses] = useState(6);
  const waterGoal = 8;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mock nutrition data
  const dailyStats = {
    calories: {
      consumed: 1847,
      goal: 2200,
      burned: 380,
    },
    macros: {
      carbs: { consumed: 180, goal: 250 },
      protein: { consumed: 95, goal: 120 },
      fat: { consumed: 65, goal: 80 },
    },
    fiber: { consumed: 22, goal: 30 },
    water: { consumed: waterGlasses, goal: waterGoal },
  };

  const recentMeals = [
    {
      id: 1,
      name: "Greek Yogurt with Berries",
      time: "08:00",
      calories: 245,
      type: "breakfast",
      isPremiumSuggestion: false,
    },
    {
      id: 2,
      name: "Grilled Chicken Salad",
      time: "12:30",
      calories: 420,
      type: "lunch",
      isPremiumSuggestion: false,
    },
    {
      id: 3,
      name: "Post-Workout Protein Shake",
      time: "15:00",
      calories: 180,
      type: "snack",
      isPremiumSuggestion: true,
      aiReason: "Optimized for your upper body workout",
    },
  ];

  const aiSuggestions = [
    {
      id: 1,
      name: "Quinoa Power Bowl",
      calories: 520,
      timing: "Perfect for tonight's dinner",
      macros: { carbs: 45, protein: 25, fat: 15 },
      reason: "High protein to support muscle recovery",
    },
    {
      id: 2,
      name: "Pre-Workout Banana",
      calories: 105,
      timing: "30 minutes before tomorrow's workout",
      macros: { carbs: 27, protein: 1, fat: 0 },
      reason: "Quick energy for your lower body session",
    },
  ];

  if (!fontsLoaded) {
    return null;
  }

  const MacroRing = ({ macro, consumed, goal, color }) => {
    const percentage = Math.min((consumed / goal) * 100, 100);
    const circumference = 2 * Math.PI * 30;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={{ alignItems: "center", margin: 10 }}>
        <View
          style={{
            width: 70,
            height: 70,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Background Circle */}
          <View
            style={{
              position: "absolute",
              width: 60,
              height: 60,
              borderRadius: 30,
              borderWidth: 4,
              borderColor: colors.border,
            }}
          />
          {/* Progress Circle - simplified for React Native */}
          <View
            style={{
              position: "absolute",
              width: 60,
              height: 60,
              borderRadius: 30,
              borderWidth: 4,
              borderColor: percentage > 25 ? color : "transparent",
              borderTopColor: color,
              borderRightColor: percentage > 25 ? color : "transparent",
              borderBottomColor: percentage > 50 ? color : "transparent",
              borderLeftColor: percentage > 75 ? color : "transparent",
              transform: [{ rotate: "-90deg" }],
            }}
          />
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: colors.primary,
              }}
            >
              {consumed}g
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 10,
                color: colors.secondary,
              }}
            >
              /{goal}g
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 12,
            color: colors.secondary,
            marginTop: 4,
          }}
        >
          {macro}
        </Text>
      </View>
    );
  };

  const MealCard = ({ meal }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: meal.isPremiumSuggestion ? colors.yellow : colors.border,
      }}
    >
      {meal.isPremiumSuggestion && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.yellowLight,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            marginBottom: 12,
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
            {meal.aiReason}
          </Text>
        </View>
      )}

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
            {meal.name}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.secondary,
            }}
          >
            {meal.time} • {meal.calories} cal
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
            {meal.type}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const SuggestionCard = ({ suggestion }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        width: 280,
        borderWidth: 1,
        borderColor: colors.yellow,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Brain size={20} color={colors.yellow} />
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
            color: colors.primary,
            marginLeft: 8,
            flex: 1,
          }}
        >
          {suggestion.name}
        </Text>
        <Star size={16} color={colors.yellow} fill={colors.yellow} />
      </View>

      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 14,
          color: colors.yellow,
          marginBottom: 8,
        }}
      >
        {suggestion.timing}
      </Text>

      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          color: colors.secondary,
          marginBottom: 12,
        }}
      >
        {suggestion.reason}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
            color: colors.primary,
          }}
        >
          {suggestion.calories} cal
        </Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: colors.secondary,
            }}
          >
            C: {suggestion.macros.carbs}g
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: colors.secondary,
            }}
          >
            P: {suggestion.macros.protein}g
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: colors.secondary,
            }}
          >
            F: {suggestion.macros.fat}g
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const remainingCalories = dailyStats.calories.goal - dailyStats.calories.consumed;

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
              Nutrition
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
            >
              <Plus size={24} color={colors.background} />
            </TouchableOpacity>
          </View>

          {/* Calories Overview */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.primary,
                marginBottom: 16,
              }}
            >
              Today's Overview
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 24,
                    color: colors.primary,
                  }}
                >
                  {dailyStats.calories.consumed.toLocaleString()}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                  }}
                >
                  Consumed
                </Text>
              </View>

              <View
                style={{
                  width: 2,
                  height: 40,
                  backgroundColor: colors.border,
                }}
              />

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 24,
                    color: remainingCalories >= 0 ? colors.green : colors.red,
                  }}
                >
                  {Math.abs(remainingCalories).toLocaleString()}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                  }}
                >
                  {remainingCalories >= 0 ? "Remaining" : "Over"}
                </Text>
              </View>

              <View
                style={{
                  width: 2,
                  height: 40,
                  backgroundColor: colors.border,
                }}
              />

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 24,
                    color: colors.orange,
                  }}
                >
                  {dailyStats.calories.burned}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.secondary,
                  }}
                >
                  Burned
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View
              style={{
                backgroundColor: colors.border,
                height: 8,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: colors.yellow,
                  height: "100%",
                  width: `${Math.min(
                    (dailyStats.calories.consumed / dailyStats.calories.goal) *
                      100,
                    100
                  )}%`,
                }}
              />
            </View>
          </View>

          {/* Macros */}
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
                fontSize: 16,
                color: colors.primary,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Macronutrients
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <MacroRing
                macro="Carbs"
                consumed={dailyStats.macros.carbs.consumed}
                goal={dailyStats.macros.carbs.goal}
                color={colors.blue}
              />
              <MacroRing
                macro="Protein"
                consumed={dailyStats.macros.protein.consumed}
                goal={dailyStats.macros.protein.goal}
                color={colors.green}
              />
              <MacroRing
                macro="Fat"
                consumed={dailyStats.macros.fat.consumed}
                goal={dailyStats.macros.fat.goal}
                color={colors.orange}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.primary,
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>

          <View
            style={{
              flexDirection: "row",
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
              <Droplets size={24} color={colors.blue} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.primary,
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                Water
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: colors.secondary,
                }}
              >
                {dailyStats.water.consumed}/{dailyStats.water.goal} glasses
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
                  marginBottom: 4,
                }}
              >
                Weight
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: colors.secondary,
                }}
              >
                Log today
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
              <Apple size={24} color={colors.yellow} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: colors.primary,
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                Fiber
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: colors.secondary,
                }}
              >
                {dailyStats.fiber.consumed}/{dailyStats.fiber.goal}g
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Suggestions */}
        <View style={{ marginBottom: 30 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 16,
            }}
          >
            <Brain size={20} color={colors.yellow} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.primary,
                marginLeft: 8,
              }}
            >
              AI Meal Suggestions
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: 20,
              paddingRight: 4,
            }}
          >
            {aiSuggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </ScrollView>
        </View>

        {/* Recent Meals */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: colors.primary,
              marginBottom: 16,
            }}
          >
            Today's Meals
          </Text>

          {recentMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}

          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 2,
              borderColor: colors.border,
              borderStyle: "dashed",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <Plus size={24} color={colors.secondary} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.secondary,
                marginTop: 8,
              }}
            >
              Add meal or snack
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </FocusTransitionView>
  );
}





