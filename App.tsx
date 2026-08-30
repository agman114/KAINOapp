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

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initApp() {
      try {
        await NotificationService.requestPermission();
        const storedProfile = await StorageService.getStudentProfile();
        const storedSchedule = await KaiService.loadSchedule();
        setStudent(storedProfile);
        setSchedule(storedSchedule);
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setLoading(false);
      }
    }
    initApp();
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
      
      <View style={styles.mainContainer}>
        {/* Main Active Screen */}
        <View style={styles.screenContainer}>
          {activeTab === 'schedule' && (
            <ScheduleScreen
              schedule={schedule}
              student={student}
              onUpdateSchedule={(newProfile, newSchedule) => {
                setStudent(newProfile);
                setSchedule(newSchedule);
              }}
            />
          )}
          {activeTab === 'session' && <SessionScreen />}
          {activeTab === 'profile' && <ProfileScreen student={student} />}
          {activeTab === 'settings' && <SettingsScreen onLogout={handleLogout} />}
        </View>

        {/* Bottom Tab Bar (Responsive PC & Mobile) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'schedule' && styles.tabItemActive]}
            onPress={() => setActiveTab('schedule')}
          >
            <Text style={styles.tabIcon}>📅</Text>
            <Text style={[styles.tabLabel, activeTab === 'schedule' && styles.tabLabelActive]}>
              Розклад
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'session' && styles.tabItemActive]}
            onPress={() => setActiveTab('session')}
          >
            <Text style={styles.tabIcon}>📊</Text>
            <Text style={[styles.tabLabel, activeTab === 'session' && styles.tabLabelActive]}>
              Сесія
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={styles.tabIcon}>👤</Text>
            <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
              Профіль
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'settings' && styles.tabItemActive]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={styles.tabIcon}>⚙️</Text>
            <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>
              Налаштування
            </Text>
          </TouchableOpacity>
        </View>
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
  loadingText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  mainContainer: {
    flex: 1,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#0f172a',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: '#0369a122',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});
