import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { StudentProfile } from '../types/kai';
import { MOCK_FINANCIAL } from '../services/mockData';

interface Props {
  student: StudentProfile;
}

export const ProfileScreen: React.FC<Props> = ({ student }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'financial'>('info');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card Header matching KAI Screenshot */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <Text style={styles.studentName}>{student.fullName}</Text>
        <View style={styles.groupPill}>
          <Text style={styles.groupPillText}>{student.groupName}</Text>
        </View>
        <Text style={styles.facultyText}>{student.faculty}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'info' && styles.tabButtonActive]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
            Особиста інформація
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'financial' && styles.tabButtonActive]}
          onPress={() => setActiveTab('financial')}
        >
          <Text style={[styles.tabText, activeTab === 'financial' && styles.tabTextActive]}>
            Фінансові документи
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'info' ? (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Спеціальність</Text>
            <Text style={styles.infoValue}>{student.specialty}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Курс навчання</Text>
            <Text style={styles.infoValue}>{student.course} курс</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Форма навчання</Text>
            <Text style={styles.infoValue}>{student.educationForm}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Навчальний заклад</Text>
            <Text style={styles.infoValue}>Київський авіаційний інститут (КАИ)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Статус студента</Text>
            <Text style={[styles.infoValue, { color: '#34d399' }]}>Активний</Text>
          </View>
        </View>
      ) : (
        <View>
          {MOCK_FINANCIAL.map(fin => (
            <View key={fin.id} style={styles.finCard}>
              <View style={styles.finHeader}>
                <Text style={styles.finTitle}>{fin.title}</Text>
                <View style={styles.finStatusBadge}>
                  <Text style={styles.finStatusText}>{fin.status}</Text>
                </View>
              </View>
              <Text style={styles.finAmount}>{fin.amount}</Text>
              <Text style={styles.finDate}>Термін до: {fin.dueDate}</Text>
            </View>
          ))}
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
  profileHeaderCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#38bdf8',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  groupPill: {
    backgroundColor: '#0369a1',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  groupPillText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  facultyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
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
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
  },
  finCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  finHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  finTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
  },
  finStatusBadge: {
    backgroundColor: '#10b98122',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  finStatusText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  finAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#38bdf8',
    marginBottom: 4,
  },
  finDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
