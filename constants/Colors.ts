// constants/Colors.ts
export const Colors: Record<ColorScheme, ThemeColors> = {
  light: {
    background: '#f5f7fa',        // --bg-primary
    surface: '#f5f5f5',            // --bg-secondary
    text: '#000000',               // --text-primary / --black-color
    textSecondary: '#333333',      // --text-secondary / --dark-gray
    textInverse: '#ffffff',        // --white-color
    primary: '#4b315e',            // --primary-color
    secondary: '#ff6001',          // --secondary-color
    accent: '#ff8534',             // --accent-orange
    border: '#e0e0e0',             // --border-color
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    tabBarBackground: '#ffffff',   // --bg-secondary-light
    tabBarBorder: '#e0e0e0',       // --border-color
    tabBarActive: '#4b315e',       // --primary-color
    tabBarInactive: '#666666',     // --text-muted
    fontFamily: 'System',
    fontFamilyArabic: 'IBM Plex Sans Arabic',
    fontSecondary:'#666666'        // --text-muted
  },
  dark: {
    background: '#1a1522',         // Darker variant of primary
    surface: '#2a2033',            // Darker surface
    text: '#ffffff',               // --white-color
    textSecondary: '#b0b0b0',      // Lighter gray for dark mode
    textInverse: '#000000',        // --black-color
    primary: '#6b4c7a',            // --accent-purple (lighter for dark mode)
    secondary: '#ff8534',          // --accent-orange (lighter variant)
    accent: '#ff8534',             // --accent-orange
    border: '#3a2449',             // --primary-dark
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    tabBarBackground: '#1a1522',
    tabBarBorder: '#3a2449',       // --primary-dark
    tabBarActive: '#ff8534',       // --accent-orange
    tabBarInactive: '#8E8E93',
    fontFamily: 'System',
    fontFamilyArabic: 'IBM Plex Sans Arabic',
    fontSecondary:'#b0b0b0'
  },
};

export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  fontFamily: string;
  fontFamilyArabic: string;
  fontSecondary:string;
};

export type ColorScheme = 'light' | 'dark';

// Color utility functions
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Remove # if present
  const hex = color.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Predefined color variations for common use cases
export const ColorVariations = {
  primary: {
    main: '#4b315e',              // --primary-color
    light: getColorWithOpacity('#4b315e', 0.1),
    medium: getColorWithOpacity('#4b315e', 0.5),
    dark: '#3a2449',              // --primary-dark
  },
  secondary: {
    main: '#ff6001',              // --secondary-color
    light: getColorWithOpacity('#ff6001', 0.1),
    medium: getColorWithOpacity('#ff6001', 0.5),
    dark: '#cc4d01',
  },
  accent: {
    purple: '#6b4c7a',            // --accent-purple
    orange: '#ff8534',            // --accent-orange
  },
  neutral: {
    white: '#ffffff',             // --white-color
    black: '#000000',             // --black-color
    lightGray: '#f5f5f5',         // --light-gray
    darkGray: '#333333',          // --dark-gray
  },
};
