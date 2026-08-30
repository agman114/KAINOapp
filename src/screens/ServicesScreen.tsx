import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { PortalServicesData } from '../types/kai';

interface Props {
  servicesData?: PortalServicesData;
}

export const ServicesScreen: React.FC<Props> = ({ servicesData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'bypass' | 'poll' | 'electives' | 'qualification'>('bypass');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <Text style={styles.groupBadge}>Сервіси здобувача</Text>
        <Text style={styles.headerTitle}>Студентські сервіси</Text>

        {/* Переключатель подвкладок */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
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
              style={[styles.subTabBtn, activeSubTab === 'electives' && styles.subTabBtnActive]}
              onPress={() => setActiveSubTab('electives')}
            >
              <Text style={[styles.subTabText, activeSubTab === 'electives' && styles.subTabTextActive]}>
                📚 Вибіркові
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subTabBtn, activeSubTab === 'qualification' && styles.subTabBtnActive]}
              onPress={() => setActiveSubTab('qualification')}
            >
              <Text style={[styles.subTabText, activeSubTab === 'qualification' && styles.subTabTextActive]}>
                🎓 Кваліфікаційна
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
          </View>
        </ScrollView>
      </View>

      {/* Подвкладка 1: Обхідний лист */}
      {activeSubTab === 'bypass' && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.portalBadgeText}>ПОРТАЛ КАІ (НАЖИВО)</Text>
            <Text style={styles.cardTitle}>Обхідний лист</Text>
            <Text style={styles.cardContent}>
              {servicesData?.bypassText || 'Обхідний лист ще недоступний...'}
            </Text>
          </View>
        </View>
      )}

      {/* Подвкладка 2: Вибіркові дисципліни */}
      {activeSubTab === 'electives' && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.portalBadgeText}>ПОРТАЛ КАІ (НАЖИВО)</Text>
            <Text style={styles.cardTitle}>Вибіркові дисципліни</Text>
            <Text style={styles.cardContent}>
              {servicesData?.electiveText || 'Вибіркових дисциплін для вашої академічної групи не передбачено'}
            </Text>
          </View>
        </View>
      )}

      {/* Подвкладка 3: Кваліфікаційна робота */}
      {activeSubTab === 'qualification' && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.portalBadgeText}>ПОРТАЛ КАІ (НАЖИВО)</Text>
            <Text style={styles.cardTitle}>Кваліфікаційна робота</Text>
            <Text style={styles.cardContent}>
              {servicesData?.qualificationText || 'Кваліфікаційна робота ще не доступна...'}
            </Text>
          </View>
        </View>
      )}

      {/* Подвкладка 4: Опитування */}
      {activeSubTab === 'poll' && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.portalBadgeText}>ПОРТАЛ КАІ (НАЖИВО)</Text>
            <Text style={styles.cardTitle}>Опитування здобувачів</Text>
            <Text style={styles.cardContent}>
              {servicesData?.pollText || 'Опитування для вашої академічної групи відсутні'}
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
  tabScroll: {
    marginHorizontal: -4,
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  subTabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabBtnActive: {
    backgroundColor: '#0284c7',
  },
  subTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  subTabTextActive: {
    color: '#ffffff',
  },
  section: {
    gap: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  portalBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 10,
  },
  cardContent: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
});
