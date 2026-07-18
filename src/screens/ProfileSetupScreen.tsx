import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileForm from '../components/ProfileForm';
import { Profile } from '../db/profile';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useProfileStore } from '../store/useProfileStore';
import { colors } from '../theme/colors';

export default function ProfileSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const saveProfile = useProfileStore((s) => s.save);

  const submit = (profile: Profile) => {
    saveProfile(profile);
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>내 신체 정보</Text>
        <Text style={styles.subtitle}>정확한 PAPS 등급 판정을 위해 필요해요</Text>
        <ProfileForm initial={{}} submitLabel="시작하기" onSubmit={submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNormal },
  body: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  title: { fontSize: 23, fontWeight: '700', color: colors.labelNormal },
  subtitle: { fontSize: 13, fontWeight: '500', color: colors.labelAlternative, marginTop: 4 },
});
