import axios from 'axios';
import { Linking, Platform } from 'react-native';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  githubUrl: string;
  downloadUrl?: string;
  releaseNotes?: string;
}

const CURRENT_VERSION = '1.0.1';

export const UpdateService = {
  /**
   * Проверка наличия свежего релиза на GitHub Releases
   */
  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const ghResp = await axios.get('https://api.github.com/repos/agman114/KAINOapp/releases/latest', {
        timeout: 6000,
      });

      if (ghResp.data && ghResp.data.tag_name) {
        const latestVer = ghResp.data.tag_name.replace(/^v/, '');
        const updateAvailable = latestVer !== CURRENT_VERSION;
        
        let downloadUrl = ghResp.data.html_url;
        if (ghResp.data.assets && Array.isArray(ghResp.data.assets)) {
          const apkAsset = ghResp.data.assets.find((a: any) => a.name.endsWith('.apk'));
          const exeAsset = ghResp.data.assets.find((a: any) => a.name.endsWith('.exe') || a.name.endsWith('.zip'));
          if (Platform.OS === 'android' && apkAsset) {
            downloadUrl = apkAsset.browser_download_url;
          } else if (exeAsset) {
            downloadUrl = exeAsset.browser_download_url;
          }
        }

        return {
          currentVersion: CURRENT_VERSION,
          latestVersion: latestVer,
          updateAvailable,
          githubUrl: ghResp.data.html_url,
          downloadUrl,
          releaseNotes: ghResp.data.body || 'Нове оновлення KAINOapp!',
        };
      }
    } catch (e) {
      console.log('[UpdateService] GitHub releases check failed (offline or rate limit)');
    }
    return null;
  },

  /**
   * Запуск автоматического обновления в 1 клик
   */
  async performUpdate(info: UpdateInfo): Promise<void> {
    const targetUrl = info.downloadUrl || info.githubUrl || 'https://github.com/agman114/KAINOapp/releases/latest';
    console.log('[UpdateService] Performing 1-Click Update redirect to:', targetUrl);
    Linking.openURL(targetUrl);
  }
};
