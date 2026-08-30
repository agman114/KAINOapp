import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ExamItem } from '../types/kai';

export const SessionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grades' | 'schedule'>('grades');
  const [loading, setLoading] = useState<boolean>(false);

  // Демонстрационные данные сессии при наличии опубликованных экзаменов
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <Text style={styles.groupBadge}>Б-F7-26-1-КС</Text>
        <Text style={styles.headerTitle}>Сесія та Оцінки</Text>
        <Text style={styles.headerSubtitle}>2024/2025 Навчальний рік • Зимова сесія</Text>

        {/* Переключатель вкладок "Оцінки" и "Розклад сесії" */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'grades' && styles.tabButtonActive]}
            onPress={() => setActiveTab('grades')}
          >
            <Text style={[styles.tabText, activeTab === 'grades' && styles.tabTextActive]}>
              📊 Оцінки та бали
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
        </View>
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

          {/* Пример отображения если оценки появятся */}
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

              {exam.grade && (
                <View style={styles.gradeBox}>
                  <Text style={styles.gradeLabel}>Оцінка: </Text>
                  <Text style={styles.gradeValue}>{exam.grade}</Text>
                </View>
              )}
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
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#0284c7',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 13,
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
    fontSize: 14,
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
  gradeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  gradeLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  gradeValue: {
    fontSize: 14,
    color: '#38bdf8',
    fontWeight: '700',
  },
});
