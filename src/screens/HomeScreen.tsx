import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SegmentedControl from '../components/SegmentedControl';
import { usePapsEvents } from '../hooks/usePapsEvents';
import { GRADE_TEXT, overallGrade } from '../lib/paps';
import { RootTabParamList } from '../navigation/RootNavigator';
import { usePapsStore } from '../store/usePapsStore';
import { useUiStore } from '../store/useUiStore';
import { colors, gradeColor, withAlpha } from '../theme/colors';
import HomeLayoutA from './home/HomeLayoutA';
import HomeLayoutB from './home/HomeLayoutB';
import HomeLayoutC from './home/HomeLayoutC';

const HOME_LAYOUT_ITEMS = [
  { label: '스택', value: 'a' },
  { label: '히어로', value: 'b' },
  { label: '대시보드', value: 'c' },
];

export type Shortcut = {
  key: string;
  title: string;
  desc: string;
  icon: string;
  fg: string;
  bg: string;
  onGo: () => void;
};

export default function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const homeLayout = useUiStore((s) => s.homeLayout);
  const setHomeLayout = useUiStore((s) => s.setHomeLayout);

  const testItems = usePapsStore((s) => s.orderedTestItems);
  const records = usePapsStore((s) => s.records);
  const loadReference = usePapsStore((s) => s.loadReference);
  const loadRecords = usePapsStore((s) => s.loadRecords);
  const papsEvents = usePapsEvents();

  useEffect(() => {
    if (testItems.length === 0) loadReference();
    loadRecords();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const overall = overallGrade(records.map((r) => r.grade));
  const overallFg = overall ? gradeColor(overall).fg : colors.labelAssistive;
  const overallText = overall ? GRADE_TEXT[overall] : '측정 기록이 없어요';
  const measuredDate = latestMeasuredDate(records);

  const shortcuts: Shortcut[] = [
    {
      key: 'plan',
      title: 'AI 맞춤 계획표',
      desc: '주간 운동 계획 확인하기',
      icon: 'sparkle-fill',
      fg: colors.accentForegroundViolet,
      bg: withAlpha(colors.accentForegroundViolet, 0.12),
      onGo: () => navigation.navigate('Plan'),
    },
    {
      key: 'posture',
      title: 'AI 자세교정',
      desc: '카메라로 자세 분석받기',
      icon: 'camera-fill',
      fg: colors.accentForegroundCyan,
      bg: withAlpha(colors.accentForegroundCyan, 0.14),
      onGo: () => navigation.navigate('Posture'),
    },
  ];

  const goInput = () => navigation.navigate('Input');

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>체력관리 코치</Text>
          <Text style={styles.greeting}>오늘도 힘내요</Text>
        </View>

        <View style={styles.segmentWrap}>
          <SegmentedControl items={HOME_LAYOUT_ITEMS} value={homeLayout} onChange={(v) => setHomeLayout(v as 'a' | 'b' | 'c')} />
        </View>

        {homeLayout === 'a' && (
          <HomeLayoutA
            overall={overall}
            overallFg={overallFg}
            overallText={overallText}
            measuredDate={measuredDate}
            papsEvents={papsEvents}
            shortcuts={shortcuts}
            goInput={goInput}
          />
        )}
        {homeLayout === 'b' && (
          <HomeLayoutB
            overall={overall}
            overallFg={overallFg}
            overallText={overallText}
            measuredDate={measuredDate}
            papsEvents={papsEvents}
            shortcuts={shortcuts}
            goInput={goInput}
          />
        )}
        {homeLayout === 'c' && (
          <HomeLayoutC
            overall={overall}
            overallFg={overallFg}
            overallText={overallText}
            measuredDate={measuredDate}
            papsEvents={papsEvents}
            shortcuts={shortcuts}
            goInput={goInput}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function latestMeasuredDate(records: { measuredAt: string }[]): string {
  if (records.length === 0) return '기록 없음';
  const latest = records.reduce((a, b) => (a.measuredAt > b.measuredAt ? a : b));
  return latest.measuredAt.slice(0, 10).replace(/-/g, '.');
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundAlternative },
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8 },
  eyebrow: { fontSize: 13, fontWeight: '600', color: colors.labelAlternative },
  greeting: { fontSize: 23, fontWeight: '700', color: colors.labelNormal, marginTop: 2 },
  segmentWrap: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4 },
});
