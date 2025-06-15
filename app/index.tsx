import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!isLoading && !showSplash) {
      if (user) {
        if (user.isAdmin) {
          router.replace('/admin');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/auth');
      }
    }
  }, [user, isLoading, showSplash]);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🔧</Text>
          <Text style={styles.logoText}>ServicePro</Text>
          <Text style={styles.tagline}>Connect. Serve. Grow.</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoadingSpinner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E0F2FE',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
  },
});