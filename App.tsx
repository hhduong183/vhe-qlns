// import { ExpoRoot } from 'expo-router';

// export default function App() {
//   return <ExpoRoot/>;
// }
// App.tsx
import 'expo-router/entry';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
export default function App() {
    return (
      <ActionSheetProvider>
        {/* Your app components */}
      </ActionSheetProvider>
    );
  }