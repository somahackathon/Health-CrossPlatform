import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Gender } from '../api/types';
import { Profile } from '../db/profile';
import { colors, radius } from '../theme/colors';
import Button from './Button';
import SegmentedControl from './SegmentedControl';

type Props = {
  initial: Partial<Profile>;
  onClose: () => void;
  onSave: (profile: Profile) => void;
};

const GENDER_ITEMS = [
  { label: '남성', value: 'MALE' },
  { label: '여성', value: 'FEMALE' },
];

// The parent mounts this component only while the modal should be visible,
// so each open gets a fresh instance seeded from `initial` — no reset effect needed.
export default function ProfileEditModal({ initial, onClose, onSave }: Props) {
  const [birthDate, setBirthDate] = useState(initial.birthDate ?? '');
  const [gender, setGender] = useState<Gender>(initial.gender ?? 'MALE');
  const [heightCm, setHeightCm] = useState(initial.heightCm ? String(initial.heightCm) : '');
  const [weightKg, setWeightKg] = useState(initial.weightKg ? String(initial.weightKg) : '');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      setError('생년월일을 YYYY-MM-DD 형식으로 입력해 주세요');
      return;
    }
    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);
    if (Number.isNaN(height) || Number.isNaN(weight)) {
      setError('키와 체중을 숫자로 입력해 주세요');
      return;
    }
    onSave({ birthDate, gender, heightCm: height, weightKg: weight });
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>내 신체 정보</Text>

            <Text style={styles.label}>생년월일</Text>
            <TextInput
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="2010-03-14"
              placeholderTextColor={colors.labelAssistive}
              style={styles.input}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>성별</Text>
            <SegmentedControl items={GENDER_ITEMS} value={gender} onChange={(v) => setGender(v as Gender)} />

            <Text style={styles.label}>키 (cm)</Text>
            <TextInput
              value={heightCm}
              onChangeText={setHeightCm}
              placeholder="172"
              placeholderTextColor={colors.labelAssistive}
              style={styles.input}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>체중 (kg)</Text>
            <TextInput
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="61"
              placeholderTextColor={colors.labelAssistive}
              style={styles.input}
              keyboardType="decimal-pad"
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.buttonRow}>
              <View style={{ flex: 1 }}>
                <Button title="취소" variant="outlined" onPress={onClose} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="저장" onPress={submit} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(23, 25, 28, 0.42)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.backgroundNormal,
    borderTopLeftRadius: radius.cardXLarge,
    borderTopRightRadius: radius.cardXLarge,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 34,
    maxHeight: '86%',
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.labelNormal, marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '600', color: colors.labelAssistive, marginBottom: 8, marginTop: 16 },
  input: {
    height: 48,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.lineNormal,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    color: colors.labelNormal,
  },
  error: { fontSize: 12, fontWeight: '600', color: colors.accentForegroundRed, marginTop: 14 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
});
