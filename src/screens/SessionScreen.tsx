import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ExamItem, ElectiveCourse, QualificationWork } from '../types/kai';

export const SessionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grades' | 'schedule' | 'electives' | 'qualification'>('grades');

  const mockExams: ExamItem[] = [
    {
      id: 'e1',
      subject: 'Комп\'ютерна логіка',
      type: 'Екзамен',
      date: '15.01.2025',
      time: '09:00',
      teacher: 'Коцюр Анатолій Борисович',
      room: 'ауд. 3.328',
      grade: 'Відмінно',
      points: 95,
    },
    {
      id: 'e2',
      subject: 'Математика для ІТ',
      type: 'Екзамен',
      date: '19.01.2025',
      time: '10:00',
      teacher: 'Пахненко Валерія Валеріївна',
      room: 'ауд. 11.110',
      grade: 'Добре',
      points: 84,
    },
    {
      id: 'e3',
      subject: 'Дискретна математика',
      type: 'Диф. залік',
      date: '22.01.2025',
      time: '11:40',
      teacher: 'Марченко Надія Борисівна',
      room: 'ауд. 6.200',
      grade: 'Зараховано',
      points: 90,
    },
  ];

  const electives: ElectiveCourse[] = [
    { id: 'el1', title: 'Хмарні технології та DevOps', code: 'ЕК-121-01', department: 'Кафедра ІТ', status: 'Обрано' },
    { id: 'el2', title: 'Розробка мобільних додатків на React Native', code: 'ЕК-121-02', department: 'Кафедра ПЗ', status: 'Обрано' },
    { id: 'el3', title: 'Кібербезпека та захист даних', code: 'ЕК-121-03', department: 'Кафедра СБ', status: 'В обробці' },
  ];

  const qualification: QualificationWork = {
    topic: 'Розробка кросплатформеної системи авто-синхронізації розкладу для КАІ',
    supervisor: 'доц. Коцюр А. Б.',
    status: 'Тема затверджена деканатом',
    defenseDate: 'Червень 2026',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <Text style={styles.groupBadge}>Б-F7-26-1-КС</Text>
        <Text style={styles.headerTitle}>Навчальний процес</Text>

        {/* Переключатель вкладок */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'grades' && styles.tabButtonActive]}
              onPress={() => setActiveTab('grades')}
            >
              <Text style={[styles.tabText, activeTab === 'grades' && styles.tabTextActive]}>
                📊 Оцінки
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'schedule' && styles.tabButtonActive]}
              onPress={() => setActiveTab('schedule')}
            >
              <Text style={[styles.tabText, activeTab === 'schedule' && styles.tabTextActive]}>
                📅 Розклад сесії
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'electives' && styles.tabButtonActive]}
              onPress={() => setActiveTab('electives')}
            >
              <Text style={[styles.tabText, activeTab === 'electives' && styles.tabTextActive]}>
                📚 Вибіркові
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'qualification' && styles.tabButtonActive]}
              onPress={() => setActiveTab('qualification')}
            >
              <Text style={[styles.tabText, activeTab === 'qualification' && styles.tabTextActive]}>
                🎓 Дипломна
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Вкладка 1: Оцінки та бали */}
      {activeTab === 'grades' && (
        <View style={styles.section}>
          <View style={styles.statusBox}>
            <Text style={styles.statusIcon}>⏳</Text>
            <Text style={styles.statusTitle}>Оцінки ще не доступні...</Text>
            <Text style={styles.statusSubtitle}>
              Відомості про підсумкові оцінки та бали з заліків та екзаменів з'являться тут після початку сесії.
            </Text>
          </View>

          <Text style={styles.sectionHeaderTitle}>Попередній перегляд (Демо)</Text>
          {mockExams.map((exam) => (
            <View key={exam.id} style={styles.examCard}>
              <View style={styles.examTopRow}>
                <View style={styles.examBadge}>
                  <Text style={styles.examBadgeText}>{exam.type}</Text>
                </View>
                {exam.points && (
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>{exam.points} б.</Text>
                  </View>
                )}
              </View>

              <Text style={styles.examSubject}>{exam.subject}</Text>
              <Text style={styles.examMeta}>👨‍🏫 {exam.teacher}</Text>
              <Text style={styles.examMeta}>📍 {exam.room} • 🗓 {exam.date} о {exam.time}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Вкладка 2: Розклад сесії */}
      {activeTab === 'schedule' && (
        <View style={styles.section}>
          <View style={styles.statusBox}>
            <Text style={styles.statusIcon}>📅</Text>
            <Text style={styles.statusTitle}>Подій сесії не знайдено</Text>
            <Text style={styles.statusSubtitle}>
              На даний момент розклад консультацій та екзаменів не опубліковано деканатом.
            </Text>
          </View>
        </View>
      )}

      {/* Вкладка 3: Вибіркові дисципліни */}
      {activeTab === 'electives' && (
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Мої вибіркові дисципліни</Text>
          {electives.map((el) => (
            <View key={el.id} style={styles.examCard}>
              <View style={styles.examTopRow}>
                <Text style={styles.codeText}>{el.code}</Text>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>{el.status}</Text>
                </View>
              </View>
              <Text style={styles.examSubject}>{el.title}</Text>
              <Text style={styles.examMeta}>🏛 {el.department}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Вкладка 4: Дипломна робота */}
      {activeTab === 'qualification' && (
        <View style={styles.section}>
          <View style={styles.examCard}>
            <View style={styles.examTopRow}>
              <Text style={styles.codeText}>Бакалаврська робота</Text>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>Затверджено</Text>
              </View>
            </View>
            <Text style={styles.examSubject}>{qualification.topic}</Text>
            <Text style={styles.examMeta}>👨‍🏫 Науковий керівник: {qualification.supervisor}</Text>
            <Text style={styles.examMeta}>📅 Захист: {qualification.defenseDate}</Text>
          </View>
        </View>
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
    marginBottom: 12,
  },
  tabScroll: {
    marginHorizontal: -4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#0284c7',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  section: {
    gap: 12,
  },
  statusBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  examCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  examTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  examBadge: {
    backgroundColor: '#ec489922',
    borderColor: '#ec4899',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  examBadgeText: {
    color: '#f472b6',
    fontSize: 11,
    fontWeight: '700',
  },
  codeText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  pointsBadge: {
    backgroundColor: '#10b98122',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pointsText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  examSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  examMeta: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 4,
  },
});
