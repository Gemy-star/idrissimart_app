import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Shadows, Spacing } from '@/constants/Spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  shadow?: keyof typeof Shadows;
  borderRadius?: keyof typeof BorderRadius;
}

export function Card({
  children,
  style,
  padding = 'base',
  shadow = 'base',
  borderRadius = 'lg'
}: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          padding: Spacing[padding],
          borderRadius: BorderRadius[borderRadius],
          marginHorizontal: Spacing.base,
          marginVertical: Spacing.sm,
        },
        Shadows[shadow],
        style
      ]}
    >
      {children}
    </View>
  );
}