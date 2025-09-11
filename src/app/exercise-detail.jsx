import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { ChevronLeft, Play, Heart, Share, AlertTriangle, Target, Clock, Dumbbell } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";

export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState("instructions");

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const exercise = {
    id: 1,
    name: "Bench Press",
    category: "Chest",
    equipment: "Barbell",
    difficulty: "Intermediate",
    primaryMuscles: ["Chest", "Triceps"],
    secondaryMuscles: ["Shoulders"],
    instructions: [
      "Lie flat on the bench with your eyes under the bar",
      "Grip the bar with hands slightly wider than shoulder-width",
      "Plant your feet firmly on the ground",
      "Unrack the bar and position it over your chest",
      "Lower the bar to your chest with control",
      "Press the bar back up to the starting position",
      "Repeat for the desired number of repetitions"
    ],
    formTips: [
      "Keep your shoulder blades retracted throughout the movement",
      "Maintain a slight arch in your lower back",
      "Keep your core tight and engaged",
      "Control the descent - don't let the bar crash into your chest",
      "Drive through your feet to generate power",
      "Keep your wrists straight and strong"
    ],
    commonMistakes: [
      "Bouncing the bar off the chest",
      "Flaring the elbows too wide",
      "Lifting the feet off the ground",
      "Using too wide or too narrow a grip",
      "Not maintaining proper shoulder position"
    ],
    alternatives: [
      { name: "Dumbbell Bench Press", reason: "More range of motion, unilateral training" },
      { name: "Incline Barbell Press", reason: "Targets upper chest more" },
      { name: "Push-ups", reason: "Bodyweight alternative, no equipment needed" },
      { name: "Chest Dips", reason: "Bodyweight compound movement" }
    ],
    variations: [
      { name: "Incline Bench Press", description: "30-45 degree angle, targets upper chest" },
      { name: "Close-Grip Bench Press", description: "Hands closer together, more tricep focus" },
      { name: "Pause Bench Press", description: "Pause at bottom, builds strength off chest" },
      { name: "Floor Press", description: "Limited range of motion, good for lockout strength" }
    ]
  };

  if (!fontsLoaded) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner": return colors.green;
      case "Intermediate": return colors.yellow;
      case "Advanced": return colors.orange;
      default: return colors.secondary;
    }
  };

  const renderInstructions = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.primary, marginBottom: 16 }}>
        Step-by-Step Instructions
      </Text>
      {exercise.instructions.map((instruction, index) => (
        <View key={index} style={{ flexDirection: "row", marginBottom: 12 }}>
          <View style={{ 
            backgroundColor: colors.yellow, 
            width: 24, 
            height: 24, 
            borderRadius: 12, 
            justifyContent: "center", 
            alignItems: "center", 
            marginRight: 12,
            marginTop: 2
          }}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.background }}>
              {index + 1}
            </Text>
          </View>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.secondary, lineHeight: 20, flex: 1 }}>
            {instruction}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderFormTips = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.primary, marginBottom: 16 }}>
        Form & Technique Tips
      </Text>
      {exercise.formTips.map((tip, index) => (
        <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green, marginRight: 12, marginTop: 6 }} />
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.secondary, lineHeight: 20, flex: 1 }}>
            {tip}
          </Text>
        </View>
      ))}

      <View style={{ backgroundColor: colors.redLight, borderRadius: 12, padding: 16, marginTop: 20, borderWidth: 1, borderColor: colors.red + "30" }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <AlertTriangle size={16} color={colors.red} />
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.red, marginLeft: 8 }}>
            Common Mistakes
          </Text>
        </View>
        {exercise.commonMistakes.map((mistake, index) => (
          <Text key={index} style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.red, lineHeight: 18, marginBottom: 4 }}>
            • {mistake}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderAlternatives = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.primary, marginBottom: 16 }}>
        Exercise Alternatives
      </Text>
      {exercise.alternatives.map((alternative, index) => (
        <TouchableOpacity 
          key={index} 
          style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
        >
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.primary, marginBottom: 4 }}>
            {alternative.name}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.secondary }}>
            {alternative.reason}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.primary, marginBottom: 16, marginTop: 20 }}>
        Exercise Variations
      </Text>
      {exercise.variations.map((variation, index) => (
        <TouchableOpacity 
          key={index} 
          style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
        >
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.primary, marginBottom: 4 }}>
            {variation.name}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.secondary }}>
            {variation.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity 
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceVariant, justifyContent: "center", alignItems: "center" }}
              onPress={() => setIsFavorited(!isFavorited)}
            >
              <Heart size={18} color={isFavorited ? colors.red : colors.secondary} fill={isFavorited ? colors.red : "none"} />
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceVariant, justifyContent: "center", alignItems: "center" }}>
              <Share size={18} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 28, color: colors.primary, marginBottom: 8 }}>
            {exercise.name}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <View style={{ backgroundColor: colors.border + "40", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.secondary }}>
                {exercise.category}
              </Text>
            </View>
            <View style={{ backgroundColor: getDifficultyColor(exercise.difficulty) + "20", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: getDifficultyColor(exercise.difficulty) }}>
                {exercise.difficulty}
              </Text>
            </View>
            <View style={{ backgroundColor: colors.border + "40", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.secondary }}>
                {exercise.equipment}
              </Text>
            </View>
          </View>

          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.primary, marginBottom: 12 }}>
              Muscles Targeted
            </Text>
            
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: colors.primary, marginBottom: 6 }}>
                Primary Muscles
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {exercise.primaryMuscles.map((muscle, index) => (
                  <View key={index} style={{ backgroundColor: colors.yellow + "20", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.yellow }}>
                      {muscle}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: colors.primary, marginBottom: 6 }}>
                Secondary Muscles
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {exercise.secondaryMuscles.map((muscle, index) => (
                  <View key={index} style={{ backgroundColor: colors.border + "40", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.secondary }}>
                      {muscle}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderRadius: 16, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            {[
              { key: "instructions", label: "Instructions" },
              { key: "form", label: "Form Tips" },
              { key: "alternatives", label: "Alternatives" }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: activeTab === tab.key ? colors.yellow : "transparent" }}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: activeTab === tab.key ? colors.background : colors.secondary, textAlign: "center" }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {activeTab === "instructions" && renderInstructions()}
        {activeTab === "form" && renderFormTips()}
        {activeTab === "alternatives" && renderAlternatives()}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={{ backgroundColor: colors.surface, paddingTop: 20, paddingBottom: insets.bottom + 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity
          style={{ backgroundColor: colors.yellow, borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
          onPress={() => router.push("/workout-session")}
        >
          <Play size={20} color={colors.background} fill={colors.background} />
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.background, marginLeft: 8 }}>
            Add to Workout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}