import React from "react";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts, Inter_700Bold } from "@expo-google-fonts/inter";

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />
      <View style={{ 
        paddingTop: insets.top + 20, 
        paddingHorizontal: 20,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Text style={{
          fontFamily: "Inter_700Bold",
          fontSize: 32,
          color: "#FFFFFF",
          textAlign: "center",
        }}>
          Calendar
        </Text>
        <Text style={{
          fontSize: 16,
          color: "#8E8E93",
          textAlign: "center",
          marginTop: 16,
        }}>
          Coming Soon
        </Text>
      </View>
    </View>
  );
}