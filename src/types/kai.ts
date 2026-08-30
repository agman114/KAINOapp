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
  weekNumber: number; // 1 = 1 тиждень, 2 = 2 тиждень, etc.
  weekName?: string;  // e.g. "1 тиждень"
  dayOfWeek: number;  // 1 = Понеділок, ..., 6 = Субота
  onlineUrl?: string; // Ссылка на MS Teams / Zoom
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
  grade?: string;
  points?: number;
}

export interface FinancialItem {
  id: string;
  title: string;
  amount: string;
  dueDate: string;
  status: 'Сплачено' | 'Очікує оплати' | 'Заборгованість';
}
