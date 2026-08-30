import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentProfile, DaySchedule } from '../types/kai';

const KEYS = {
  STUDENT_PROFILE: 'kaino_student_profile',
  SCHEDULE: 'kaino_schedule',
  THEME_MODE: 'kaino_theme_mode',
  NOTIFICATIONS_ENABLED: 'kaino_notifications',
};

export const StorageService = {
  async getStudentProfile(): Promise<StudentProfile | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.STUDENT_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveStudentProfile(profile: StudentProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  async getSchedule(): Promise<DaySchedule[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SCHEDULE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveSchedule(schedule: DaySchedule[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
    } catch (e) {
      console.error('Failed to save schedule', e);
    }
  },

  async isNotificationsEnabled(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(KEYS.NOTIFICATIONS_ENABLED);
      return val !== null ? JSON.parse(val) : true;
    } catch {
      return true;
    }
  },

  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS_ENABLED, JSON.stringify(enabled));
    } catch (e) {
      console.error('Failed to save notifications preference', e);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KEYS.STUDENT_PROFILE, KEYS.SCHEDULE]);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  }
};
