import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const EmptyLabState: React.FC = () => {
  const handleUploadPress = () => {
    router.push('/(tabs)/cekKesehatan');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📋</Text>
      </View>

      <Text style={styles.title}>Fitur Tidak Tersedia</Text>

      <Text style={styles.description}>
        Fitur tantangan hanya tersedia setelah kamu mengupload hasil lab untuk mengetahui
        prioritas kesehatan kamu.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleUploadPress} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Upload Hasil Lab</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});