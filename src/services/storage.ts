import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StudentProfile, DaySchedule } from '../types/kai';

const KEYS = {
  STUDENT_PROFILE: 'kaino_student_profile',
  SCHEDULE: 'kaino_schedule',
  NOTIFICATIONS_ENABLED: 'kaino_notifications',
};

export const StorageService = {
  /**
   * Загрузка профиля студента (с двойной гарантией сохранения на диске)
   */
  async getStudentProfile(): Promise<StudentProfile | null> {
    try {
      // 1. Из локальной памяти бразуера/приложения
      const data = await AsyncStorage.getItem(KEYS.STUDENT_PROFILE);
      if (data) return JSON.parse(data);

      // 2. Резервный забор из незгораемого файла на диске через API
      const diskResp = await axios.get('/api/storage/load', { timeout: 3000 });
      if (diskResp.data && diskResp.data.profile) {
        await AsyncStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(diskResp.data.profile));
        return diskResp.data.profile;
      }
    } catch {
      // Игнорируем ошибки сети при офлайн старте
    }
    return null;
  },

  async saveStudentProfile(profile: StudentProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(profile));
      const currentSchedule = await this.getSchedule();
      await axios.post('/api/storage/save', { profile, schedule: currentSchedule }, { timeout: 3000 }).catch(() => {});
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
    } catch {
      // Игнорируем сети
    }
    return [];
  },

  async saveSchedule(schedule: DaySchedule[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
      const profile = await this.getStudentProfile();
      await axios.post('/api/storage/save', { profile, schedule }, { timeout: 3000 }).catch(() => {});
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
      await axios.post('/api/storage/save', { profile: null, schedule: [] }, { timeout: 3000 }).catch(() => {});
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  }
};
