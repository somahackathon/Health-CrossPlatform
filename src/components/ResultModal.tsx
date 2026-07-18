import { useEffect, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

import { GRADE_TEXT } from '../lib/paps';
import { SubmitResult } from '../store/usePapsStore';
import { colors, gradeColor, radius, withAlpha } from '../theme/colors';
import Button from './Button';
import Icon from './Icon';

type Props = {
  result: SubmitResult | null;
  onClose: () => void;
};

export default function ResultModal({ result, onClose }: Props) {
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [cardScale] = useState(() => new Animated.Value(0.92));
  const [cardOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!result) return;
    backdropOpacity.setValue(0);
    cardScale.setValue(0.92);
    cardOpacity.setValue(0);
    Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    Animated.timing(cardOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 6 }).start();
  }, [result, backdropOpacity, cardScale, cardOpacity]);

  if (!result) return null;
  const { fg, bg } = gradeColor(result.grade);
  const deltaGrade = result.prevGrade !== null ? result.prevGrade - result.grade : 0;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
          <View style={styles.center}>
            <View style={[styles.gradeCircle, { backgroundColor: bg }]}>
              <Text style={[styles.gradeText, { color: fg }]}>{result.grade}</Text>
            </View>
            <Text style={styles.title}>
              {result.grade}등급 · {GRADE_TEXT[result.grade]}
            </Text>
            <Text style={styles.subtitle}>
              {result.testItemName} · {result.value}
              {result.unit}
            </Text>

            {result.improved && (
              <View style={[styles.deltaBadge, { backgroundColor: withAlpha(colors.accentForegroundGreen, 0.12) }]}>
                <Icon name="arrow-up" size={16} color={colors.accentForegroundGreen} />
                <Text style={[styles.deltaText, { color: colors.accentForegroundGreen }]}>
                  이전보다 {deltaGrade}등급 상승했어요!
                </Text>
              </View>
            )}
            {result.same && <Text style={styles.sameText}>이전과 동일한 등급이에요</Text>}
          </View>

          <View style={{ marginTop: 22 }}>
            <Button title="확인" onPress={onClose} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 25, 28, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.backgroundNormal,
    borderRadius: radius.cardXLarge + 4,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
  },
  center: { alignItems: 'center' },
  gradeCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  gradeText: { fontSize: 34, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '700', color: colors.labelNormal },
  subtitle: { fontSize: 14, fontWeight: '500', color: colors.labelAlternative, marginTop: 4 },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  deltaText: { fontSize: 13, fontWeight: '700' },
  sameText: { marginTop: 14, fontSize: 13, fontWeight: '600', color: colors.labelAlternative },
});
