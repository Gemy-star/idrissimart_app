import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CategorySection } from '@/services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface CategoriesSectionProps {
  sections: CategorySection[];
  showTitle?: boolean;
  onCategoryPress?: (categoryId: number) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ 
  sections, 
  showTitle = true,
  onCategoryPress 
}) => {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';

  if (!sections || sections.length === 0) return null;

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.categories')}
          </Text>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: colors.primary }]}>
              {t('home.viewAll')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {sections.map((section) => (
        <View key={section.section_type} style={styles.sectionContainer}>
          <Text style={[styles.sectionName, { color: colors.text }]}>
            {section.section_name}
          </Text>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {section.categories.map((category) => {
              const name = isArabic ? category.name_ar : category.name;
              const iconName = (category.icon.split(' ').pop() || 'folder').replace(/^fa-/, '');

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: colors.surface }]}
                  onPress={() => onCategoryPress?.(category.id)}
                  activeOpacity={0.7}
                >
                  {category.image ? (
                    <View style={styles.categoryImageContainer}>
                      <Image 
                        source={{ uri: category.image }} 
                        style={styles.categoryImage}
                        resizeMode="cover"
                      />
                      <View style={styles.categoryOverlay} />
                    </View>
                  ) : (
                    <View style={[styles.categoryIconContainer, { backgroundColor: colors.primary + '15' }]}>
                      <FontAwesome5 name={iconName as any} size={32} color={colors.primary} />
                    </View>
                  )}
                  
                  <Text 
                    style={[styles.categoryName, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {name}
                  </Text>
                  
                  {category.ads_count !== undefined && (
                    <Text style={[styles.adsCount, { color: colors.fontSecondary }]}>
                      {category.ads_count} {t('home.ads')}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 120,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(75, 49, 94, 0.1)',
  },
  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 18,
  },
  adsCount: {
    fontSize: 11,
  },
});
