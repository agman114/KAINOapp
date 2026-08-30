import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { KaiService } from '../services/kaiService';
import { StudentProfile, DaySchedule } from '../types/kai';

interface Props {
  onLoginSuccess: (profile: StudentProfile, schedule: DaySchedule[]) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Увага', 'Будь ласка, введіть ваші реальні логін та пароль від cabinet.kai.edu.ua!');
      return;
    }

    setLoading(true);
    try {
      const { profile, schedule } = await KaiService.login(username, password);
      onLoginSuccess(profile, schedule);
    } catch (e) {
      Alert.alert('Помилка', 'Не вдалося підключитися до cabinet.kai.edu.ua. Перевірте логін та пароль.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const { profile, schedule } = await KaiService.login('Чередніченко Данило', 'demo');
    setLoading(false);
    onLoginSuccess(profile, schedule);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTitle}>DIGITAL UNIVERSITY</Text>
          <Text style={styles.logoSubTitle}>Живий вхід у кабінет КАИ (kai.edu.ua)</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Логін або Email від cabinet.kai.edu.ua</Text>
          <TextInput
            style={styles.input}
            placeholder="Логін від кабінету КАИ..."
            placeholderTextColor="#64748b"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Пароль</Text>
          <TextInput
            style={styles.input}
            placeholder="Ваш пароль..."
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>🔑 Завантажити моє живильне расписание</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
          <Text style={styles.demoButtonText}>⚡ Ознайомчий Демо-режим</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          🔒 Пряме з'єднання з cabinet.kai.edu.ua. Паролі нікуди не передаються і зберігаються локально.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1.5,
  },
  logoSubTitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8fafc',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  loginButton: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  demoButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  demoButtonText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});
