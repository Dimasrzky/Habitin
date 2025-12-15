// app/screens/debug/TestArticleServices.tsx

import { ENV_CONFIG } from '@/config/env.config';
import { useAuth } from '@/context/AuthContext';
import { generatePersonalizedArticles } from '@/services/article/articleOrchestrator';
import { getLatestArticles, getUserRecommendations } from '@/services/article/articleService';
import { testDeepLConnection } from '@/services/article/deeplTranslate';
import { fetchHealthArticles, testNewsAPIConnection } from '@/services/article/newsAPI';
import { analyzeUserHealthPriority } from '@/services/health/healthAnalysis';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TestArticleServicesScreen() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${emoji} [${timestamp}] ${message}`]);
  };

  const clearLogs = () => setLogs([]);

  // Test 1: Check Environment Variables
  const testEnvVars = () => {
    addLog('=== Testing Environment Variables ===');
    
    addLog(`NEWS_API_KEY: ${ENV_CONFIG.articleAPIs.NEWS_API_KEY ? '✓ Present' : '✗ Missing'}`, 
      ENV_CONFIG.articleAPIs.NEWS_API_KEY ? 'success' : 'error');
    addLog(`NEWS_API_BASE_URL: ${ENV_CONFIG.articleAPIs.NEWS_API_BASE_URL}`);
    
    addLog(`DEEPL_API_KEY: ${ENV_CONFIG.articleAPIs.DEEPL_API_KEY ? '✓ Present' : '✗ Missing'}`, 
      ENV_CONFIG.articleAPIs.DEEPL_API_KEY ? 'success' : 'error');
    addLog(`DEEPL_API_BASE_URL: ${ENV_CONFIG.articleAPIs.DEEPL_API_BASE_URL}`);
    
    addLog(`User UID: ${user?.uid || 'Not logged in'}`, user?.uid ? 'success' : 'error');
  };

  // Test 2: Test NewsAPI Connection
  const testNewsAPI = async () => {
    addLog('=== Testing NewsAPI Connection ===');
    setLoading(true);
    
    try {
      const isConnected = await testNewsAPIConnection();
      addLog(`NewsAPI Connection: ${isConnected ? 'Success' : 'Failed'}`, 
        isConnected ? 'success' : 'error');
    } catch (error) {
      addLog(`NewsAPI Error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Test Fetch Articles
  const testFetchArticles = async () => {
    addLog('=== Testing Fetch Health Articles ===');
    setLoading(true);
    
    try {
      addLog('Fetching diabetes articles...');
      const articles = await fetchHealthArticles('diabetes');
      
      addLog(`Found ${articles.length} articles`, articles.length > 0 ? 'success' : 'error');
      
      if (articles.length > 0) {
        addLog(`First article: ${articles[0].title}`);
        addLog(`Source: ${articles[0].source.name}`);
      } else {
        addLog('No articles returned. Check API key and quota.', 'error');
      }
    } catch (error) {
      addLog(`Fetch Error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Test DeepL Connection
  const testDeepL = async () => {
    addLog('=== Testing DeepL Translation ===');
    setLoading(true);
    
    try {
      const isConnected = await testDeepLConnection();
      addLog(`DeepL Connection: ${isConnected ? 'Success' : 'Failed'}`, 
        isConnected ? 'success' : 'error');
    } catch (error) {
      addLog(`DeepL Error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Test Health Analysis
  const testHealthAnalysis = async () => {
    if (!user?.uid) {
      addLog('User not logged in!', 'error');
      return;
    }

    addLog('=== Testing Health Analysis ===');
    setLoading(true);
    
    try {
      const priority = await analyzeUserHealthPriority(user.uid);
      addLog(`Health Priority: ${priority.focus}`, 'success');
      addLog(`Diabetes Score: ${priority.diabetesScore}`);
      addLog(`Cholesterol Score: ${priority.cholesterolScore}`);
      addLog(`Reason: ${priority.reason}`);
    } catch (error) {
      addLog(`Health Analysis Error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 6: Test Get Latest Articles from DB
  const testGetLatestArticles = async () => {
    addLog('=== Testing Get Latest Articles from DB ===');
    setLoading(true);
    
    try {
      const result = await getLatestArticles(5);
      addLog(`Success: ${result.success}`, result.success ? 'success' : 'error');
      addLog(`Articles Count: ${result.articles.length}`);
      
      if (result.articles.length > 0) {
        addLog(`First article: ${result.articles[0].title_id}`);
      } else {
        addLog('No articles in database yet', 'error');
      }
    } catch (error) {
      addLog(`DB Error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 7: Test Get User Recommendations
  const testGetRecommendations = async () => {
    if (!user?.uid) {
      addLog('User not logged in!', 'error');
      return;
    }

    addLog('=== Testing Get User Recommendations ===');
    setLoading(true);
    
    try {
      const result = await getUserRecommendations(user.uid);
      addLog(`Success: ${result.success}`, result.success ? 'success' : 'error');
      addLog(`Recommendations Count: ${result.recommendations.length}`);
      
      if (result.recommendations.length > 0) {
        addLog(`First recommendation: ${result.recommendations[0].articles.title_id}`);
      } else {
        addLog('No recommendations yet for this user', 'error');
      }
    } catch (error) {
      addLog(`Recommendations Error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 8: Test Full Orchestrator (Quick Access)
  const testFullOrchestrator = async () => {
    if (!user?.uid) {
      addLog('User not logged in!', 'error');
      return;
    }

    addLog('=== Testing Full Article Orchestrator ===');
    addLog('This will take a while...');
    setLoading(true);
    
    try {
      const result = await generatePersonalizedArticles(user.uid);
      
      addLog(`Success: ${result.success}`, result.success ? 'success' : 'error');
      
      if (result.success) {
        addLog(`Articles Generated: ${result.articles?.length || 0}`);
        addLog(`Health Priority: ${result.healthPriority?.focus}`);
        
        if (result.articles && result.articles.length > 0) {
          addLog(`First article: ${result.articles[0].title_id}`, 'success');
        }
      } else {
        addLog(`Error Message: ${result.message}`, 'error');
      }
    } catch (error) {
      addLog(`Orchestrator Error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Article Services Test</Text>
      
      <ScrollView style={styles.buttonContainer}>
        <TestButton title="1. Check Env Vars" onPress={testEnvVars} />
        <TestButton title="2. Test NewsAPI" onPress={testNewsAPI} loading={loading} />
        <TestButton title="3. Fetch Articles" onPress={testFetchArticles} loading={loading} />
        <TestButton title="4. Test DeepL" onPress={testDeepL} loading={loading} />
        <TestButton title="5. Test Health Analysis" onPress={testHealthAnalysis} loading={loading} />
        <TestButton title="6. Get Latest from DB" onPress={testGetLatestArticles} loading={loading} />
        <TestButton title="7. Get Recommendations" onPress={testGetRecommendations} loading={loading} />
        <TestButton title="8. Full Orchestrator (Quick Access)" onPress={testFullOrchestrator} loading={loading} />
        
        <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
          <Text style={styles.clearButtonText}>🗑️ Clear Logs</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>📋 Logs:</Text>
        <ScrollView style={styles.logScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const TestButton = ({ 
  title, 
  onPress, 
  loading 
}: { 
  title: string; 
  onPress: () => void; 
  loading?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.testButton, loading && styles.testButtonDisabled]}
    onPress={onPress}
    disabled={loading}
  >
    <Text style={styles.testButtonText}>{title}</Text>
    {loading && <ActivityIndicator size="small" color="#FFF" style={styles.loader} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1E293B',
  },
  buttonContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#4A90E2',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  loader: {
    marginLeft: 10,
  },
  clearButton: {
    backgroundColor: '#EF4444',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  logScroll: {
    flex: 1,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#E2E8F0',
    marginBottom: 4,
    lineHeight: 18,
  },
});