// Debug Screen: Clear User Data untuk Testing
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../../src/config/firebase.config';
import { supabaseStorage } from '../../../src/config/supabase.storage';

export default function ClearUserDataScreen() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [...prev, message]);
  };

  const clearAllUserData = async () => {
    try {
      setLoading(true);
      setLogs([]);

      const user = auth.currentUser;
      if (!user) {
        addLog('❌ No user logged in');
        return;
      }

      addLog(`🚀 Starting data clear for user: ${user.uid}`);

      // 1. Clear AsyncStorage
      addLog('🗑️ Clearing AsyncStorage...');
      await AsyncStorage.clear();
      addLog('✅ AsyncStorage cleared');

      // 2. Delete lab results from database
      addLog('🗑️ Deleting lab results from database...');
      const { error: labError, count } = await supabaseStorage
        .from('lab_results')
        .delete()
        .eq('user_id', user.uid);

      if (labError) {
        addLog(`❌ Error deleting lab results: ${labError.message}`);
      } else {
        addLog(`✅ Deleted ${count || 0} lab result(s)`);
      }

      // 3. Verify data is cleared
      addLog('🔍 Verifying data is cleared...');
      const { data: remainingLabs } = await supabaseStorage
        .from('lab_results')
        .select('id')
        .eq('user_id', user.uid);

      if (remainingLabs && remainingLabs.length > 0) {
        addLog(`⚠️ Warning: ${remainingLabs.length} lab result(s) still exist`);
      } else {
        addLog('✅ All lab results deleted');
      }

      // 4. Check AsyncStorage
      const modalShown = await AsyncStorage.getItem('upload_modal_shown');
      const hasUploaded = await AsyncStorage.getItem('has_uploaded_lab');

      addLog(`📊 AsyncStorage status:`);
      addLog(`  - upload_modal_shown: ${modalShown || 'null'}`);
      addLog(`  - has_uploaded_lab: ${hasUploaded || 'null'}`);

      addLog('✅ Data clear complete!');
      addLog('');
      addLog('👉 Restart app to see changes');

      Alert.alert(
        'Success',
        'All user data has been cleared. Restart the app to see changes.',
        [
          {
            text: 'Go to Home',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      console.error('Error clearing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear All Data?',
      'This will delete:\n- All lab results from database\n- All AsyncStorage data\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: clearAllUserData,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug: Clear User Data</Text>
      <Text style={styles.subtitle}>
        Use this to simulate a fresh new user for testing
      </Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleClear}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Clearing...' : 'Clear All User Data'}
        </Text>
      </TouchableOpacity>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  logsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
    color: '#374151',
  },
});
