import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, Alert, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { ChevronLeft, Check, Clock, Target, Brain, Settings } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { getTemplateById } from "@/storage/templates";

export default function WorkoutSessionScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [showRPEModal, setShowRPEModal] = useState(false);
  const [selectedRPE, setSelectedRPE] = useState(5);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [finished, setFinished] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const defaultWorkout = {
    id: 1,
    title: "Upper Body Strength",
    exercises: [
      {
        id: 1,
        name: "Bench Press",
        sets: 4,
        targetReps: "8-10",
        weight: "135 lbs",
        restTime: 90,
        instructions: "Keep your back flat on the bench and lower the bar to your chest with control.",
        formTips: ["Keep core tight", "Control the descent", "Full range of motion"],
      },
      {
        id: 2,
        name: "Incline Dumbbell Press", 
        sets: 3,
        targetReps: "10-12",
        weight: "35 lbs",
        restTime: 60,
        instructions: "Set the bench to 30-45 degrees and press the dumbbells up and slightly together.",
        formTips: ["45-degree angle", "Control the weight", "Full extension"],
      },
    ],
  };
  const [workout, setWorkout] = useState(defaultWorkout);

  // Load template by id if provided
  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    (async () => {
      const tpl = await getTemplateById(id);
      if (tpl) {
        setWorkout({
          id: tpl.id,
          title: tpl.title,
          exercises: Array.isArray(tpl.exercises) && tpl.exercises.length > 0 ? tpl.exercises : defaultWorkout.exercises,
        });
      }
    })();
  }, [params?.id]);

  const currentExercise = (workout.exercises && workout.exercises[currentExerciseIndex]) || {
    id: 0,
    name: "",
    sets: 0,
    targetReps: "",
    weight: "",
    restTime: 0,
    instructions: "",
    formTips: [],
  };
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;
  const isLastSet = currentSetIndex === currentExercise.sets - 1;

  useEffect(() => {
    const workoutInterval = setInterval(() => {
      setWorkoutDuration(prev => prev + 1);
    }, 1000);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulseAnimation.start();

    return () => {
      clearInterval(workoutInterval);
      pulseAnimation.stop();
    };
  }, []);

  useEffect(() => {
    let timerInterval;
    if (isResting && restTimer > 0) {
      timerInterval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isResting, restTimer]);

  // Persist a simple workout log when finishing the last set of the last exercise
  useEffect(() => {
    if (!finished) return;
    (async () => {
      try {
        const key = "@workout_logs";
        const raw = await AsyncStorage.getItem(key);
        const logs = raw ? JSON.parse(raw) : [];
        const entry = {
          id: Date.now(),
          workoutId: workout.id,
          title: workout.title,
          durationSeconds: workoutDuration,
          calories: totalCaloriesBurned,
          completedAt: new Date().toISOString(),
        };
        logs.push(entry);
        await AsyncStorage.setItem(key, JSON.stringify(logs));
      } catch {}
      setFinished(false);
    })();
  }, [finished]);

  if (!fontsLoaded) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    setTotalCaloriesBurned(prev => prev + Math.floor(Math.random() * 10) + 5);

    if (isLastSet && isLastExercise) {
      setFinished(true);
      Alert.alert(
        "Workout Complete! 🎉",
        `Great job! You completed your workout in ${formatTime(workoutDuration)} and burned approximately ${totalCaloriesBurned} calories.`,
        [{ text: "Done", onPress: () => router.push("/(tabs)/home") }]
      );
    } else if (isLastSet) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
      setIsResting(true);
      setRestTimer(workout.exercises[currentExerciseIndex + 1].restTime);
    } else {
      setCurrentSetIndex(prev => prev + 1);
      setIsResting(true);
      setRestTimer(currentExercise.restTime);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color: colors.primary }}>
              {workout.title}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.secondary }}>
              {formatTime(workoutDuration)} • {totalCaloriesBurned} cal
            </Text>
          </View>

          <Settings size={20} color={colors.secondary} />
        </View>

        <View style={{ marginTop: 16, backgroundColor: colors.surfaceVariant, height: 4, borderRadius: 2 }}>
          <View style={{
            width: `${((currentExerciseIndex * workout.exercises[0].sets + currentSetIndex + 1) / (workout.exercises.length * workout.exercises[0].sets)) * 100}%`,
            height: 4,
            backgroundColor: colors.yellow,
            borderRadius: 2,
          }} />
        </View>
      </View>

      {isResting && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: "center" }}>
            <Clock size={60} color={colors.yellow} />
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 48, color: colors.yellow, marginTop: 20, marginBottom: 8 }}>
              {formatTime(restTimer)}
            </Text>
            <Text style={{ fontFamily: "Inter_500Medium", fontSize: 18, color: colors.primary, marginBottom: 32 }}>
              Rest Time
            </Text>
          </Animated.View>

          <TouchableOpacity
            style={{ backgroundColor: colors.yellow, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32 }}
            onPress={() => { setIsResting(false); setRestTimer(0); }}
          >
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.background }}>
              Skip Rest
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.secondary }}>
              Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
            </Text>
            <View style={{ backgroundColor: colors.yellow + "20", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.yellow }}>
                Set {currentSetIndex + 1} of {currentExercise.sets}
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 24, color: colors.primary, marginBottom: 12 }}>
            {currentExercise.name}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Target size={16} color={colors.secondary} />
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: colors.secondary, marginLeft: 4 }}>
                {currentExercise.targetReps} reps
              </Text>
            </View>
            <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: colors.secondary }}>
              {currentExercise.weight}
            </Text>
          </View>

          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.primary, marginBottom: 8 }}>
              Instructions
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.secondary, lineHeight: 20, marginBottom: 16 }}>
              {currentExercise.instructions}
            </Text>

            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.primary, marginBottom: 8 }}>
              Form Tips
            </Text>
            {Array.isArray(currentExercise.formTips) && currentExercise.formTips.map((tip, index) => (
              <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.yellow, marginRight: 8 }} />
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.secondary }}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ backgroundColor: colors.yellowLight, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.yellow + "30" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Brain size={16} color={colors.yellow} />
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.yellow, marginLeft: 8 }}>
                AI Coach
              </Text>
            </View>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.yellow, lineHeight: 18 }}>
              Based on your last session, try to increase the weight by 2.5lbs if you can complete all reps with good form.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ backgroundColor: colors.surface, paddingTop: 20, paddingBottom: insets.bottom + 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity
          style={{ backgroundColor: colors.yellow, borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
          onPress={() => setShowRPEModal(true)}
        >
          <Check size={20} color={colors.background} />
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.background, marginLeft: 8 }}>
            Complete Set
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showRPEModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 20 }}>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 20, color: colors.primary, textAlign: "center", marginBottom: 24 }}>
              Rate Perceived Exertion (1-10)
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(rpe => (
                <TouchableOpacity
                  key={rpe}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: selectedRPE === rpe ? colors.yellow : colors.surfaceVariant,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => setSelectedRPE(rpe)}
                >
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: selectedRPE === rpe ? colors.background : colors.primary }}>
                    {rpe}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={{ backgroundColor: colors.yellow, borderRadius: 16, paddingVertical: 16, marginBottom: 12 }}
              onPress={() => { setShowRPEModal(false); handleCompleteSet(); }}
            >
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.background, textAlign: "center" }}>
                Complete Set
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowRPEModal(false)}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.secondary, textAlign: "center" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
