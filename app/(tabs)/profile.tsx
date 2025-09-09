import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Switch } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronRight, Link, Twitter, Linkedin, Facebook, UserCircle } from 'lucide-react-native';

const userProfile = {
  name: 'Khaled Faisal',
  title: 'Senior Developer',
  company: 'Global Company',
  // You can set this to null or an invalid URL to see the fallback icon
  avatar: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=KF',
};

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const secondaryColor = colors.fontSecondary || '#B0B0B0';

  return (
    <View style={[styles.infoItem, { backgroundColor: colors.card, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <ThemedText style={[styles.infoLabel, { color: secondaryColor, textAlign: isRTL ? 'right' : 'left' }]}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.infoValue, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {value}
      </ThemedText>
    </View>
  );
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [isEnglish, setIsEnglish] = useState(language === 'en');
  const [imageError, setImageError] = useState(false);
  const isRTL = language === 'ar';

  const secondaryColor = colors.fontSecondary || '#B0B0B0';

  const toggleLanguage = () => {
    const newLanguage = isEnglish ? 'ar' : 'en';
    setIsEnglish(!isEnglish);
    setLanguage(newLanguage);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          {userProfile.avatar && !imageError ? (
            <Image
              source={{ uri: userProfile.avatar }}
              style={styles.profileAvatar}
              onError={() => setImageError(true)}
            />
          ) : (
            <UserCircle size={100} color={colors.text} />
          )}
          <ThemedText style={[styles.profileName, { color: colors.text }]}>{userProfile.name}</ThemedText>
          <ThemedText style={[styles.profileTitle, { color: secondaryColor }]}>{userProfile.title}</ThemedText>
          <ThemedText style={[styles.profileCompany, { color: secondaryColor }]}>{userProfile.company}</ThemedText>
        </View>

        {/* About Me Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Link size={16} color={colors.text} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('profile.aboutMe') || 'نبذة عني'}
            </ThemedText>
          </View>
          <ThemedText style={[styles.aboutText, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.aboutMeText') || 'خبير في التكنولوجيا والتحول الرقمي. عملت مع شركات رائدة في تطوير الحلول التقنية للملتقى العام والعالمي في السعودية.'}
          </ThemedText>
        </View>

        {/* Details Grid */}
        <View style={styles.infoGrid}>
          <InfoItem label={t('profile.type') || 'النوع'} value={t('profile.tech') || 'تقني'} />
          <InfoItem label={t('profile.area') || 'المساحة'} value={t('profile.aboutTextTwo') || 'من السعودية إلى وجهات أوروبية لتموين التعليم باستخدام التكنولوجيا.'} />
          <InfoItem label={t('profile.position') || 'المنصب'} value={t('profile.mainSpeaker') || 'المتحدث الرئيسي'} />
          <InfoItem label={t('profile.field') || 'المجال'} value={t('profile.fieldValue') || 'مسوق حريرة'} />
          <InfoItem label={t('profile.company') || 'الشركة'} value={t('profile.companyValue') || 'المتخصص الصناعي للشركة'} />
          <InfoItem label={t('profile.jobTitle') || 'المهنة'} value={t('profile.jobTitleValue') || 'تحديد العمل'} />
          <InfoItem label={t('profile.role') || 'الدور'} value={t('profile.roleValue') || 'عضو فني (CTO)'} />
          <InfoItem label={t('profile.nationality') || 'الجنسية'} value={t('profile.nationalityValue') || 'المملكة العربية السعودية'} />
          <InfoItem label={t('profile.from') || 'من'} value={t('profile.fromValue') || 'من 2018'} />
        </View>

        {/* Language Toggle Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Link size={16} color={colors.text} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('profile.language') || 'اللغة'}
            </ThemedText>
          </View>
          <View style={[styles.languageToggleContainer, { flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }]}>
            <ThemedText style={[styles.toggleText, { color: !isEnglish ? colors.accent : secondaryColor }]}>العربية</ThemedText>
            <Switch
              trackColor={{ false: secondaryColor, true: colors.accent }}
              thumbColor={colors.background}
              onValueChange={toggleLanguage}
              value={isEnglish}
              style={{ marginHorizontal: 10 }}
            />
            <ThemedText style={[styles.toggleText, { color: isEnglish ? colors.accent : secondaryColor }]}>English</ThemedText>
          </View>
        </View>

        {/* Personal Socials Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Link size={16} color={colors.text} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('profile.personalSocials') || 'المواقع الشخصية'}
            </ThemedText>
          </View>
          <View style={[styles.socialIcons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity style={styles.socialIconContainer}>
              <Twitter size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIconContainer}>
              <Linkedin size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIconContainer}>
              <Facebook size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'IBMPlexSansArabic-Bold',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 16,
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  profileCompany: {
    fontSize: 14,
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'IBMPlexSansArabic-Bold',
    marginHorizontal: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'IBMPlexSansArabic-Regular',
    padding: 10,
  },
  infoGrid: {
    marginBottom: 20,
  },
  infoItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  languageToggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  socialIcons: {
    justifyContent: 'center',
    marginTop: 10,
  },
  socialIconContainer: {
    marginHorizontal: 10,
  },
});