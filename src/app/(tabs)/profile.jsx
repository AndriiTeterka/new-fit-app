import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
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
  Settings,
  User,
  Target,
  Bell,
  Crown,
  Lock,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Brain,
  Zap,
  Moon,
  Phone,
  Mail,
  MapPin,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import FocusTransitionView from "@/components/FocusTransitionView";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [isPremium, setIsPremium] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    aiAdaptation: true,
    autoReschedule: false,
    fatigueTracking: true,
    darkMode: true,
  });

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mock user data
  const userProfile = {
    name: "Alex Thompson",
    email: "alex.thompson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    currentStreak: 12,
    totalWorkouts: 156,
    achievements: 23,
  };

  if (!fontsLoaded) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: () => {} },
      ]
    );
  };

  const SettingsSection = ({ title, children }) => (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 16,
          color: colors.primary,
          marginBottom: 12,
          paddingHorizontal: 4,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );

  const SettingsRow = ({
    icon,
    title,
    subtitle,
    value,
    onPress,
    isToggle = false,
    isPremiumFeature = false,
    isDestructive = false,
  }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
      onPress={onPress}
      disabled={isPremiumFeature && !isPremium}
    >
      <View
        style={{
          backgroundColor: isDestructive ? colors.redLight : colors.border + "40",
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        {React.cloneElement(icon, {
          size: 20,
          color: isDestructive ? colors.red : colors.primary,
        })}
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: isDestructive ? colors.red : colors.primary,
            }}
          >
            {title}
          </Text>
          {isPremiumFeature && !isPremium && (
            <Crown size={14} color={colors.yellow} style={{ marginLeft: 8 }} />
          )}
        </View>
        {subtitle && (
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.secondary,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {isToggle ? (
        <Switch
          value={value}
          onValueChange={(newValue) => {
            if (isPremiumFeature && !isPremium) {
              Alert.alert("Premium Feature", "Upgrade to premium to access this feature");
              return;
            }
            setSettings({ ...settings, [title.toLowerCase().replace(' ', '')]: newValue });
          }}
          trackColor={{ false: colors.border, true: colors.yellow }}
          thumbColor={value ? colors.background : colors.secondary}
        />
      ) : (
        <ChevronRight size={20} color={colors.secondary} />
      )}
    </TouchableOpacity>
  );

  const PremiumCard = () => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.yellow,
        borderRadius: 20,
        padding: 24,
        marginBottom: 30,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -10,
          left: -10,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      />

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Crown size={24} color={colors.background} />
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 20,
            color: colors.background,
            marginLeft: 12,
          }}
        >
          Upgrade to Premium
        </Text>
      </View>

      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 16,
          color: colors.background,
          marginBottom: 20,
          opacity: 0.9,
        }}
      >
        Unlock AI-powered workouts, advanced analytics, and personalized coaching
      </Text>

      <View
        style={{
          backgroundColor: colors.background,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
          alignSelf: "flex-start",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: colors.yellow,
          }}
        >
          Start Free Trial
        </Text>
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ icon, value, label, color }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        flex: 1,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          backgroundColor: color + "20",
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 18,
          color: colors.primary,
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 12,
          color: colors.secondary,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
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
              Profile
            </Text>

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
              <Settings size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* User Info Card */}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.yellow,
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <User size={28} color={colors.background} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 20,
                    color: colors.primary,
                    marginBottom: 4,
                  }}
                >
                  {userProfile.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: colors.secondary,
                  }}
                >
                  Member since {userProfile.joinDate}
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Mail size={16} color={colors.secondary} />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: colors.secondary,
                    marginLeft: 8,
                  }}
                >
                  {userProfile.email}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Phone size={16} color={colors.secondary} />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: colors.secondary,
                    marginLeft: 8,
                  }}
                >
                  {userProfile.phone}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MapPin size={16} color={colors.secondary} />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: colors.secondary,
                    marginLeft: 8,
                  }}
                >
                  {userProfile.location}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <StatCard
                icon={<Target size={20} color={colors.yellow} />}
                value={userProfile.currentStreak}
                label="Day Streak"
                color={colors.yellow}
              />
              <StatCard
                icon={<Zap size={20} color={colors.blue} />}
                value={userProfile.totalWorkouts}
                label="Workouts"
                color={colors.blue}
              />
              <StatCard
                icon={<Crown size={20} color={colors.purple} />}
                value={userProfile.achievements}
                label="Achievements"
                color={colors.purple}
              />
            </View>
          </View>

          {/* Premium Card */}
          {!isPremium && <PremiumCard />}
        </View>

        {/* Settings Sections */}
        <View style={{ paddingHorizontal: 20 }}>
          <SettingsSection title="Fitness Goals">
            <SettingsRow
              icon={<Target />}
              title="Goals & Preferences"
              subtitle="Update your fitness goals and preferences"
              onPress={() => {}}
            />
            <SettingsRow
              icon={<Bell />}
              title="Notifications"
              subtitle="Workout reminders and achievements"
              value={settings.notifications}
              isToggle={true}
            />
          </SettingsSection>

          <SettingsSection title="AI Features">
            <SettingsRow
              icon={<Brain />}
              title="AI Adaptation"
              subtitle="Adaptive workout recommendations"
              value={settings.aiAdaptation}
              isToggle={true}
              isPremiumFeature={true}
            />
            <SettingsRow
              icon={<Zap />}
              title="Auto Reschedule"
              subtitle="Automatically reschedule missed workouts"
              value={settings.autoReschedule}
              isToggle={true}
              isPremiumFeature={true}
            />
            <SettingsRow
              icon={<Target />}
              title="Fatigue Tracking"
              subtitle="Monitor and adapt to fatigue levels"
              value={settings.fatigueTracking}
              isToggle={true}
              isPremiumFeature={true}
            />
          </SettingsSection>

          <SettingsSection title="Account">
            <SettingsRow
              icon={<Crown />}
              title="Subscription"
              subtitle={isPremium ? "Premium Active" : "Manage your subscription"}
              onPress={() => {}}
            />
            <SettingsRow
              icon={<Shield />}
              title="Privacy & Data"
              subtitle="Control your data and privacy settings"
              onPress={() => {}}
            />
            <SettingsRow
              icon={<Lock />}
              title="Security"
              subtitle="Password and security settings"
              onPress={() => {}}
            />
          </SettingsSection>

          <SettingsSection title="Support">
            <SettingsRow
              icon={<HelpCircle />}
              title="Help Center"
              subtitle="Get help and support"
              onPress={() => {}}
            />
            <SettingsRow
              icon={<LogOut />}
              title="Sign Out"
              onPress={handleLogout}
              isDestructive={true}
            />
          </SettingsSection>
        </View>
      </ScrollView>
    </FocusTransitionView>
  );
}





