import { Lesson } from '../types/kai';

export class NotificationService {
  private static permissionGranted = false;

  /**
   * Запросить разрешение на показ всплывающих уведомлений на ПК/смартфоне
   */
  static async requestPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        this.permissionGranted = result === 'granted';
        return this.permissionGranted;
      } catch (e) {
        console.error('Failed to request notification permission:', e);
      }
    }
    return false;
  }

  /**
   * Отправить системное всплывающее окно (Toast Notification) на ПК
   */
  static sendSystemNotification(title: string, body: string, icon?: string) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          tag: 'kaino-lesson-alert',
        });
      }
    }
  }

  /**
   * Проверка предстоящих пар и показ всплывающего окна за 10 минут
   */
  static checkAndNotifyUpcomingLesson(lessons: Lesson[]) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const lesson of lessons) {
      const [hStart, mStart] = lesson.timeStart.split(':').map(Number);
      const startMin = hStart * 60 + mStart;

      // За 10 минут до пары
      if (startMin - currentMinutes === 10) {
        this.sendSystemNotification(
          `🔔 Нагадування про пару: ${lesson.subject}`,
          `Через 10 хв починається ${lesson.type}. Ауд. ${lesson.room} (${lesson.teacher})`
        );
      }
    }
  }
}
