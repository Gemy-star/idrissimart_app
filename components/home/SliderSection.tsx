import { useLanguage } from '@/contexts/LanguageContext';
import { Slider } from '@/services/api';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 32;

interface SliderSectionProps {
  sliders: Slider[];
  onSlidePress?: (slider: Slider) => void;
}

export const SliderSection: React.FC<SliderSectionProps> = ({ sliders, onSlidePress }) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (!sliders || sliders.length === 0) return null;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDER_WIDTH);
    setActiveIndex(slideIndex);
  };

  const renderSlide = ({ item }: { item: Slider }) => {
    const title = isArabic ? item.title_ar : item.title;
    const subtitle = isArabic ? item.subtitle_ar : item.subtitle;
    const buttonText = isArabic ? item.button_text_ar : item.button_text;

    return (
      <TouchableOpacity 
        style={[styles.slide, { backgroundColor: item.background_color }]}
        onPress={() => onSlidePress?.(item)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.slideImage} resizeMode="cover" />
        <View style={styles.slideOverlay} />
        
        <View style={styles.slideContent}>
          <Text style={[styles.slideTitle, { color: item.text_color }]}>{title}</Text>
          <Text style={[styles.slideSubtitle, { color: item.text_color }]}>{subtitle}</Text>
          
          {buttonText && (
            <View style={[styles.slideButton, { borderColor: item.text_color }]}>
              <Text style={[styles.slideButtonText, { color: item.text_color }]}>
                {buttonText}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={sliders}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id.toString()}
        snapToInterval={SLIDER_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
      />
      
      {sliders.length > 1 && (
        <View style={styles.pagination}>
          {sliders.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  flatListContent: {
    paddingHorizontal: 16,
  },
  slide: {
    width: SLIDER_WIDTH,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  slideOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  slideButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  slideButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4b315e',
    width: 24,
  },
});
