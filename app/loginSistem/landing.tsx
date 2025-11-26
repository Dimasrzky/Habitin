import { StyleSheet, Text, View } from 'react-native';

export default function Landing() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Landing Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  text: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});