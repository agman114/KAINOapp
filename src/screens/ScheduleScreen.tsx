import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { DaySchedule, Lesson, StudentProfile } from '../types/kai';
import { KaiService } from '../services/kaiService';
import { StorageService } from '../services/storage';

interface Props {
  schedule: DaySchedule[];
  student: StudentProfile;
  onUpdateSchedule?: (profile: StudentProfile, schedule: DaySchedule[]) => void;
}

interface UpcomingDay {
  index: number;
  dateStr: string; // e.g. "31.08"
  dayName: string; // e.g. "Пн"
  fullDayName: string; // e.g. "Понеділок"
  dayOfWeekKai: number; // 1..7 (1 = Mon)
  isToday: boolean;
}

export const ScheduleScreen: React.FC<Props> = ({ schedule, student, onUpdateSchedule }) => {
  const [selectedUpcomingIndex, setSelectedUpcomingIndex] = useState<number>(0); // 0 = Today
  
  const [loginModalVisible, setLoginModalVisible] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [currentLessonInfo, setCurrentLessonInfo] = useState<{
    lesson: Lesson;
    progress: number;
    remainingMinutes: number;
  } | null>(null);

  // Генерируем массив из 7 ближайших дней начиная с СЕГОДНЯ
  const getUpcoming7Days = (): UpcomingDay[] => {
    const list: UpcomingDay[] = [];
    const now = new Date();
    const shortNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const fullNames = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);

      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const dateStr = `${dayNum}.${monthNum}`;
      const dayOfWeekIndex = d.getDay();
      const dayOfWeekKai = dayOfWeekIndex === 0 ? 7 : dayOfWeekIndex;

      list.push({
        index: i,
        dateStr,
        dayName: shortNames[dayOfWeekIndex],
        fullDayName: fullNames[dayOfWeekIndex],
        dayOfWeekKai,
        isToday: i === 0,
      });
    }
    return list;
  };

  const upcoming7Days = getUpcoming7Days();
  const activeUpcomingDay = upcoming7Days[selectedUpcomingIndex] || upcoming7Days[0];

  // Ищем расписание ТОЧНО для выбранной календарной даты
  const getLessonsForDay = (targetDay: UpcomingDay): Lesson[] => {
    // 1. Поиск по точной дате (например "31.08")
    const dateMatch = schedule.find(s => s.dateStr === targetDay.dateStr);
    if (dateMatch && dateMatch.lessons) {
      return dateMatch.lessons;
    }

    // 2. Фолбэк по дню недели для 1-й недели
    const dayMatch = schedule.find(s => s.dayOfWeek === targetDay.dayOfWeekKai && s.weekNumber === 1);
    if (dayMatch && dayMatch.lessons) {
      return dayMatch.lessons;
    }

    return [];
  };

  const lessons = getLessonsForDay(activeUpcomingDay);

  useEffect(() => {
    const checkCurrent = () => {
      const info = KaiService.getCurrentLesson(schedule);
      setCurrentLessonInfo(info);
    };

    checkCurrent();
    const interval = setInterval(checkCurrent, 30000);
    return () => clearInterval(interval);
  }, [schedule]);

  const handleRefreshClick = async () => {
    const creds = await StorageService.getCredentials();
    if (creds && creds.username && creds.password) {
      setLoading(true);
      try {
        const res = await KaiService.login(creds.username, creds.password);
        setLoading(false);
        if (onUpdateSchedule) {
          onUpdateSchedule(res.profile, res.schedule);
        }
        Alert.alert('Оновлено! 🔄', 'Розклад успішно оновлено з cabinet.kai.edu.ua!');
      } catch (e: any) {
        setLoading(false);
        Alert.alert('Помилка оновлення', e.message || 'Не вдалося оновити розклад');
      }
    } else {
      setLoginModalVisible(true);
    }
  };

  const handleLiveFetch = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Увага', 'Введіть ваші логін та пароль від cabinet.kai.edu.ua');
      return;
    }

    setLoading(true);
    try {
      const res = await KaiService.login(username, password);
      setLoading(false);
      setLoginModalVisible(false);
      if (onUpdateSchedule) {
        onUpdateSchedule(res.profile, res.schedule);
      }
      Alert.alert('Успіх! 🎉', 'Живе розклад з cabinet.kai.edu.ua успішно завантажено!');
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Помилка', e.message || 'Перевірте логін та пароль.');
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Лекція':
        return { bg: '#f59e0b22', text: '#fbbf24', border: '#f59e0b' };
      case 'Лабораторна':
        return { bg: '#10b98122', text: '#34d399', border: '#10b981' };
      case 'Практика':
        return { bg: '#ec489922', text: '#f472b6', border: '#ec4899' };
      default:
        return { bg: '#3b82f622', text: '#60a5fa', border: '#3b82f6' };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.groupBadge}>{student.groupName || 'Б-F7-26-1-КС'}</Text>
            <Text style={styles.headerTitle}>Розклад занять</Text>
            <Text style={styles.todayDateText}>
              {activeUpcomingDay.fullDayName}, {activeUpcomingDay.dateStr} {activeUpcomingDay.isToday ? '(Сьогодні)' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshClick}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.refreshButtonText}>🔄 Оновити розклад</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal авторизации на cabinet.kai.edu.ua */}
      <Modal visible={loginModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔑 Авто-синхронізація з КАИ</Text>
            <Text style={styles.modalSubtitle}>
              Введіть ваші логін та пароль від cabinet.kai.edu.ua один раз. Вони будуть збережені для автоматичного фонового оновлення розкладу:
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Логін від cabinet.kai.edu.ua..."
              placeholderTextColor="#64748b"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Пароль..."
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleLiveFetch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalSubmitText}>🚀 Авторизуватися та Завантажити</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setLoginModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Banner текущей пары */}
      {currentLessonInfo && (
        <View style={styles.activeBanner}>
          <View style={styles.activeHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Зараз іде пара</Text>
            </View>
            <Text style={styles.remainingText}>Залишилось: {currentLessonInfo.remainingMinutes} хв</Text>
          </View>
          <Text style={styles.activeSubject}>{currentLessonInfo.lesson.subject}</Text>
          <Text style={styles.activeDetails}>
            {currentLessonInfo.lesson.type} • Ауд. {currentLessonInfo.lesson.room} ({currentLessonInfo.lesson.building})
          </Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${currentLessonInfo.progress}%` }]} />
          </View>
        </View>
      )}

      {/* Плавающая панель 7 БЛИЖАЙШИХ ДНЕЙ */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
        <View style={styles.dayTabs}>
          {upcoming7Days.map(d => {
            const isActive = d.index === selectedUpcomingIndex;
            return (
              <TouchableOpacity
                key={d.index}
                style={[styles.dayTab, isActive && styles.dayTabActive]}
                onPress={() => setSelectedUpcomingIndex(d.index)}
              >
                <Text style={[styles.dayTabText, isActive && styles.dayTabTextActive]}>
                  {d.dayName}
                </Text>
                <Text style={[styles.dayDateText, isActive && styles.dayDateTextActive]}>
                  {d.dateStr}
                </Text>
                {d.isToday && <View style={styles.todayIndicatorDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Список пар на выбранный день */}
      {lessons.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>На цей день пар немає!</Text>
          <Text style={styles.emptySubtitle}>
            На {activeUpcomingDay.dateStr} ({activeUpcomingDay.fullDayName}) занять не заплановано. Відпочивайте!
          </Text>
        </View>
      ) : (
        lessons.map((lesson, idx) => {
          const typeStyle = getTypeStyle(lesson.type);
          return (
            <View key={lesson.id || idx} style={styles.lessonCard}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeStart}>{lesson.timeStart}</Text>
                <View style={styles.timeLine} />
                <Text style={styles.timeEnd}>{lesson.timeEnd}</Text>
              </View>

              <View style={styles.lessonContent}>
                <View style={styles.lessonHeaderRow}>
                  <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg, borderColor: typeStyle.border }]}>
                    <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>{lesson.type}</Text>
                  </View>
                  <Text style={styles.dateTagText}>
                    📅 {activeUpcomingDay.dateStr}
                  </Text>
                </View>

                <Text style={styles.subjectTitle}>{lesson.subject}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>👨‍🏫 {lesson.teacher}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    📍 {lesson.building ? `${lesson.building}, ` : ''}ауд. {lesson.room}
                  </Text>
                </View>

                {lesson.onlineUrl && (
                  <TouchableOpacity
                    style={styles.onlineButton}
                    onPress={() => Linking.openURL(lesson.onlineUrl!)}
                  >
                    <Text style={styles.onlineButtonText}>💻 Приєднатися до MS Teams</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupBadge: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 2,
  },
  todayDateText: {
    fontSize: 13,
    color: '#a5b4fc',
    marginTop: 4,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  activeBanner: {
    backgroundColor: '#1e1b4b',
    borderColor: '#6366f1',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  liveText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '700',
  },
  remainingText: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
  },
  activeSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  activeDetails: {
    fontSize: 13,
    color: '#c7d2fe',
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#312e81',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  daysScroll: {
    marginBottom: 16,
  },
  dayTabs: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 10,
    minWidth: 64,
  },
  dayTabActive: {
    backgroundColor: '#0284c7',
  },
  dayTabText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  dayTabTextActive: {
    color: '#ffffff',
  },
  dayDateText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  dayDateTextActive: {
    color: '#e0f2fe',
  },
  todayIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38bdf8',
    marginTop: 4,
  },
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeColumn: {
    alignItems: 'center',
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: '#334155',
    justifyContent: 'center',
    width: 60,
  },
  timeStart: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  timeEnd: {
    fontSize: 12,
    color: '#64748b',
  },
  timeLine: {
    width: 2,
    height: 12,
    backgroundColor: '#334155',
    marginVertical: 4,
  },
  lessonContent: {
    flex: 1,
    paddingLeft: 14,
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateTagText: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '600',
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
    lineHeight: 22,
  },
  metaRow: {
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  onlineButton: {
    marginTop: 10,
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  onlineButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  modalSubmitButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  modalSubmitText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  modalCloseBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCloseText: {
    color: '#64748b',
    fontSize: 13,
  },
});
