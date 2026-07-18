import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Gender } from '../api/types';
import { Profile } from '../db/profile';
import { colors, radius } from '../theme/colors';
import Button from './Button';
import SegmentedControl from './SegmentedControl';

type Props = {
  initial: Partial<Profile>;
  submitLabel: string;
  onSubmit: (profile: Profile) => void;
  onCancel?: () => void;
};

const GENDER_ITEMS = [
  { label: '남성', value: 'MALE' },
  { label: '여성', value: 'FEMALE' },
];

// Mount fresh (e.g. only while a modal is open) so each mount seeds cleanly
// from `initial` — no reset effect needed.
export default function ProfileForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [birthDate, setBirthDate] = useState((initial.birthDate ?? '').replace(/-/g, ''));
  const [gender, setGender] = useState<Gender>(initial.gender ?? 'MALE');
  const [heightCm, setHeightCm] = useState(initial.heightCm ? String(initial.heightCm) : '');
  const [weightKg, setWeightKg] = useState(initial.weightKg ? String(initial.weightKg) : '');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!/^\d{8}$/.test(birthDate)) {
      setError('생년월일을 YYYYMMDD 형식으로 입력해 주세요');
      return;
    }
    const isoDate = `${birthDate.slice(0, 4)}-${birthDate.slice(4, 6)}-${birthDate.slice(6, 8)}`;
    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);
    if (Number.isNaN(height) || Number.isNaN(weight)) {
      setError('키와 체중을 숫자로 입력해 주세요');
      return;
    }
    onSubmit({ birthDate: isoDate, gender, heightCm: height, weightKg: weight });
  };

  return (
    <View>
      <Text style={styles.label}>생년월일</Text>
      <TextInput
        value={birthDate}
        onChangeText={(v) => setBirthDate(v.replace(/[^0-9]/g, '').slice(0, 8))}
        placeholder="20100314"
        placeholderTextColor={colors.labelAssistive}
        style={styles.input}
        keyboardType="number-pad"
        maxLength={8}
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
        {onCancel && (
          <View style={{ flex: 1 }}>
            <Button title="취소" variant="outlined" onPress={onCancel} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Button title={submitLabel} onPress={submit} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
