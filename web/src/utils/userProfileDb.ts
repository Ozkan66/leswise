import { supabase } from './supabaseClient';

export interface UserProfileData {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'teacher' | 'student' | 'admin';
  birth_year?: number;
  education_type?: string;
  institution?: string;
  subjects?: string;
  profile_photo_url?: string;
  two_factor_enabled?: boolean;
  language?: string;
  notification_email?: boolean;
  notification_worksheets?: boolean;
  notification_submissions?: boolean;
  notification_system?: boolean;
  privacy_profile_visibility?: 'public' | 'private' | 'institutional';
  privacy_data_processing?: boolean;
  privacy_marketing?: boolean;
  privacy_analytics?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'teacher' | 'student' | 'admin' | null;
  birthYear?: string;
  educationType?: string;
  institution?: string;
  subjects?: string;
  profilePhotoUrl?: string;
  twoFactorEnabled?: boolean;
  language?: string;
  notificationSettings?: {
    emailNotifications: boolean;
    worksheetReminders: boolean;
    submissionNotifications: boolean;
    systemUpdates: boolean;
  };
  privacySettings?: {
    profileVisibility: 'public' | 'private' | 'institutional';
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    analyticsConsent: boolean;
  };
}

/**
 * Fetch user profile data from the database
 */
export async function fetchUserProfile(userId: string): Promise<UserProfileData | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found, return null
      return null;
    }
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data;
}

/**
 * Create or update user profile in the database
 */
export async function upsertUserProfile(profileData: Partial<UserProfileData>): Promise<UserProfileData> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profileData, {
      onConflict: 'user_id',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save user profile: ${error.message}`);
  }

  return data;
}

/**
 * Convert form data to database format
 */
export function convertFormDataToDbFormat(formData: UserProfileFormData, userId: string): Partial<UserProfileData> {
  return {
    user_id: userId,
    email: formData.email,
    first_name: formData.firstName,
    last_name: formData.lastName,
    role: (formData.role as 'teacher' | 'student' | 'admin') || 'student',
    birth_year: formData.birthYear ? parseInt(formData.birthYear) : undefined,
    education_type: formData.educationType,
    institution: formData.institution,
    subjects: formData.subjects,
    profile_photo_url: formData.profilePhotoUrl,
    two_factor_enabled: formData.twoFactorEnabled,
    language: formData.language,
    notification_email: formData.notificationSettings?.emailNotifications,
    notification_worksheets: formData.notificationSettings?.worksheetReminders,
    notification_submissions: formData.notificationSettings?.submissionNotifications,
    notification_system: formData.notificationSettings?.systemUpdates,
    privacy_profile_visibility: formData.privacySettings?.profileVisibility,
    privacy_data_processing: formData.privacySettings?.dataProcessingConsent,
    privacy_marketing: formData.privacySettings?.marketingConsent,
    privacy_analytics: formData.privacySettings?.analyticsConsent,
  };
}

/**
 * Convert database format to form data
 */
export function convertDbFormatToFormData(dbData: UserProfileData): UserProfileFormData {
  return {
    firstName: dbData.first_name || '',
    lastName: dbData.last_name || '',
    email: dbData.email,
    role: dbData.role,
    birthYear: dbData.birth_year?.toString() || '',
    educationType: dbData.education_type || '',
    institution: dbData.institution || '',
    subjects: dbData.subjects || '',
    profilePhotoUrl: dbData.profile_photo_url || '',
    twoFactorEnabled: dbData.two_factor_enabled || false,
    language: dbData.language || 'nl',
    notificationSettings: {
      emailNotifications: dbData.notification_email ?? true,
      worksheetReminders: dbData.notification_worksheets ?? true,
      submissionNotifications: dbData.notification_submissions ?? true,
      systemUpdates: dbData.notification_system ?? true,
    },
    privacySettings: {
      profileVisibility: dbData.privacy_profile_visibility || 'institutional',
      dataProcessingConsent: dbData.privacy_data_processing ?? true,
      marketingConsent: dbData.privacy_marketing ?? false,
      analyticsConsent: dbData.privacy_analytics ?? true,
    },
  };
}