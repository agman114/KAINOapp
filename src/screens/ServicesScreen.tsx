import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { BypassSheetItem } from '../types/kai';

export const ServicesScreen: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'bypass' | 'poll' | 'finance'>('bypass');

  const bypassItems: BypassSheetItem[] = [
    { department: 'Бібліотека КАІ', status: 'Підтверджено', date: '01.09.2025' },
    { department: 'Студентське містечко / Гуртожиток', status: 'Підтверджено', date: '01.09.2025' },
    { department: 'Бухгалтерія (Фінансовий відділ)', status: 'Підтверджено', date: '01.09.2025' },
    { department: 'Військово-мобілізаційний відділ', status: 'В очікуванні' },
    { department: 'Деканат комп\'ютерних систем', status: 'В очікуванні' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <Text style={styles.groupBadge}>Сервіси здобувача</Text>
        <Text style={styles.headerTitle}>Студентські сервіси</Text>

        {/* Переключатель подвкладок */}
        <View style={styles.subTabRow}>
          <TouchableOpacity
            style={[styles.subTabBtn, activeSubTab === 'bypass' && styles.subTabBtnActive]}
            onPress={() => setActiveSubTab('bypass')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'bypass' && styles.subTabTextActive]}>
              📋 Обхідний лист
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeSubTab === 'poll' && styles.subTabBtnActive]}
            onPress={() => setActiveSubTab('poll')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'poll' && styles.subTabTextActive]}>
              ✍️ Опитування
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeSubTab === 'finance' && styles.subTabBtnActive]}
            onPress={() => setActiveSubTab('finance')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'finance' && styles.subTabTextActive]}>
              💳 Фінанси
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Подвкладка 1: Обхідний лист */}
      {activeSubTab === 'bypass' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статус обхідного листа</Text>
          {bypassItems.map((item, idx) => {
            const isDone = item.status === 'Підтверджено';
            return (
              <View key={idx} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.deptName}>{item.department}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: isDone ? '#10b98122' : '#f59e0b22', borderColor: isDone ? '#10b981' : '#f59e0b' }]}>
                    <Text style={[styles.statusBadgeText, { color: isDone ? '#34d399' : '#fbbf24' }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                {item.date && <Text style={styles.cardDate}>Підтверджено: {item.date}</Text>}
              </View>
            );
          })}
        </View>
      )}

      {/* Подвкладка 2: Опитування */}
      {activeSubTab === 'poll' && (
        <View style={styles.section}>
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>✍️</Text>
            <Text style={styles.emptyTitle}>Активних опитувань немає</Text>
            <Text style={styles.emptySubtitle}>
              Опитування якості викладання та освітнього процесу від університету з'являться тут під час анкетування.
            </Text>
          </View>
        </View>
      )}

      {/* Подвкладка 3: Фінанси */}
      {activeSubTab === 'finance' && (
        <View style={styles.section}>
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>Фінансові документи</Text>
            <Text style={styles.emptySubtitle}>
              Інформація про оплату навчання та контракти завантажується з фінансового відділу КАІ.
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
    marginBottom: 16,
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabBtnActive: {
    backgroundColor: '#0284c7',
  },
  subTabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  subTabTextActive: {
    color: '#ffffff',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deptName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
    paddingRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  emptyBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
