import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

import { Tabs } from 'expo-router';
import { Bell, BookOpen, Cloud, Grid2x2, Home, MessageSquare, Newspaper, Tag, User } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();


  const defaultColors = {
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#5EF1CA',
    tabBarActive: '#5EF1CA',
    tabBarInactive: '#8E8E93',
  };

  const tabColors = {
    ...defaultColors,
    ...colors,
  };

  return (
    <Tabs
      screenOptions={({ route }) => {
        let IconComponent;
        switch (route.name) {
          case 'index':
            IconComponent = Home;
            break;
          case 'ads':
            IconComponent = Tag;
            break;
          case 'blogs':
            IconComponent = BookOpen;
            break;
          case 'news':
            IconComponent = Newspaper;
            break;
          case 'cloud':
            IconComponent = Cloud;
            break;
          case 'messages':
              IconComponent = MessageSquare;
              break;
          case 'categories':
            IconComponent = Grid2x2;
            break;
          case 'profile':
            IconComponent = User;
            break;
          case 'notification':
              IconComponent = Bell;
             break;
          default:
            IconComponent = Home;
        }

        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: tabColors.tabBarBackground,
            borderTopColor: tabColors.tabBarBorder,
            borderTopWidth: 2,
            elevation: 0,
          },
          tabBarActiveTintColor: tabColors.tabBarActive,
          tabBarInactiveTintColor: tabColors.tabBarInactive,
          tabBarLabel: t(`navigation.${route.name}`) || route.name,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600' as const,
            fontFamily: 'IBM Plex Sans Arabic',
            marginTop: 4,
          },
          tabBarIcon: ({ color, size }) => <IconComponent color={color} size={size} />,
        };
      }}
    />
  );
}
