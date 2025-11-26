import { StyleSheet, Text, View } from 'react-native';

export default function HomeTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Welcome to Habitin</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});