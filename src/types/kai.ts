export type LessonType = 'Лекція' | 'Практика' | 'Лабораторна' | 'Семінар';

export interface Lesson {
  id: string;
  subject: string;
  type: LessonType;
  timeStart: string; // e.g. "08:30"
  timeEnd: string;   // e.g. "10:05"
  teacher: string;   // e.g. "доц. Коваленко В. П."
  room: string;      // e.g. "1.204"
  building?: string; // e.g. "Корпус 1"
  weekType: 'all' | 'odd' | 'even'; // 1-я неделя (нечетная) / 2-я неделя (четная)
  dayOfWeek: number; // 1 = Понедельник, ..., 6 = Суббота
  onlineUrl?: string; // Ссылка на MS Teams / Zoom / Google Meet
}

export interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
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
  isAuthenticated: boolean;
}

export interface ExamItem {
  id: string;
  subject: string;
  type: 'Залік' | 'Екзамен' | 'Диф. залік';
  date: string;
  time: string;
  teacher: string;
  room: string;
  grade?: string; // e.g. "95 (A) / Відмінно"
  points?: number;
}

export interface FinancialItem {
  id: string;
  title: string;
  amount: string;
  dueDate: string;
  status: 'Сплачено' | 'Очікує оплати' | 'Заборгованість';
}
