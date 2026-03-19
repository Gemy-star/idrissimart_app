import { Colors } from '@/constants/Colors';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Example component showing how to add a "Reset Onboarding" option
 * Add this to your settings screen or debug menu
 */
export default function ResetOnboardingExample() {
  const { resetOnboarding, hasSeenOnboarding } = useOnboarding();

  const handleReset = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again on next app restart. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            Alert.alert(
              'Success',
              'Onboarding has been reset. Restart the app to see it again.'
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Onboarding Status</Text>
        <Text style={styles.value}>
          {hasSeenOnboarding ? '✅ Completed' : '⏳ Not Completed'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleReset}
        disabled={!hasSeenOnboarding}
      >
        <Text style={styles.resetButtonText}>
          {hasSeenOnboarding ? 'Reset Onboarding' : 'Already Reset'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.helperText}>
        Use this during development to test the onboarding flow
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  label: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  resetButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
