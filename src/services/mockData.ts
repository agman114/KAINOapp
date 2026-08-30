import { StudentProfile, DaySchedule, ExamItem, FinancialItem } from '../types/kai';

export const MOCK_STUDENT: StudentProfile = {
  fullName: 'Чередніченко Данило Андрійович',
  groupName: 'Б-F7-26-1-КС',
  faculty: 'Факультет комп\'ютерних систем та програмної інженерії',
  specialty: '121 Інженерія програмного забезпечення',
  course: 2,
  educationForm: 'Денна (Бюджет)',
  isAuthenticated: true,
};

export const MOCK_SCHEDULE: DaySchedule[] = [
  {
    dayOfWeek: 1,
    dayName: 'Понеділок',
    lessons: [
      {
        id: 'mon-1',
        subject: 'Об\'єктно-орієнтоване програмування',
        type: 'Лекція',
        timeStart: '08:30',
        timeEnd: '10:05',
        teacher: 'проф. Бондаренко О. В.',
        room: '1.204',
        building: 'Корпус 1',
        weekType: 'all',
        dayOfWeek: 1,
        onlineUrl: 'https://teams.microsoft.com/l/meetup-join/kai-oop'
      },
      {
        id: 'mon-2',
        subject: 'Алгоритми та структури даних',
        type: 'Лабораторна',
        timeStart: '10:20',
        timeEnd: '11:55',
        teacher: 'доц. Мельник І. С.',
        room: '7.310',
        building: 'Корпус 7',
        weekType: 'odd',
        dayOfWeek: 1,
      },
      {
        id: 'mon-3',
        subject: 'Бази даних та інформаційні системи',
        type: 'Практика',
        timeStart: '12:10',
        timeEnd: '13:45',
        teacher: 'ст. викл. Шевченко Т. Г.',
        room: '1.302',
        building: 'Корпус 1',
        weekType: 'all',
        dayOfWeek: 1,
      }
    ]
  },
  {
    dayOfWeek: 2,
    dayName: 'Вівторок',
    lessons: [
      {
        id: 'tue-1',
        subject: 'Комп\'ютерна графіка та візуалізація',
        type: 'Лекція',
        timeStart: '10:20',
        timeEnd: '11:55',
        teacher: 'доц. Кравченко М. А.',
        room: '5.101',
        building: 'Корпус 5',
        weekType: 'all',
        dayOfWeek: 2,
      },
      {
        id: 'tue-2',
        subject: 'Об\'єктно-орієнтоване програмування',
        type: 'Лабораторна',
        timeStart: '12:10',
        timeEnd: '13:45',
        teacher: 'доц. Коваленко В. П.',
        room: '7.208',
        building: 'Корпус 7',
        weekType: 'even',
        dayOfWeek: 2,
      }
    ]
  },
  {
    dayOfWeek: 3,
    dayName: 'Середа',
    lessons: [
      {
        id: 'wed-1',
        subject: 'Операційні системи',
        type: 'Лекція',
        timeStart: '08:30',
        timeEnd: '10:05',
        teacher: 'доц. Сидоренко П. М.',
        room: '1.108',
        building: 'Корпус 1',
        weekType: 'all',
        dayOfWeek: 3,
      },
      {
        id: 'wed-2',
        subject: 'Операційні системи',
        type: 'Лабораторна',
        timeStart: '10:20',
        timeEnd: '11:55',
        teacher: 'асист. Гнатюк Д. В.',
        room: '7.312',
        building: 'Корпус 7',
        weekType: 'all',
        dayOfWeek: 3,
      },
      {
        id: 'wed-3',
        subject: 'Іноземна мова за професійним спрямуванням',
        type: 'Практика',
        timeStart: '12:10',
        timeEnd: '13:45',
        teacher: 'ст. викл. Ткаченко О. М.',
        room: '2.405',
        building: 'Корпус 2',
        weekType: 'all',
        dayOfWeek: 3,
      }
    ]
  },
  {
    dayOfWeek: 4,
    dayName: 'Четвер',
    lessons: [
      {
        id: 'thu-1',
        subject: 'Комп\'ютерні мережі',
        type: 'Лекція',
        timeStart: '10:20',
        timeEnd: '11:55',
        teacher: 'проф. Лисенко В. І.',
        room: '1.204',
        building: 'Корпус 1',
        weekType: 'all',
        dayOfWeek: 4,
      },
      {
        id: 'thu-2',
        subject: 'Комп\'ютерні мережі',
        type: 'Лабораторна',
        timeStart: '12:10',
        timeEnd: '13:45',
        teacher: 'доц. Мороз О. С.',
        room: '7.401',
        building: 'Корпус 7',
        weekType: 'odd',
        dayOfWeek: 4,
      }
    ]
  },
  {
    dayOfWeek: 5,
    dayName: 'П\'ятниця',
    lessons: [
      {
        id: 'fri-1',
        subject: 'Теорія ймовірностей та математична статистика',
        type: 'Лекція',
        timeStart: '08:30',
        timeEnd: '10:05',
        teacher: 'доц. Василенко Н. О.',
        room: '1.305',
        building: 'Корпус 1',
        weekType: 'all',
        dayOfWeek: 5,
      },
      {
        id: 'fri-2',
        subject: 'Теорія ймовірностей та математична статистика',
        type: 'Практика',
        timeStart: '10:20',
        timeEnd: '11:55',
        teacher: 'доц. Василенко Н. О.',
        room: '1.305',
        building: 'Корпус 1',
        weekType: 'all',
        dayOfWeek: 5,
      }
    ]
  },
  {
    dayOfWeek: 6,
    dayName: 'Субота',
    lessons: []
  }
];

export const MOCK_EXAMS: ExamItem[] = [
  {
    id: 'ex-1',
    subject: 'Об\'єктно-орієнтоване програмування',
    type: 'Екзамен',
    date: '18.01.2026',
    time: '09:00',
    teacher: 'проф. Бондаренко О. В.',
    room: '1.204',
    grade: '92 (A) / Відмінно',
    points: 92,
  },
  {
    id: 'ex-2',
    subject: 'Алгоритми та структури даних',
    type: 'Екзамен',
    date: '22.01.2026',
    time: '11:00',
    teacher: 'доц. Мельник І. С.',
    room: '7.310',
    grade: '88 (B) / Добре',
    points: 88,
  },
  {
    id: 'ex-3',
    subject: 'Операційні системи',
    type: 'Залік',
    date: '14.01.2026',
    time: '10:00',
    teacher: 'доц. Сидоренко П. М.',
    room: '1.108',
    grade: 'Зараховано (95 б.)',
    points: 95,
  }
];

export const MOCK_FINANCIAL: FinancialItem[] = [
  {
    id: 'fin-1',
    title: 'Оплата за 2 семестр 2025/2026 н.р.',
    amount: '0.00 грн (Бюджет)',
    dueDate: '01.02.2026',
    status: 'Сплачено',
  },
  {
    id: 'fin-2',
    title: 'Проживання в гуртожитку №6',
    amount: '1200.00 грн / міс.',
    dueDate: '25.09.2026',
    status: 'Сплачено',
  }
];
