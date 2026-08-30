export type LessonType = 'Лекція' | 'Практика' | 'Лабораторна' | 'Семінар';

export interface Lesson {
  id: string;
  subject: string;
  type: LessonType;
  timeStart: string; // e.g. "08:30"
  timeEnd: string;   // e.g. "10:05"
  teacher: string;   // e.g. "доц. Мельник І. С."
  room: string;      // e.g. "1.204"
  building?: string; // e.g. "Корпус КАИ"
  weekNumber: number;
  weekName?: string;
  dayOfWeek: number;
  dateStr?: string;
  onlineUrl?: string;
}

export interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  dateStr?: string;
  weekNumber: number;
  lessons: Lesson[];
}

export interface StudentProfile {
  fullName: string;
  groupName: string;
  faculty: string;
  specialty: string;
  course: number;
  educationForm: string;
  photoUrl?: string;
  studentIdCard?: string;
  email?: string;
  phone?: string;
  address?: string;
  isAuthenticated: boolean;
}

export interface PortalServicesData {
  bypassText?: string;
  qualificationText?: string;
  electiveText?: string;
  pollText?: string;
  sessionText?: string;
  sessionScheduleText?: string;
}

export interface ExamItem {
  id: string;
  subject: string;
  type: 'Залік' | 'Екзамен' | 'Диф. залік';
  date: string;
  time: string;
  teacher: string;
  room: string;
  grade?: string;
  points?: number;
}

export const ERROR_CODES = {
  ERR_101: '[ERR-101] Невірний логін або пароль на порталі КАИ',
  ERR_102: '[ERR-102] Сервер cabinet.kai.edu.ua тимчасово недоступний або перевантажений',
  ERR_103: '[ERR-103] Відсутній зв\'язок з мережею Інтернет',
  ERR_201: '[ERR-201] Локальний сервер KAINOapp недоступний (порт 3000)',
  ERR_202: '[ERR-202] Помилка зчитування збережених даних студента',
  ERR_301: '[ERR-301] Помилка обробки (парсингу) розкладу КАИ',
  ERR_401: '[ERR-401] Помилка автоматичного оновлення додатка',
} as const;

export type ErrorCodeKey = keyof typeof ERROR_CODES;
