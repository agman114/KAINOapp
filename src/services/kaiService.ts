import axios from 'axios';
import { StudentProfile, DaySchedule } from '../types/kai';
import { StorageService } from './storage';
import { MOCK_STUDENT, MOCK_SCHEDULE } from './mockData';

export class KaiService {
  /**
   * Прямая авторизация и забор расписания с cabinet.kai.edu.ua
   */
  static async login(login: string, pass: string): Promise<{ profile: StudentProfile; schedule: DaySchedule[] }> {
    if (login === 'demo' || pass === 'demo') {
      const demoProfile = { ...MOCK_STUDENT };
      await StorageService.saveStudentProfile(demoProfile);
      await StorageService.saveSchedule(MOCK_SCHEDULE);
      await StorageService.saveCredentials({ username: login, password: pass });
      return { profile: demoProfile, schedule: MOCK_SCHEDULE };
    }

    try {
      const response = await axios.post('/api/kai/login', {
        username: login,
        password: pass,
      }, {
        timeout: 35000,
      });

      if (response.data && response.data.success) {
        const { profile, schedule } = response.data;
        await StorageService.saveStudentProfile(profile);
        await StorageService.saveSchedule(schedule);
        await StorageService.saveCredentials({ username: login, password: pass });
        return { profile, schedule };
      } else {
        throw new Error(response.data?.error || 'Помилка авторизації на порталі КАИ');
      }
    } catch (error: any) {
      console.error('Live KAI Scrape Error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Не вдалося завантажити дані з cabinet.kai.edu.ua');
    }
  }

  /**
   * Фоновая авто-синхронизация с использованием сохраненных логина и пароля
   */
  static async autoSyncSchedule(): Promise<{ profile: StudentProfile; schedule: DaySchedule[] } | null> {
    const creds = await StorageService.getCredentials();
    if (creds && creds.username && creds.password) {
      try {
        console.log('[KaiService] Auto-syncing schedule with saved credentials for:', creds.username);
        return await this.login(creds.username, creds.password);
      } catch (e) {
        console.error('[KaiService] Auto-sync background failed, using cached schedule:', e);
      }
    }
    return null;
  }

  /**
   * Загрузка расписания
   */
  static async loadSchedule(): Promise<DaySchedule[]> {
    try {
      return await StorageService.getSchedule();
    } catch (e) {
      return [];
    }
  }

  /**
   * Расчет текущей активной пары
   */
  static getCurrentLesson(lessons: DaySchedule[]) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todaySchedule = lessons.find(d => d.dayOfWeek === (currentDay === 0 ? 7 : currentDay));
    if (!todaySchedule || !todaySchedule.lessons) return null;

    for (const lesson of todaySchedule.lessons) {
      if (!lesson.timeStart || !lesson.timeEnd) continue;
      const [hStart, mStart] = lesson.timeStart.split(':').map(Number);
      const [hEnd, mEnd] = lesson.timeEnd.split(':').map(Number);
      const startMin = hStart * 60 + mStart;
      const endMin = hEnd * 60 + mEnd;

      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        const progress = Math.round(((currentMinutes - startMin) / (endMin - startMin)) * 100);
        return { lesson, progress, remainingMinutes: endMin - currentMinutes };
      }
    }
    return null;
  }
}
