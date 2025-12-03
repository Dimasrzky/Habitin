import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function OnboardingLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#fff' }
        }}
      >
        <Stack.Screen 
          name="personal" 
          options={{ title: 'Data Personal' }}
        />
        <Stack.Screen 
          name="physical" 
          options={{ title: 'Data Fisik' }}
        />
        <Stack.Screen 
          name="family" 
          options={{ title: 'Riwayat Keluarga' }}
        />
        <Stack.Screen 
          name="lifestyle" 
          options={{ title: 'Gaya Hidup' }}
        />
        <Stack.Screen 
          name="symptoms" 
          options={{ title: 'Gejala' }}
        />
        <Stack.Screen 
          name="summary" 
          options={{ title: 'Ringkasan' }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});