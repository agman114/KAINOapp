import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, Alert, Linking } from 'react-native';
import { StorageService } from '../services/storage';

interface Props {
  onLogout: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onLogout }) => {
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    StorageService.isNotificationsEnabled().then(setNotifications);
  }, []);

  const toggleNotifications = async (val: boolean) => {
    setNotifications(val);
    await StorageService.setNotificationsEnabled(val);
  };

  const handleClearCache = async () => {
    await StorageService.clearAll();
    Alert.alert('Успіх', 'Кеш расписания и данных успешно очищен!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Налаштування</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Сповіщення та Нагадування</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingTextGroup}>
            <Text style={styles.settingTitle}>Нагадування про пари</Text>
            <Text style={styles.settingSubtitle}>Сповіщати за 10 хвилин до початку заняття</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#334155', true: '#0284c7' }}
            thumbColor={notifications ? '#38bdf8' : '#94a3b8'}
          />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Дані та Офлайн-режим</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingTextGroup}>
            <Text style={styles.settingTitle}>Офлайн кэш</Text>
            <Text style={styles.settingSubtitle}>Розклад зберігається локально на ПК/телефоні</Text>
          </View>
          <Text style={styles.statusBadgeText}>Активно</Text>
        </View>

        <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
          <Text style={styles.actionTextWarning}>🗑 Очистити локальний кеш</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Інституційні ресурси КАИ</Text>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Linking.openURL('https://cabinet.kai.edu.ua/')}
        >
          <Text style={styles.actionText}>🌐 Офіційний кабінет КАИ (cabinet.kai.edu.ua)</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Вийти з акаунту</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>KAINOapp v1.0.0 • Для студентів КАИ (Код: Local-First)</Text>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadgeText: {
    color: '#34d399',
    fontWeight: '700',
    fontSize: 13,
  },
  actionRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginTop: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#38bdf8',
    fontWeight: '600',
  },
  actionTextWarning: {
    fontSize: 14,
    color: '#fb7185',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#be123c',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
  },
});
