import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StudentProfile, DaySchedule } from '../types/kai';

const KEYS = {
  STUDENT_PROFILE: 'kaino_student_profile',
  SCHEDULE: 'kaino_schedule',
  NOTIFICATIONS_ENABLED: 'kaino_notifications',
  USER_CREDENTIALS: 'kaino_user_credentials',
};

export const StorageService = {
  /**
   * Сохранение / получение логина и пароля студента для авто-синхронизации
   */
  async getCredentials(): Promise<{ username?: string; password?: string } | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_CREDENTIALS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveCredentials(creds: { username: string; password: string }): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_CREDENTIALS, JSON.stringify(creds));
    } catch (e) {
      console.error('Failed to save credentials', e);
    }
  },

  /**
   * Загрузка профиля студента
   */
  async getStudentProfile(): Promise<StudentProfile | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.STUDENT_PROFILE);
      if (data) return JSON.parse(data);

      const diskResp = await axios.get('/api/storage/load', { timeout: 3000 });
      if (diskResp.data && diskResp.data.profile) {
        await AsyncStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(diskResp.data.profile));
        return diskResp.data.profile;
      }
    } catch {}
    return null;
  },

  async saveStudentProfile(profile: StudentProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(profile));
      const currentSchedule = await this.getSchedule();
      const creds = await this.getCredentials();
      await axios.post('/api/storage/save', { profile, schedule: currentSchedule, creds }, { timeout: 3000 }).catch(() => {});
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  /**
   * Загрузка сохраненного расписания
   */
  async getSchedule(): Promise<DaySchedule[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SCHEDULE);
      if (data) return JSON.parse(data);

      const diskResp = await axios.get('/api/storage/load', { timeout: 3000 });
      if (diskResp.data && diskResp.data.schedule && diskResp.data.schedule.length > 0) {
        await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(diskResp.data.schedule));
        return diskResp.data.schedule;
      }
    } catch {}
    return [];
  },

  async saveSchedule(schedule: DaySchedule[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
      const profile = await this.getStudentProfile();
      const creds = await this.getCredentials();
      await axios.post('/api/storage/save', { profile, schedule, creds }, { timeout: 3000 }).catch(() => {});
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
      await AsyncStorage.multiRemove([KEYS.STUDENT_PROFILE, KEYS.SCHEDULE, KEYS.USER_CREDENTIALS]);
      await axios.post('/api/storage/save', { profile: null, schedule: [], creds: null }, { timeout: 3000 }).catch(() => {});
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  }
};
