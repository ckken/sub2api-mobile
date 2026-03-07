import 'react-native';
import 'react-native-safe-area-context';
import 'uniwind/types';

declare module 'react-native-safe-area-context' {
  interface NativeSafeAreaViewProps {
    className?: string;
  }
}
