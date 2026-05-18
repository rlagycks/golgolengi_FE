import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme';
import type { RiskLevel } from '../types';

// SVG-based circular progress ring
// Requires: expo install react-native-svg
// Until installed, renders a fallback pill badge

interface RiskRingProps {
  score: number;
  level: RiskLevel;
  size?: number;
  strokeWidth?: number;
}

const LEVEL_COLORS: Record<RiskLevel, string> = {
  low: Colors.riskLow,
  warning: Colors.riskWarning,
  high: Colors.riskHigh,
  critical: Colors.riskCritical,
};

const LEVEL_LABELS: Record<RiskLevel, string> = {
  low: '낮음',
  warning: '주의',
  high: '높음',
  critical: '위험',
};

export function RiskRing({ score, level, size = 80, strokeWidth = 8 }: RiskRingProps) {
  const color = LEVEL_COLORS[level];
  const label = LEVEL_LABELS[level];

  // Try to use SVG if available, otherwise render a simple circle fallback
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Svg, Circle } = require('react-native-svg');
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(score / 100, 1);
    const strokeDashoffset = circumference * (1 - progress);
    const center = size / 2;

    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={Colors.surfaceVariant}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>
        <Text style={[styles.scoreText, { color, fontSize: size * 0.22, fontWeight: '700' }]}>
          {score}
        </Text>
        <Text style={[styles.levelText, { fontSize: size * 0.14 }]}>{label}</Text>
      </View>
    );
  } catch {
    // Fallback when react-native-svg is not installed
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
        <Text style={[styles.scoreText, { color, fontSize: size * 0.22, fontWeight: '700' }]}>
          {score}
        </Text>
        <Text style={[styles.levelText, { fontSize: size * 0.14 }]}>{label}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scoreText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  levelText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
  },
});
