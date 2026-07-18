import { Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '../../components/Button';
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

export default function HomeLayoutA({ overall, overallFg, overallText, measuredDate, papsEvents, shortcuts, goInput }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.overallCard, { backgroundColor: withAlpha(colors.primaryNormal, 0.06) }]}>
        <View style={[styles.overallCircle, { borderColor: overallFg }]}>
          <Text style={[styles.overallGrade, { color: overallFg }]}>{overall}</Text>
          <Text style={styles.overallLabel}>등급</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardEyebrow}>종합 체력 등급</Text>
          <Text style={styles.cardTitle}>{overallText}</Text>
          <Text style={styles.cardCaption}>최근 측정 {measuredDate}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>최근 PAPS 기록</Text>
          <Text style={styles.panelAction} onPress={goInput}>
            전체보기
          </Text>
        </View>
        {papsEvents.map((ev) => (
          <View key={ev.id} style={styles.eventRow}>
            <View style={[styles.dot, { backgroundColor: ev.fg }]} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.eventName} numberOfLines={1}>
                {ev.name}
              </Text>
              <Text style={styles.eventCat}>{ev.cat}</Text>
            </View>
            <Text style={styles.eventValue}>
              {ev.value}
              {ev.unit}
            </Text>
            <View style={[styles.gradeBadge, { backgroundColor: ev.bg }]}>
              <Text style={[styles.gradeBadgeText, { color: ev.fg }]}>{ev.grade}등급</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ gap: 12 }}>
        {shortcuts.map((sc) => (
          <Pressable key={sc.key} style={styles.shortcutRow} onPress={sc.onGo}>
            <View style={[styles.shortcutIcon, { backgroundColor: sc.bg }]}>
              <Icon name={sc.icon} size={24} color={sc.fg} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.shortcutTitle}>{sc.title}</Text>
              <Text style={styles.shortcutDesc}>{sc.desc}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.labelAssistive} />
          </Pressable>
        ))}
      </View>

      <Button title="기록 입력하기" onPress={goInput} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 14 },
  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    padding: 20,
    borderRadius: radius.cardXLarge,
  },
  overallCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    backgroundColor: colors.backgroundNormal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallGrade: { fontSize: 30, fontWeight: '800' },
  overallLabel: { fontSize: 11, fontWeight: '600', color: colors.labelAlternative, marginTop: 2 },
  cardEyebrow: { fontSize: 13, fontWeight: '600', color: colors.labelAlternative },
  cardTitle: { fontSize: 20, fontWeight: '700', color: colors.labelNormal, marginTop: 2 },
  cardCaption: { fontSize: 12, fontWeight: '500', color: colors.labelAssistive, marginTop: 4 },
  panel: {
    padding: 18,
    borderRadius: radius.cardLarge,
    backgroundColor: colors.backgroundElevated,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  panelTitle: { fontSize: 16, fontWeight: '700', color: colors.labelNormal },
  panelAction: { fontSize: 12, fontWeight: '600', color: colors.primaryNormal },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  eventName: { fontSize: 14, fontWeight: '600', color: colors.labelNormal },
  eventCat: { fontSize: 12, fontWeight: '500', color: colors.labelAssistive },
  eventValue: { fontSize: 13, fontWeight: '600', color: colors.labelNeutral },
  gradeBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 7 },
  gradeBadgeText: { fontSize: 12, fontWeight: '700' },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: radius.cardXLarge,
    backgroundColor: colors.backgroundElevated,
  },
  shortcutIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shortcutTitle: { fontSize: 15, fontWeight: '700', color: colors.labelNormal },
  shortcutDesc: { fontSize: 13, fontWeight: '500', color: colors.labelAlternative, marginTop: 2 },
});
