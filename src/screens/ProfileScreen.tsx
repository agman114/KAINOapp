import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StudentProfile } from '../types/kai';

interface Props {
  student: StudentProfile;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ student, onLogout }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {student.photoUrl ? (
            <Image source={{ uri: student.photoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {student.fullName ? student.fullName.charAt(0) : '🎓'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.studentName}>{student.fullName || 'Чередніченко Данило Андрійович'}</Text>
        <View style={styles.groupBadge}>
          <Text style={styles.groupBadgeText}>{student.groupName || 'Б-F7-26-1-КС'}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>🚪 Вийти з акаунту</Text>
        </TouchableOpacity>
      </View>

      {/* Особиста інформація здобувача */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>👤 Особиста інформація</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Факультет / Інститут:</Text>
          <Text style={styles.infoValue}>{student.faculty || 'Факультет комп\'ютерних систем'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Спеціальність:</Text>
          <Text style={styles.infoValue}>{student.specialty || '121 Інженерія програмного забезпечення'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Курс навчання:</Text>
          <Text style={styles.infoValue}>{student.course || 2} курс</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Форма навчання:</Text>
          <Text style={styles.infoValue}>{student.educationForm || 'Денна'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Статус акаунту:</Text>
          <Text style={styles.activeStatusText}>● Авторизований в cabinet.kai.edu.ua</Text>
        </View>
      </View>

      {/* Безопасность и Диск */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🔒 Безпека та Збереження</Text>
        <Text style={styles.securityDesc}>
          Ваші персональні дані та паролі проходять локальну авто-синхронізацію та зберігаються в незгораемому зашифрованому сховищі вашого пристрою.
        </Text>
      </View>
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
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#38bdf8',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: '800',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  groupBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 16,
  },
  groupBadgeText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoutButton: {
    backgroundColor: '#ef444422',
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '600',
  },
  activeStatusText: {
    fontSize: 14,
    color: '#34d399',
    fontWeight: '700',
  },
  securityDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
});
