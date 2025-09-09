// constants/Colors.ts
export const Colors: Record<ColorScheme, ThemeColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#6B7280',
    textInverse: '#FFFFFF',
    primary: '#002524',
    secondary: '#0a3a34',
    accent: '#5EF1CA',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    tabBarBackground: '#F0F0F0',
    tabBarBorder: '#E0E0E0',
    tabBarActive: '#002524',
    tabBarInactive: '#8E8E93',
    fontFamily: 'System',
    fontFamilyArabic: 'IBM Plex Sans Arabic',
    fontSecondary:'#B0B0B0'
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textInverse: '#000000',
    primary: '#002524',
    secondary: '#0a3a34',
    accent: '#5EF1CA',
    border: '#374151',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    tabBarBackground: '#1C1C1E',
    tabBarBorder: '#333333',
    tabBarActive: '#5EF1CA',
    tabBarInactive: '#8E8E93',
    fontFamily: 'System',
    fontFamilyArabic: 'IBM Plex Sans Arabic',
    fontSecondary:'#B0B0B0'
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
    main: '#002524',
    light: getColorWithOpacity('#002524', 0.1),
    medium: getColorWithOpacity('#002524', 0.5),
    dark: '#001a19',
  },
  secondary: {
    main: '#0a3a34',
    light: getColorWithOpacity('#0a3a34', 0.1),
    medium: getColorWithOpacity('#0a3a34', 0.5),
    dark: '#072d28',
  },
};
