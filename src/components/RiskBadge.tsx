import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import type { RiskLevel } from '../types';

interface RiskBadgeProps {
  score: number;
  level: RiskLevel;
  size?: 'sm' | 'md';
}

const LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: '낮음', color: Colors.riskLow, bg: Colors.riskLowBg },
  warning: { label: '주의', color: Colors.riskWarning, bg: Colors.riskWarningBg },
  high: { label: '높음', color: Colors.riskHigh, bg: Colors.riskHighBg },
  critical: { label: '위험', color: Colors.riskCritical, bg: Colors.riskCriticalBg },
};

export function RiskBadge({ score, level, size = 'md' }: RiskBadgeProps) {
  const config = LEVEL_CONFIG[level];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.color },
          isSmall && styles.textSm,
        ]}
      >
        {score}점 {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    ...Typography.labelMD,
  },
  textSm: {
    ...Typography.labelSM,
  },
});
