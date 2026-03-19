import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BlogPost } from '@/services/api';
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

interface BlogsSectionProps {
  blogs: BlogPost[];
  onBlogPress?: (blog: BlogPost) => void;
  onViewAll?: () => void;
}

export const BlogsSection: React.FC<BlogsSectionProps> = ({ 
  blogs, 
  onBlogPress,
  onViewAll 
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  if (!blogs || blogs.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.latestFromBlog')}
        </Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>
              {t('home.viewAll')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.blogsList}
      >
        {blogs.map((blog) => (
          <TouchableOpacity
            key={blog.id}
            style={[styles.blogCard, { backgroundColor: colors.surface }]}
            onPress={() => onBlogPress?.(blog)}
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: blog.image }} 
              style={styles.blogImage}
              resizeMode="cover"
            />

            <View style={styles.blogContent}>
              {blog.category && (
                <View style={[styles.categoryBadge, { backgroundColor: blog.category.color || colors.primary }]}>
                  <Text style={styles.categoryBadgeText}>{blog.category.name}</Text>
                </View>
              )}

              <Text 
                style={[styles.blogTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {blog.title}
              </Text>

              <View style={styles.blogMeta}>
                <View style={styles.authorRow}>
                  {blog.author.profile_image ? (
                    <Image 
                      source={{ uri: blog.author.profile_image }} 
                      style={styles.authorAvatar}
                    />
                  ) : (
                    <View style={[styles.authorAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                      <Text style={styles.authorAvatarText}>
                        {blog.author.first_name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.authorName, { color: colors.fontSecondary }]}>
                    {blog.author.first_name} {blog.author.last_name}
                  </Text>
                </View>

                <Text style={[styles.date, { color: colors.fontSecondary }]}>
                  {formatDate(blog.published_date)}
                </Text>
              </View>

              <View style={styles.blogFooter}>
                <View style={styles.stat}>
                  <FontAwesome5 name="eye" size={12} color={colors.fontSecondary} />
                  <Text style={[styles.statText, { color: colors.fontSecondary }]}>
                    {' '}{blog.views_count}
                  </Text>
                </View>

                <View style={styles.stat}>
                  <FontAwesome5 
                    name="heart" 
                    size={12} 
                    color={blog.is_liked ? colors.secondary : colors.fontSecondary}
                    solid={blog.is_liked}
                  />
                  <Text style={[styles.statText, { color: colors.fontSecondary }]}>
                    {' '}{blog.likes_count}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  blogsList: {
    paddingHorizontal: 16,
  },
  blogCard: {
    width: 280,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blogImage: {
    width: '100%',
    height: 160,
  },
  blogContent: {
    padding: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 22,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  authorAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  authorName: {
    fontSize: 12,
  },
  date: {
    fontSize: 11,
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
  },
});
