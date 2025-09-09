import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const { colors } = useTheme();

  return (
    <View style={styles.selectorContainer}>
      <TouchableOpacity
        style={[styles.languageOption, language === 'en' && styles.activeOption]}
        onPress={() => setLanguage('en')}
      >
        <ThemedText style={[styles.languageText, { color: language === 'en' ? colors.text : colors.secondary }]}>
          English
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.languageOption, language === 'ar' && styles.activeOption]}
        onPress={() => setLanguage('ar')}
      >
        <ThemedText style={[styles.languageText, { color: language === 'ar' ? colors.text : colors.secondary }]}>
          العربية
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333', // A dark background for the selector itself
    borderRadius: 8,
    padding: 4,
    width: '60%',
  },
  languageOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeOption: {
    backgroundColor: '#555', // A slightly lighter color for the active selection
  },
  languageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});