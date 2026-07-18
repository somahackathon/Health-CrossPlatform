import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Logo from '../components/Logo';
import { RootStackParamList } from '../navigation/RootNavigator';
import { isProfileComplete, useProfileStore } from '../store/useProfileStore';
import { colors } from '../theme/colors';

const SPLASH_DELAY_MS = 1100;

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfileStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: isProfileComplete(profile) ? 'Main' : 'Start' }],
      });
    }, SPLASH_DELAY_MS);
    return () => clearTimeout(timer);
    // Only the mount-time profile state decides where the splash routes to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      <Logo size={120} />
      <Text style={styles.title}>Health</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.backgroundNormal, gap: 16 },
  title: { fontSize: 26, fontWeight: '800', color: colors.labelNormal },
});
