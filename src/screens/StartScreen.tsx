import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Logo from '../components/Logo';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

export default function StartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Logo size={140} />
        <Text style={styles.title}>Health</Text>
        <Text style={styles.subtitle}>PAPS 기록과 AI 분석으로{'\n'}체력을 관리해요</Text>
      </View>
      <View style={styles.footer}>
        <Button title="시작하기" onPress={() => navigation.navigate('ProfileSetup')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNormal, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  title: { fontSize: 28, fontWeight: '800', color: colors.labelNormal },
  subtitle: { fontSize: 15, fontWeight: '500', color: colors.labelAlternative, textAlign: 'center', lineHeight: 22 },
  footer: { paddingHorizontal: 24, paddingBottom: 12 },
});
