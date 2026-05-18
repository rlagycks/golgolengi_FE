import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius } from '../theme';

interface ProgressBarProps {
  value: number;
  total: number;
  color?: string;
  height?: number;
}

export function ProgressBar({
  value,
  total,
  color = Colors.primary,
  height = 8,
}: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.min(1, value / total);

  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          { width: `${percent * 100}%`, backgroundColor: color, height },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
});
