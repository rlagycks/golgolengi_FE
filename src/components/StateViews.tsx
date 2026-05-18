import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

interface ErrorViewProps {
  message?: string;
}

export function ErrorView({ message = '문제가 발생했습니다. 다시 시도해 주세요.' }: ErrorViewProps) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

interface EmptyViewProps {
  message?: string;
}

export function EmptyView({ message = '데이터가 없습니다.' }: EmptyViewProps) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>📭</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 40,
  },
  message: {
    ...Typography.bodyMD,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
