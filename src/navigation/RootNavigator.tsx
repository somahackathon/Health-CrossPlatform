import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlatformPressable } from '@react-navigation/elements';
import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from '../components/Icon';
import { colors } from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import InputScreen from '../screens/InputScreen';
import PlanScreen from '../screens/PlanScreen';
import PostureScreen from '../screens/PostureScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import SplashScreen from '../screens/SplashScreen';
import StartScreen from '../screens/StartScreen';

export type RootStackParamList = {
  Splash: undefined;
  Start: undefined;
  ProfileSetup: undefined;
  Main: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Input: undefined;
  Plan: undefined;
  Posture: undefined;
};

const TAB_ICONS: Record<keyof RootTabParamList, { icon: string; iconActive: string }> = {
  Home: { icon: 'home', iconActive: 'home-fill' },
  Input: { icon: 'pencil', iconActive: 'pencil-fill' },
  Plan: { icon: 'sparkle', iconActive: 'sparkle-fill' },
  Posture: { icon: 'camera', iconActive: 'camera-fill' },
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Directional slide: tabs to the right of the focused one enter from the
// right, tabs to the left enter from the left. No fade, kept fast/snappy.
const slideInterpolator = ({ current }: { current: { progress: Animated.Value } }) => ({
  sceneStyle: {
    opacity: current.progress.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0, 1, 0],
    }),
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-32, 0, 32],
        }),
      },
    ],
  },
});

const fastSlideSpec = {
  animation: 'timing',
  config: { duration: 100, easing: Easing.out(Easing.cubic) },
} as const;

function AnimatedTabIcon({ name, size, color, focused }: { name: string; size: number; color: string; focused: boolean }) {
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.12 : 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 9,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon name={name} size={size} color={color} />
    </Animated.View>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyleInterpolator: slideInterpolator,
        transitionSpec: fastSlideSpec,
        tabBarActiveTintColor: colors.primaryNormal,
        tabBarInactiveTintColor: colors.labelAssistive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
          borderTopColor: colors.lineNormal,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const meta = TAB_ICONS[route.name as keyof RootTabParamList];
          return <AnimatedTabIcon name={focused ? meta.iconActive : meta.icon} size={size} color={color} focused={focused} />;
        },
        tabBarButton: (props) => (
          <PlatformPressable {...props} android_ripple={{ color: 'transparent' }} pressOpacity={1} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tab.Screen name="Input" component={InputScreen} options={{ title: '기록' }} />
      <Tab.Screen name="Plan" component={PlanScreen} options={{ title: 'AI 계획' }} />
      <Tab.Screen name="Posture" component={PostureScreen} options={{ title: '자세교정' }} />
    </Tab.Navigator>
  );
}

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="Start" component={StartScreen} />
        <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <RootStack.Screen name="Main" component={TabNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
