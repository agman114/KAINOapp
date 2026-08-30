import axios from 'axios';
import { Linking, Platform } from 'react-native';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  localHash?: string;
  remoteHash?: string;
  githubUrl: string;
}

export const UpdateService = {
  /**
   * Проверка доступности нового обновления с GitHub
   */
  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const resp = await axios.get('/api/system/check-update', { timeout: 4000 });
      if (resp.data) {
        return resp.data as UpdateInfo;
      }
    } catch (e) {
      console.log('[UpdateService] Offline or standalone mode check info');
    }
    return null;
  },

  /**
   * Выполнение автоматического обновления
   */
  async performUpdate(): Promise<boolean> {
    try {
      // На ПК / Декстоп: Запускаем авто-пулл из гитхаба и сборку
      const resp = await axios.post('/api/system/do-update', {}, { timeout: 60000 });
      if (resp.data && resp.data.success) {
        if (typeof window !== 'undefined' && window.location) {
          window.location.reload();
        }
        return true;
      }
    } catch (e) {
      console.error('[UpdateService] PC git update failed, opening GitHub releases fallback', e);
    }

    // На телефоне / Смартфоне: Открываем страницу релизов GitHub для скачивания нового APK
    Linking.openURL('https://github.com/agman114/KAINOapp/releases');
    return false;
  }
};
