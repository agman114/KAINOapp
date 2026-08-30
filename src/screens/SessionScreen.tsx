import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MOCK_EXAMS } from '../services/mockData';

export const SessionScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Сесія та Успішність</Text>
        <Text style={styles.subtitle}>Результати іспитів, заліків та розклад підсумкового контролю</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>91.6</Text>
          <Text style={styles.statLabel}>Середній бал</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3 / 3</Text>
          <Text style={styles.statLabel}>Складено предметів</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>Стипендія</Text>
          <Text style={styles.statLabel}>Підвищена</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Розклад екзаменів та заліків</Text>

      {MOCK_EXAMS.map(exam => (
        <View key={exam.id} style={styles.examCard}>
          <View style={styles.examHeader}>
            <View style={[styles.badge, exam.type === 'Екзамен' ? styles.examBadge : styles.passBadge]}>
              <Text style={styles.badgeText}>{exam.type}</Text>
            </View>
            <Text style={styles.dateText}>📅 {exam.date} о {exam.time}</Text>
          </View>

          <Text style={styles.subjectText}>{exam.subject}</Text>

          <Text style={styles.metaText}>👨‍🏫 {exam.teacher}</Text>
          <Text style={styles.metaText}>📍 Ауд. {exam.room}</Text>

          {exam.grade && (
            <View style={styles.gradeBox}>
              <Text style={styles.gradeLabel}>Результат:</Text>
              <Text style={styles.gradeValue}>{exam.grade}</Text>
            </View>
          )}
        </View>
      ))}
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38bdf8',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#334155',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  examCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  examBadge: {
    backgroundColor: '#ef444422',
  },
  passBadge: {
    backgroundColor: '#10b98122',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f8fafc',
  },
  dateText: {
    fontSize: 12,
    color: '#a5b4fc',
    fontWeight: '600',
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 4,
  },
  gradeBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34d399',
  },
});
