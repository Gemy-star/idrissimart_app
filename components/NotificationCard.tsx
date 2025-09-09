import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card } from './Card'; // Assuming your Card.tsx is in the same directory
import { useTheme } from '@/contexts/ThemeContext';

interface NotificationCardProps {
  title: string;
  message: string;
}

export function NotificationCard({ title, message }: NotificationCardProps) {
  const { colors } = useTheme();

  return (
    <Card
      style={[
        styles.card,
        {
          borderColor: colors.border, // Assuming a border color exists in your theme
          borderWidth: 1,
          padding: 10,
        }
      ]}
    >
      <View style={styles.row}>
        {/* Bell icon */}
        <View style={[styles.iconWrapper, { backgroundColor: '#13181a' }]}>
          <Ionicons name="notifications" size={20} color={colors.accent} />
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          <ThemedText style={[styles.title, { color: '#FFFFFF' }]}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.message, { color: '#B0B0B0' }]}>
            {message}
          </ThemedText>
        </View>

        {/* Right column */}
        <View style={styles.rightCol}>
          <ThemedText style={[styles.smallText, { color: colors.secondary }]}>أي</ThemedText>
          <ThemedText style={[styles.smallDots, { color: colors.secondary }]}>...</ThemedText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0, // Remove default padding from the card component
    marginVertical: 0, // Remove default margin from the card component
    marginHorizontal: 0, // Remove default margin from the card component
    borderRadius: 16,
    height: 99,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: '100%',
    width: '100%',
  },
  rightCol: {
    marginLeft: 12,
    alignItems: 'center',
    paddingTop: 4, // Add padding to align with the top of the card
  },
  smallText: {
    fontSize: 12,
  },
  smallDots: {
    fontSize: 16,
    marginTop: 6,
  },
  mainContent: {
    flex: 1,
    marginHorizontal: 8,
    paddingTop: 4, // Add padding to align with the top of the card
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4, // Add margin to align with the top of the card
  },
});