import { Image, ImageStyle, StyleProp } from 'react-native';

type Props = { size?: number; style?: StyleProp<ImageStyle> };

export default function Logo({ size = 120, style }: Props) {
  return (
    <Image
      source={require('../../assets/icon.png')}
      style={[{ width: size, height: size, borderRadius: size * 0.22 }, style]}
      resizeMode="contain"
    />
  );
}
