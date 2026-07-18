import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Profile } from '../db/profile';
import { colors, radius } from '../theme/colors';
import ProfileForm from './ProfileForm';

type Props = {
  initial: Partial<Profile>;
  onClose: () => void;
  onSave: (profile: Profile) => void;
};

// The parent mounts this component only while the modal should be visible,
// so each open gets a fresh instance seeded from `initial` — no reset effect needed.
export default function ProfileEditModal({ initial, onClose, onSave }: Props) {
  const submit = (profile: Profile) => {
    onSave(profile);
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>내 신체 정보</Text>
            <ProfileForm initial={initial} submitLabel="저장" onSubmit={submit} onCancel={onClose} />
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
});
