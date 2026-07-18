import { Pressable, StyleSheet, Text, View } from 'react-native';

import Icon from '../../components/Icon';
import { PapsEventVM } from '../../hooks/usePapsEvents';
import { colors, radius } from '../../theme/colors';
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

export default function HomeLayoutC({ overall, overallFg, overallText, measuredDate, papsEvents, shortcuts, goInput }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={[styles.overallCard, { backgroundColor: overallFg }]}>
          <View style={styles.overallBadge}>
            <Text style={styles.overallGrade}>{overall}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.overallEyebrow}>종합 체력 등급</Text>
            <Text style={styles.overallTitle}>{overallText}</Text>
          </View>
          <Text style={styles.overallCaption}>
            최근{'\n'}
            {measuredDate}
          </Text>
        </View>

        {papsEvents.map((ev) => (
          <View key={ev.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventCat}>{ev.cat}</Text>
              <View style={[styles.gradeChip, { backgroundColor: ev.bg }]}>
                <Text style={[styles.gradeChipText, { color: ev.fg }]}>{ev.grade}</Text>
              </View>
            </View>
            <Text style={styles.eventName} numberOfLines={2}>
              {ev.name}
            </Text>
            <Text style={styles.eventValue}>
              {ev.value}
              <Text style={styles.eventUnit}> {ev.unit}</Text>
            </Text>
          </View>
        ))}

        <Pressable style={styles.addTile} onPress={goInput}>
          <Icon name="circle-plus" size={26} color={colors.primaryNormal} />
          <Text style={styles.addTitle}>기록 추가</Text>
          <Text style={styles.addDesc}>종목 입력하기</Text>
        </Pressable>
      </View>

      <View style={{ gap: 10, marginTop: 16 }}>
        {shortcuts.map((sc) => (
          <Pressable key={sc.key} style={styles.shortcutRow} onPress={sc.onGo}>
            <Icon name={sc.icon} size={22} color={sc.fg} />
            <Text style={styles.shortcutTitle}>{sc.title}</Text>
            <Icon name="chevron-right" size={18} color={colors.labelAssistive} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  overallCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    paddingHorizontal: 18,
    borderRadius: radius.cardLarge,
  },
  overallBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallGrade: { fontSize: 26, fontWeight: '800', color: '#fff' },
  overallEyebrow: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  overallTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 2 },
  overallCaption: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.8)', textAlign: 'right' },
  eventCard: {
    width: '47.5%',
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.backgroundElevated,
  },
  eventHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  eventCat: { fontSize: 11, fontWeight: '600', color: colors.labelAssistive },
  gradeChip: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeChipText: { fontSize: 11, fontWeight: '700' },
  eventName: { fontSize: 12, fontWeight: '600', color: colors.labelNeutral, minHeight: 31 },
  eventValue: { fontSize: 19, fontWeight: '700', color: colors.labelNormal, marginTop: 4 },
  eventUnit: { fontSize: 11, fontWeight: '600', color: colors.labelAlternative },
  addTile: {
    width: '47.5%',
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.fillNormal,
    justifyContent: 'center',
  },
  addTitle: { fontSize: 13, fontWeight: '700', color: colors.labelNormal, marginTop: 8 },
  addDesc: { fontSize: 11, fontWeight: '500', color: colors.labelAlternative },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lineNormal,
  },
  shortcutTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.labelNormal },
});
