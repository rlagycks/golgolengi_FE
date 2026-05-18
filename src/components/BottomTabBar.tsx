import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

export type TabRoute = 'home' | 'challenge' | 'family' | 'report' | 'my';

interface TabItem {
  route: TabRoute;
  label: string;
  icon: string;
}

const TAB_ITEMS: TabItem[] = [
  { route: 'home', label: '홈', icon: '🏠' },
  { route: 'challenge', label: '챌린지', icon: '⚡' },
  { route: 'family', label: '가족', icon: '👨‍👩‍👧' },
  { route: 'report', label: '리포트', icon: '📊' },
  { route: 'my', label: '마이', icon: '👤' },
];

interface BottomTabBarProps {
  activeRoute: TabRoute;
  onNavigate: (route: TabRoute) => void;
}

export function BottomTabBar({ activeRoute, onNavigate }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {TAB_ITEMS.map((item) => {
        const isActive = item.route === activeRoute;
        return (
          <Pressable
            key={item.route}
            style={styles.tab}
            onPress={() => onNavigate(item.route)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={item.label}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xs,
    gap: 2,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
});
