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
import { StudentProfile, DaySchedule, ERROR_CODES } from '../types/kai';

interface Props {
  onLoginSuccess: (profile: StudentProfile, schedule: DaySchedule[]) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!username.trim() || !password.trim()) {
      setErrorMessage('[ERR-101] Будь ласка, введіть ваші логін та пароль від cabinet.kai.edu.ua!');
      return;
    }

    setLoading(true);
    try {
      const { profile, schedule } = await KaiService.login(username, password);
      onLoginSuccess(profile, schedule);
    } catch (e: any) {
      const errText = e.message || ERROR_CODES.ERR_101;
      setErrorMessage(errText);
      Alert.alert('Помилка авторизації', errText);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const { profile, schedule } = await KaiService.login('Чередніченко Данило', 'demo');
      onLoginSuccess(profile, schedule);
    } catch (e: any) {
      setErrorMessage(e.message || ERROR_CODES.ERR_101);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTitle}>DIGITAL UNIVERSITY</Text>
          <Text style={styles.logoSubTitle}>Живий вхід у кабінет КАИ (kai.edu.ua)</Text>
        </View>

        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

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
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.disabledBtn]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginBtnText}>Авторизуватися та вигрузити розклад</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.demoBtn}
          onPress={handleDemoLogin}
          disabled={loading}
        >
          <Text style={styles.demoBtnText}>🚀 Демо-режим (Б-F7-26-1-КС)</Text>
        </TouchableOpacity>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            🔒 Дані передаються напряму на cabinet.kai.edu.ua через локальний захищений SSL запит.
          </Text>
        </View>
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
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoTitle: {
    color: '#38bdf8',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  logoSubTitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  demoBtn: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  demoBtnText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
  },
  noticeBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  noticeText: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
