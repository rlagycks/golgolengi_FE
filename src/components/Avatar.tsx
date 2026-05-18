import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography, Radius } from '../theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: AvatarSize;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 72,
};

const FONT_MAP: Record<AvatarSize, object> = {
  xs: Typography.labelSM,
  sm: Typography.labelMD,
  md: Typography.labelLG,
  lg: Typography.titleSM,
  xl: Typography.titleMD,
};

const COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#8B5CF6',
  '#EF4444', '#06B6D4', '#EC4899', '#14B8A6',
];

function getInitialColor(name: string): string {
  const index = name.charCodeAt(0) % COLORS.length;
  return COLORS[index];
}

export function Avatar({ name, uri, size = 'md' }: AvatarProps) {
  const dimension = SIZE_MAP[size];
  const initial = name.charAt(0);
  const bg = getInitialColor(name);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, { width: dimension, height: dimension, borderRadius: Radius.full }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.base,
        { width: dimension, height: dimension, borderRadius: Radius.full, backgroundColor: bg },
      ]}
    >
      <Text style={[FONT_MAP[size], styles.initial]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    color: Colors.textInverse,
  },
});
