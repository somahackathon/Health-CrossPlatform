import { SafeAreaProvider } from 'react-native-safe-area-context';

import { migrate } from './src/db/client';
import RootNavigator from './src/navigation/RootNavigator';
import { useProfileStore } from './src/store/useProfileStore';

migrate();
useProfileStore.getState().load();

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
