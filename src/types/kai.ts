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

export interface ElectiveCourse {
  id: string;
  title: string;
  code: string;
  department: string;
  status: 'Обрано' | 'В обробці' | 'Доступно';
}

export interface QualificationWork {
  topic: string;
  supervisor: string;
  status: string;
  defenseDate?: string;
}

export interface BypassSheetItem {
  department: string;
  status: 'Підтверджено' | 'В очікуванні' | 'Не пройдено';
  date?: string;
}
