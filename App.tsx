import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { StudentProfile, DaySchedule } from './src/types/kai';
import { KaiService } from './src/services/kaiService';
import { StorageService } from './src/services/storage';
import { NotificationService } from './src/services/notificationService';
import { UpdateService, UpdateInfo } from './src/services/updateService';
import { LoginScreen } from './src/screens/LoginScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { SessionScreen } from './src/screens/SessionScreen';
import { ServicesScreen } from './src/screens/ServicesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

type Tab = 'schedule' | 'session' | 'services' | 'profile';
const ONE_HOUR_MS = 60 * 60 * 1000;

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [loading, setLoading] = useState(true);

  // Состояние обновления приложения
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);

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

  const checkAppUpdate = async () => {
    const info = await UpdateService.checkForUpdates();
    if (info && info.updateAvailable) {
      setUpdateInfo(info);
    }
  };

  const handleApplyUpdate = async () => {
    if (!updateInfo) return;
    setUpdating(true);
    try {
      await UpdateService.performUpdate(updateInfo);
    } catch (e: any) {
      Alert.alert('Помилка оновлення', e.message || 'Не вдалося завантажити оновлення');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    async function initApp() {
      try {
        await NotificationService.requestPermission();
        
        const storedProfile = await StorageService.getStudentProfile();
        const storedSchedule = await StorageService.getSchedule();
        
        setStudent(storedProfile);
        setSchedule(storedSchedule);

        if (storedProfile && storedProfile.isAuthenticated) {
          performAutoSync(false);
        }

        checkAppUpdate();
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setLoading(false);
      }
    }

    initApp();

    const hourlyInterval = setInterval(() => {
      console.log('[APP HOURLY TIMER] Running 1-hour periodic schedule sync & update check...');
      performAutoSync(true);
      checkAppUpdate();
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
      
      {/* Баннер доступности нового обновления с GitHub */}
      {updateInfo && updateInfo.updateAvailable && (
        <View style={styles.updateBanner}>
          <View style={styles.updateBannerTextCol}>
            <Text style={styles.updateBannerTitle}>✨ Доступна версія v{updateInfo.latestVersion}!</Text>
            <Text style={styles.updateBannerSubtitle}>
              Нове оновлення з покращеннями розкладу.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.updateBannerBtn}
            onPress={handleApplyUpdate}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.updateBannerBtnText}>⚡ Оновити в 1 клік</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

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
        {activeTab === 'services' && <ServicesScreen />}
        {activeTab === 'profile' && (
          <ProfileScreen student={student} onLogout={handleLogout} />
        )}
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
            Навчання
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'services' && styles.navItemActive]}
          onPress={() => setActiveTab('services')}
        >
          <Text style={styles.navIcon}>🛠</Text>
          <Text style={[styles.navLabel, activeTab === 'services' && styles.navLabelActive]}>
            Сервіси
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
  updateBanner: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateBannerTextCol: {
    flex: 1,
    marginRight: 10,
  },
  updateBannerTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  updateBannerSubtitle: {
    color: '#e0f2fe',
    fontSize: 11,
    marginTop: 2,
  },
  updateBannerBtn: {
    backgroundColor: '#0369a1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  updateBannerBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});
