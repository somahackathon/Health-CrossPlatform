import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '../../components/Button';
import CircularProgress from '../../components/CircularProgress';
import Icon from '../../components/Icon';
import { PapsEventVM } from '../../hooks/usePapsEvents';
import { colors, radius, withAlpha } from '../../theme/colors';
import { Shortcut } from '../HomeScreen';

type Props = {
  overall: number;
  overallFg: string;
  overallText: string;
  measuredDate: string;
  papsEvents: PapsEventVM[];
  shortcuts: Shortcut[];
  goInput: () => void;
};

export default function HomeLayoutB({ overall, overallFg, overallText, measuredDate, papsEvents, shortcuts, goInput }: Props) {
  return (
    <View style={{ paddingBottom: 24 }}>
      <View style={[styles.hero, { backgroundColor: withAlpha(colors.primaryNormal, 0.08) }]}>
        <CircularProgress size={132} strokeWidth={10} progress={1 - (overall - 1) / 5} color={overallFg}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.heroGrade, { color: overallFg }]}>{overall}</Text>
            <Text style={styles.heroLabel}>종합 등급</Text>
          </View>
        </CircularProgress>
        <Text style={styles.heroTitle}>{`지금 체력은 '${overallText}'`}</Text>
        <Text style={styles.heroCaption}>최근 측정 {measuredDate} · 5개 종목</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row} contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}>
        {papsEvents.map((ev) => (
          <View key={ev.id} style={styles.eventCard}>
            <View style={[styles.gradeBadge, { backgroundColor: ev.bg }]}>
              <Text style={[styles.gradeBadgeText, { color: ev.fg }]}>{ev.grade}등급</Text>
            </View>
            <Text style={styles.eventName} numberOfLines={2}>
              {ev.name}
            </Text>
            <Text style={styles.eventValue}>
              {ev.value}
              <Text style={styles.eventUnit}>{ev.unit}</Text>
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.shortcutRow}>
        {shortcuts.map((sc) => (
          <Pressable key={sc.key} style={[styles.shortcutCard, { backgroundColor: sc.bg }]} onPress={sc.onGo}>
            <Icon name={sc.icon} size={26} color={sc.fg} />
            <Text style={styles.shortcutTitle}>{sc.title}</Text>
            <Text style={styles.shortcutDesc}>{sc.desc}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <Button title="기록 입력하기" onPress={goInput} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 20,
    paddingVertical: 26,
    paddingHorizontal: 20,
    borderRadius: radius.cardXLarge + 4,
    alignItems: 'center',
  },
  heroGrade: { fontSize: 46, fontWeight: '800' },
  heroLabel: { fontSize: 12, fontWeight: '600', color: colors.labelAlternative, marginTop: 2 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: colors.labelNormal, marginTop: 14 },
  heroCaption: { fontSize: 13, fontWeight: '500', color: colors.labelAlternative, marginTop: 4 },
  row: { marginTop: 16 },
  eventCard: {
    width: 118,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.backgroundElevated,
  },
  gradeBadge: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 7, borderRadius: 6, marginBottom: 10 },
  gradeBadgeText: { fontSize: 11, fontWeight: '600' },
  eventName: { fontSize: 12, fontWeight: '600', color: colors.labelNeutral, height: 32 },
  eventValue: { fontSize: 20, fontWeight: '700', color: colors.labelNormal, marginTop: 6 },
  eventUnit: { fontSize: 12, fontWeight: '600', color: colors.labelAlternative },
  shortcutRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 12 },
  shortcutCard: { flex: 1, padding: 16, borderRadius: radius.cardXLarge },
  shortcutTitle: { fontSize: 14, fontWeight: '700', color: colors.labelNormal, marginTop: 12 },
  shortcutDesc: { fontSize: 12, fontWeight: '500', color: colors.labelAlternative, marginTop: 2 },
});
