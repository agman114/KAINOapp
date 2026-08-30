import { Lesson, DaySchedule } from '../types/kai';

/**
 * Універсальний парсер розкладу КАИ (из HTML или скопированного текста)
 */
export class KaiHtmlParser {
  /**
   * Разбор скопированного текста или HTML расписания с cabinet.kai.edu.ua/student/schedule
   */
  static parseRawTextOrHtml(rawContent: string): DaySchedule[] {
    const days = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
    const daySchedules: DaySchedule[] = [];

    // Чистка от лишних разрывов
    const cleanContent = rawContent.replace(/\r\n/g, '\n');

    days.forEach((dayName, dayIdx) => {
      const dayOfWeek = dayIdx + 1;
      const lessons: Lesson[] = [];

      // Находим кусок текста для соответствующего дня недели
      const nextDay = days[dayIdx + 1];
      const dayPattern = new RegExp(`${dayName}([\\s\\S]*?)(?=${nextDay || '$'})`, 'i');
      const match = cleanContent.match(dayPattern);

      if (match) {
        const daySection = match[1];

        // Ищем фрагменты времени вида 08:30 - 10:05 или 08:30
        const lines = daySection.split('\n').map(l => l.trim()).filter(Boolean);

        let currentLesson: Partial<Lesson> | null = null;
        let lessonIdCounter = 1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Регулярное выражение времени пары
          const timeMatch = line.match(/(\d{1,2}:\d{2})\s*[-—–\s]\s*(\d{1,2}:\d{2})/);
          if (timeMatch) {
            if (currentLesson && currentLesson.subject) {
              lessons.push({
                id: `${dayOfWeek}-${lessonIdCounter++}`,
                subject: currentLesson.subject || 'Предмет КАИ',
                type: currentLesson.type || 'Лекція',
                timeStart: currentLesson.timeStart || '08:30',
                timeEnd: currentLesson.timeEnd || '10:05',
                teacher: currentLesson.teacher || 'Викладач',
                room: currentLesson.room || 'Аудиторія',
                building: 'Корпус КАИ',
                weekType: currentLesson.weekType || 'all',
                dayOfWeek,
              });
            }

            // Начинаем новую пару
            currentLesson = {
              timeStart: timeMatch[1],
              timeEnd: timeMatch[2],
              weekType: 'all',
              dayOfWeek,
            };
            continue;
          }

          if (currentLesson) {
            // Определение типа пары
            if (/лаб/i.test(line)) currentLesson.type = 'Лабораторна';
            else if (/практ/i.test(line)) currentLesson.type = 'Практика';
            else if (/лекц/i.test(line)) currentLesson.type = 'Лекція';
            else if (/ауд|корп|\b\d\.\d{3}\b/i.test(line)) {
              currentLesson.room = line;
            } else if (/проф|доц|викл|асист/i.test(line)) {
              currentLesson.teacher = line;
            } else if (!currentLesson.subject && line.length > 3) {
              currentLesson.subject = line;
            }
          }
        }

        // Добавляем последнюю пару
        if (currentLesson && currentLesson.subject) {
          lessons.push({
            id: `${dayOfWeek}-${lessonIdCounter++}`,
            subject: currentLesson.subject || 'Предмет КАИ',
            type: currentLesson.type || 'Лекція',
            timeStart: currentLesson.timeStart || '08:30',
            timeEnd: currentLesson.timeEnd || '10:05',
            teacher: currentLesson.teacher || 'Викладач',
            room: currentLesson.room || 'Аудиторія',
            building: 'Корпус КАИ',
            weekType: currentLesson.weekType || 'all',
            dayOfWeek,
          });
        }
      }

      daySchedules.push({
        dayOfWeek,
        dayName,
        lessons,
      });
    });

    return daySchedules;
  }
}
