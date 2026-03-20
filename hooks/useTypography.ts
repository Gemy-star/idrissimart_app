// hooks/useTypography.ts
import { FontFamily, Typography } from '@/constants/Typography';
import { useLanguage } from '@/contexts/LanguageContext';

export const useTypography = () => {
  const { language } = useLanguage();

  const getTextStyle = (
    size?: keyof typeof Typography.fontSize,
    weight?: keyof typeof Typography.fontWeight,
    letterSpacing?: keyof typeof Typography.letterSpacing,
  ) => {
    const isArabic = language === 'ar';
    const isBold = weight === 'bold' || weight === 'semibold' || weight === 'extrabold' || weight === 'black';

    return {
      fontSize: size ? Typography.fontSize[size] : Typography.fontSize.base,
      fontWeight: weight
        ? Typography.fontWeight[weight]
        : Typography.fontWeight.normal,
      lineHeight: size
        ? Typography.lineHeight[size]
        : Typography.lineHeight.base,
      letterSpacing: letterSpacing
        ? Typography.letterSpacing[letterSpacing]
        : Typography.letterSpacing.normal,
      fontFamily: isArabic
        ? (isBold ? FontFamily.arabicBold : FontFamily.arabic)
        : FontFamily.system,
      // RTL support for Arabic
      textAlign: isArabic ? 'right' : 'left',
      writingDirection: isArabic ? 'rtl' : 'ltr',
    };
  };

  const getVariantStyle = (variant: string) => {
    const isArabic = language === 'ar';

    const baseStyle = {
      fontFamily: isArabic ? FontFamily.arabic : FontFamily.system,
      textAlign: isArabic ? 'right' : 'left',
      writingDirection: isArabic ? 'rtl' : 'ltr',
    };

    const boldStyle = {
      ...baseStyle,
      fontFamily: isArabic ? FontFamily.arabicBold : FontFamily.system,
    };

    switch (variant) {
      case 'h1':
        return {
          ...boldStyle,
          fontSize: Typography.fontSize['4xl'],
          fontWeight: Typography.fontWeight.bold,
          lineHeight: Typography.lineHeight['4xl'],
        };
      case 'h2':
        return {
          ...boldStyle,
          fontSize: Typography.fontSize['3xl'],
          fontWeight: Typography.fontWeight.bold,
          lineHeight: Typography.lineHeight['3xl'],
        };
      case 'h3':
        return {
          ...boldStyle,
          fontSize: Typography.fontSize['2xl'],
          fontWeight: Typography.fontWeight.semibold,
          lineHeight: Typography.lineHeight['2xl'],
        };
      case 'title':
        return {
          ...boldStyle,
          fontSize: Typography.fontSize['4xl'],
          fontWeight: Typography.fontWeight.bold,
          lineHeight: Typography.lineHeight['4xl'],
        };
      case 'heading':
        return {
          ...boldStyle,
          fontSize: Typography.fontSize['2xl'],
          fontWeight: Typography.fontWeight.semibold,
          lineHeight: Typography.lineHeight['2xl'],
        };
      case 'subtitle':
        return {
          ...baseStyle,
          fontSize: Typography.fontSize.lg,
          fontWeight: Typography.fontWeight.medium,
          lineHeight: Typography.lineHeight.lg,
        };
      case 'caption':
        return {
          ...baseStyle,
          fontSize: Typography.fontSize.sm,
          fontWeight: Typography.fontWeight.normal,
          lineHeight: Typography.lineHeight.sm,
        };
      case 'body':
      default:
        return {
          ...baseStyle,
          fontSize: Typography.fontSize.base,
          fontWeight: Typography.fontWeight.normal,
          lineHeight: Typography.lineHeight.base,
        };
    }
  };

  return {
    getTextStyle,
    getVariantStyle,
    isArabic: language === 'ar',
    fontFamily: language === 'ar' ? FontFamily.arabic : FontFamily.system,
  };
};
