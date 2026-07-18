import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Icon from '../components/Icon';
import ResultModal from '../components/ResultModal';
import { usePapsEvents } from '../hooks/usePapsEvents';
import { useFitnessStore } from '../store/useFitnessStore';
import { colors, radius } from '../theme/colors';

export default function InputScreen() {
  const profile = useFitnessStore((s) => s.profile);
  const papsEvents = usePapsEvents();
  const selectedCategory = useFitnessStore((s) => s.selectedCategory);
  const inputValue = useFitnessStore((s) => s.inputValue);
  const selectCategory = useFitnessStore((s) => s.selectCategory);
  const setInputValue = useFitnessStore((s) => s.setInputValue);
  const submitRecord = useFitnessStore((s) => s.submitRecord);
  const lastResult = useFitnessStore((s) => s.lastResult);
  const closeResult = useFitnessStore((s) => s.closeResult);

  const parsedValue = parseFloat(inputValue);
  const submitDisabled = inputValue === '' || Number.isNaN(parsedValue);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>기록 입력</Text>
          <Text style={styles.subtitle}>종목을 선택해 기록을 입력하면 등급이 판정돼요</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Text style={styles.panelTitle}>내 신체 정보</Text>
              <View style={styles.editHint}>
                <Icon name="pencil" size={14} color={colors.primaryNormal} />
                <Text style={styles.editHintText}>수정</Text>
              </View>
            </View>
            <View style={styles.profileGrid}>
              {profile.map((row) => (
                <View key={row.label} style={styles.profileRow}>
                  <Text style={styles.profileLabel}>{row.label}</Text>
                  <Text style={styles.profileValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.sectionTitle}>PAPS 종목 기록</Text>
            <View style={{ gap: 10 }}>
              {papsEvents.map((ev) => {
                const selected = selectedCategory === ev.id;
                return (
                  <View
                    key={ev.id}
                    style={[styles.eventCard, { borderColor: selected ? colors.primaryNormal : colors.lineNormal }]}
                  >
                    <Pressable style={styles.eventHeader} onPress={() => selectCategory(ev.id)}>
                      <View style={[styles.eventBadge, { backgroundColor: ev.bg }]}>
                        <Text style={[styles.eventBadgeText, { color: ev.fg }]}>{ev.grade}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.eventName}>{ev.name}</Text>
                        <Text style={styles.eventMeta}>
                          최근 {ev.value}
                          {ev.unit} · {ev.gradeText}
                        </Text>
                      </View>
                      <Icon name={selected ? 'chevron-up' : 'chevron-down'} size={20} color={colors.labelAssistive} />
                    </Pressable>

                    {selected && (
                      <View style={styles.expandBody}>
                        <Text style={styles.inputLabel}>기록값 입력 ({ev.unit})</Text>
                        <View style={styles.inputRow}>
                          <View style={styles.inputField}>
                            <TextInput
                              value={inputValue}
                              onChangeText={setInputValue}
                              keyboardType="decimal-pad"
                              placeholder="숫자 입력"
                              placeholderTextColor={colors.labelAssistive}
                              style={styles.textInput}
                            />
                            <Text style={styles.inputUnit}>{ev.unit}</Text>
                          </View>
                          <View style={{ width: 96 }}>
                            <Button
                              title="판정 요청"
                              disabled={submitDisabled}
                              onPress={submitRecord}
                              style={{ height: 48 }}
                            />
                          </View>
                        </View>
                        <Text style={styles.inputHint}>입력값을 서버 기준치와 비교해 1~5등급을 판정합니다</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <ResultModal result={lastResult} onClose={closeResult} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNormal },
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 6 },
  title: { fontSize: 23, fontWeight: '700', color: colors.labelNormal },
  subtitle: { fontSize: 13, fontWeight: '500', color: colors.labelAlternative, marginTop: 2 },
  body: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24, gap: 16 },
  profileCard: {
    padding: 18,
    borderRadius: radius.cardLarge,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.lineNormal,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  panelTitle: { fontSize: 16, fontWeight: '700', color: colors.labelNormal },
  editHint: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  editHintText: { fontSize: 12, fontWeight: '600', color: colors.primaryNormal },
  profileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  profileRow: { width: '47%', padding: 12, paddingHorizontal: 14, borderRadius: radius.field, backgroundColor: colors.fillNormal },
  profileLabel: { fontSize: 11, fontWeight: '600', color: colors.labelAssistive },
  profileValue: { fontSize: 16, fontWeight: '700', color: colors.labelNormal, marginTop: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.labelNormal, marginBottom: 12 },
  eventCard: { borderRadius: radius.card, borderWidth: 1, backgroundColor: colors.backgroundNormal, overflow: 'hidden' },
  eventHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, paddingHorizontal: 16 },
  eventBadge: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  eventBadgeText: { fontSize: 14, fontWeight: '700' },
  eventName: { fontSize: 14, fontWeight: '600', color: colors.labelNormal },
  eventMeta: { fontSize: 12, fontWeight: '500', color: colors.labelAssistive, marginTop: 1 },
  expandBody: { paddingHorizontal: 16, paddingBottom: 18, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.lineAlternative },
  inputLabel: { fontSize: 12, fontWeight: '600', color: colors.labelNeutral, marginVertical: 14 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  inputField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.lineNormal,
    backgroundColor: colors.backgroundNormal,
  },
  textInput: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.labelNormal, padding: 0 },
  inputUnit: { fontSize: 14, fontWeight: '600', color: colors.labelAlternative },
  inputHint: { fontSize: 11, fontWeight: '500', color: colors.labelAssistive, marginTop: 8 },
});
