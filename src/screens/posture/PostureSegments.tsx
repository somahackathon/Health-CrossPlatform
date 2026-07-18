import { StyleSheet, Text, View } from 'react-native';

import Icon from '../../components/Icon';
import { getSegments } from '../../lib/postureMock';
import { colors, radius } from '../../theme/colors';

export default function PostureSegments() {
  const segments = getSegments();
  return (
    <View>
      <Text style={styles.title}>구간별 피드백</Text>
      <View style={{ gap: 10 }}>
        {segments.map((sg) => (
          <View key={sg.t} style={styles.row}>
            <View style={styles.timeColumn}>
              <Text style={styles.time}>{sg.t}</Text>
              <View style={[styles.iconBadge, { backgroundColor: sg.bg }]}>
                <Icon name={sg.icon} size={16} color={sg.fg} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: sg.fg }]}>{sg.label}</Text>
              <Text style={styles.text}>{sg.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', color: colors.labelNormal, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.lineNormal,
  },
  timeColumn: { alignItems: 'center', gap: 4 },
  time: { fontSize: 12, fontWeight: '700', color: colors.labelAlternative },
  iconBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  text: { fontSize: 13, fontWeight: '500', color: colors.labelNeutral, lineHeight: 18 },
});
