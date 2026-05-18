import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { BottomTabBar, TabRoute } from './src/components/BottomTabBar';
import { HomeScreen } from './src/features/home/HomeScreen';
import { ChallengeScreen } from './src/features/challenge/ChallengeScreen';
import { FamilyScreen } from './src/features/family/FamilyScreen';
import { ReportScreen } from './src/features/report/ReportScreen';
import { MyScreen } from './src/features/my/MyScreen';
import { OnboardingScreen } from './src/features/onboarding/OnboardingScreen';
import { LoginScreen } from './src/features/login/LoginScreen';
import { LoadingView } from './src/components/StateViews';

function MainApp() {
  const [activeRoute, setActiveRoute] = useState<TabRoute>('home');

  const renderScreen = () => {
    switch (activeRoute) {
      case 'home':      return <HomeScreen />;
      case 'challenge': return <ChallengeScreen />;
      case 'family':    return <FamilyScreen />;
      case 'report':    return <ReportScreen />;
      case 'my':        return <MyScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.screenArea}>{renderScreen()}</View>
      <BottomTabBar activeRoute={activeRoute} onNavigate={setActiveRoute} />
    </View>
  );
}

function AppNavigator() {
  const { isLoading, isAuthenticated, isOnboarded } = useAuth();

  if (isLoading) return <LoadingView />;
  if (!isAuthenticated) return <LoginScreen />;
  if (!isOnboarded) return <OnboardingScreen onComplete={() => {}} />;
  return <MainApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screenArea: { flex: 1 },
});
