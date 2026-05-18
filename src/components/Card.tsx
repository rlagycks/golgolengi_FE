import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../theme';

type CardVariant = 'default' | 'hero' | 'soft' | 'alert';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  style?: ViewStyle;
  topAccentColor?: string;
}

export function Card({ variant = 'default', children, style, topAccentColor }: CardProps) {
  return (
    <View style={[styles.base, VARIANT_STYLES[variant], style]}>
      {topAccentColor && (
        <View style={[styles.topAccent, { backgroundColor: topAccentColor }]} />
      )}
      {children}
    </View>
  );
}

const VARIANT_STYLES: Record<CardVariant, ViewStyle> = {
  default: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...Shadows.md,
  },
  hero: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    ...Shadows.lg,
  },
  soft: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.lg,
  },
  alert: {
    backgroundColor: Colors.warningContainer,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
};

const styles = StyleSheet.create({
  base: {
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});
