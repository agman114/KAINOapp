import axios from 'axios';
import { StudentProfile, DaySchedule, ERROR_CODES } from '../types/kai';
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
        const errText = response.data?.error || ERROR_CODES.ERR_101;
        throw new Error(errText);
      }
    } catch (error: any) {
      console.error('Live KAI Scrape Error:', error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error(ERROR_CODES.ERR_102);
      }
      if (error.message?.includes('Network Error') || !error.response) {
        throw new Error(ERROR_CODES.ERR_103);
      }
      throw new Error(error.response?.data?.error || error.message || ERROR_CODES.ERR_101);
    }
  }

  /**
   * Авто-обновление данных расписания при запуске
   */
  static async refreshSchedule(): Promise<{ profile: StudentProfile; schedule: DaySchedule[] } | null> {
    try {
      const creds = await StorageService.getCredentials();
      if (!creds || !creds.username || !creds.password) {
        return null;
      }

      console.log('[KAI SERVICE] Auto-refreshing schedule for background user:', creds.username);
      return await this.login(creds.username, creds.password);
    } catch (e: any) {
      console.warn('[KAI SERVICE] Auto-refresh failed (offline or server error):', e.message);
      return null;
    }
  }
}
