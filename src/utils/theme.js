import { useColorScheme } from "react-native";

export const useAppTheme = () => {
  // Force dark theme for fitness app aesthetic
  const isDark = true;

  return {
    isDark,
    colors: {
      // Background colors - Pure black design
      background: "#000000",
      surface: "#111111",
      surfaceVariant: "#1A1A1A",
      surfaceElevated: "#222222",

      // Text colors
      primary: "#FFFFFF",
      secondary: "#B0B0B0",
      tertiary: "#888888",
      placeholder: "#666666",

      // Border colors
      border: "#333333",
      borderLight: "#444444",

      // UI element colors
      dragHandle: "#555555",

      // Primary accent - Bright Yellow
      yellow: "#FFD700",
      yellowLight: "#1A1600",
      yellowDark: "#B8AA00",

      // Secondary accent colors
      orange: "#FF6B35",
      orangeLight: "#2A1A16",
      blue: "#4F8EF7",
      blueLight: "#1A1C2A",
      green: "#00D084",
      greenLight: "#162A23",
      red: "#FF4757",
      redLight: "#2A1616",
      purple: "#9B59B6",
      purpleLight: "#1E1A2A",

      // Status colors
      success: "#00D084",
      warning: "#FFB800",
      error: "#FF4757",
      info: "#4F8EF7",

      // AI and Premium features
      aiAccent: "#FFD700",
      premiumGold: "#FFD700",
      premiumBadge: "#1A1600",
    },
  };
};
