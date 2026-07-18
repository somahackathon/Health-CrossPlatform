import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Icon from '../components/Icon';
import { usePlanStore } from '../store/usePlanStore';
import { colors, radius, withAlpha } from '../theme/colors';

export default function PlanScreen() {
  const status = usePlanStore((s) => s.status);
  const summary = usePlanStore((s) => s.summary);
  const recommendations = usePlanStore((s) => s.recommendations);
  const errorMessage = usePlanStore((s) => s.errorMessage);
  const loadCached = usePlanStore((s) => s.loadCached);
  const requestAnalysis = usePlanStore((s) => s.requestAnalysis);

  useEffect(() => {
    loadCached();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isBusy = status === 'requesting' || status === 'polling';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.aiBadge, { backgroundColor: withAlpha(colors.accentForegroundViolet, 0.12) }]}>
            <Icon name="sparkle-fill" size={14} color={colors.accentForegroundViolet} />
            <Text style={[styles.aiBadgeText, { color: colors.accentForegroundViolet }]}>AI 맞춤 분석</Text>
          </View>
          <Text style={styles.title}>AI 체력 분석</Text>
        </View>

        {isBusy && (
          <View style={styles.analyzing}>
            <ActivityIndicator size="large" color={colors.primaryNormal} />
            <Text style={styles.analyzingTitle}>AI가 기록을 분석하고 있어요</Text>
            <Text style={styles.analyzingCaption}>보통 10~20초 정도 걸려요</Text>
          </View>
        )}

        {!isBusy && (
          <View style={styles.body}>
            {status === 'error' && errorMessage && (
              <View style={styles.errorCard}>
                <Icon name="triangle-exclamation" size={18} color={colors.accentForegroundRed} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {status === 'done' && summary && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>체력 상태 요약</Text>
                <Text style={styles.summaryText}>{summary}</Text>
              </View>
            )}

            {status === 'done' && recommendations && recommendations.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>운동 솔루션</Text>
                <View style={{ gap: 10 }}>
                  {recommendations.map((rec, i) => (
                    <View key={i} style={styles.recCard}>
                      <Text style={styles.recTitle}>{rec.title}</Text>
                      <Text style={styles.recDesc}>{rec.description}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {status === 'idle' && !errorMessage && (
              <Text style={styles.hintText}>PAPS 기록을 바탕으로 AI 체력 분석을 받아보세요</Text>
            )}

            <Button
              title={status === 'done' ? '다시 분석하기' : 'AI 분석 요청하기'}
              variant={status === 'done' ? 'outlined' : 'solid'}
              onPress={requestAnalysis}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNormal },
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 6 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    marginBottom: 8,
  },
  aiBadgeText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 23, fontWeight: '700', color: colors.labelNormal },
  analyzing: { paddingVertical: 70, paddingHorizontal: 30, alignItems: 'center' },
  analyzingTitle: { fontSize: 17, fontWeight: '700', color: colors.labelNormal, marginTop: 22 },
  analyzingCaption: { fontSize: 13, fontWeight: '500', color: colors.labelAlternative, marginTop: 6, textAlign: 'center', lineHeight: 19 },
  body: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, gap: 16 },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: withAlpha(colors.accentForegroundRed, 0.08),
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.labelNeutral, lineHeight: 19 },
  summaryCard: {
    padding: 18,
    borderRadius: radius.cardLarge,
    backgroundColor: withAlpha(colors.primaryNormal, 0.07),
  },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: colors.primaryNormal, marginBottom: 8 },
  summaryText: { fontSize: 15, fontWeight: '500', color: colors.labelNormal, lineHeight: 22 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.labelNormal, marginBottom: 12 },
  recCard: { padding: 16, borderRadius: radius.card, backgroundColor: colors.backgroundElevated, borderWidth: 1, borderColor: colors.lineNormal },
  recTitle: { fontSize: 14, fontWeight: '700', color: colors.labelNormal },
  recDesc: { fontSize: 13, fontWeight: '500', color: colors.labelAlternative, marginTop: 4, lineHeight: 19 },
  hintText: { fontSize: 13, fontWeight: '500', color: colors.labelAlternative, textAlign: 'center', paddingVertical: 20 },
});
