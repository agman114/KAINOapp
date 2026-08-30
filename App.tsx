import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { StudentProfile, DaySchedule } from './src/types/kai';
import { KaiService } from './src/services/kaiService';
import { StorageService } from './src/services/storage';
import { NotificationService } from './src/services/notificationService';
import { LoginScreen } from './src/screens/LoginScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { SessionScreen } from './src/screens/SessionScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type Tab = 'schedule' | 'session' | 'profile' | 'settings';
const ONE_HOUR_MS = 60 * 60 * 1000;

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [loading, setLoading] = useState(true);

  const performAutoSync = async (notifyUser: boolean = false) => {
    try {
      console.log('[APP AUTO-SYNC] Triggering automated background sync...');
      const freshData = await KaiService.autoSyncSchedule();
      if (freshData) {
        setStudent(freshData.profile);
        setSchedule(freshData.schedule);
        if (notifyUser) {
          NotificationService.sendNotification(
            'Оновлення розкладу 🔔',
            'Розклад занять з cabinet.kai.edu.ua успішно оновлено!'
          );
        }
      }
    } catch (e) {
      console.log('[APP AUTO-SYNC INFO]:', e);
    }
  };

  useEffect(() => {
    async function initApp() {
      try {
        await NotificationService.requestPermission();
        
        // 1. Мгновенная загрузка кэшированного расписания из незгораемой памяти
        const storedProfile = await StorageService.getStudentProfile();
        const storedSchedule = await StorageService.getSchedule();
        
        setStudent(storedProfile);
        setSchedule(storedSchedule);

        // 2. АВТО-ЗАГРУЗКА ПРИ КАЖДОМ ВХОДЕ В ПРИЛОЖЕНИЕ
        if (storedProfile && storedProfile.isAuthenticated) {
          performAutoSync(false);
        }
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setLoading(false);
      }
    }

    initApp();

    // 3. АВТОМАТИЧЕСКАЯ ФОНОВАЯ СИНХРОНИЗАЦИЯ РАЗ В ЧАС (60 минут)
    const hourlyInterval = setInterval(() => {
      console.log('[APP HOURLY TIMER] Running 1-hour periodic schedule sync...');
      performAutoSync(true);
    }, ONE_HOUR_MS);

    return () => clearInterval(hourlyInterval);
  }, []);

  const handleLoginSuccess = async (profile: StudentProfile, liveSchedule: DaySchedule[]) => {
    setStudent(profile);
    setSchedule(liveSchedule);
  };

  const handleLogout = async () => {
    await StorageService.clearAll();
    setStudent(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>🎓</Text>
        <Text style={styles.loadingText}>Завантаження KAINOapp...</Text>
      </View>
    );
  }

  if (!student || !student.isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <View style={styles.mainContent}>
        {activeTab === 'schedule' && (
          <ScheduleScreen
            schedule={schedule}
            student={student}
            onUpdateSchedule={(p, s) => {
              setStudent(p);
              setSchedule(s);
            }}
          />
        )}
        {activeTab === 'session' && <SessionScreen />}
        {activeTab === 'profile' && (
          <ProfileScreen student={student} onLogout={handleLogout} />
        )}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Навигационная панель */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'schedule' && styles.navItemActive]}
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={[styles.navLabel, activeTab === 'schedule' && styles.navLabelActive]}>
            Розклад
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'session' && styles.navItemActive]}
          onPress={() => setActiveTab('session')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={[styles.navLabel, activeTab === 'session' && styles.navLabelActive]}>
            Сесія
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>
            Профіль
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={[styles.navLabel, activeTab === 'settings' && styles.navLabelActive]}>
            Налаштування
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});
