/**
 * TheTribe Mobile App
 * Main entry point with navigation and auth
 */

import React from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Colors } from './src/theme';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from './src/screens/home/HomeScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import ConnectionsScreen from './src/screens/connections/ConnectionsScreen';
import LiveSessionsScreen from './src/screens/live/LiveSessionsScreen';
import ContentScreen from './src/screens/content/ContentScreen';
import CreateGroupScreen from './src/screens/groups/CreateGroupScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon Component
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '💬',
    Live: '📺',
    Learn: '📚',
    Connections: '👥',
    Profile: '👤',
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={{ fontSize: focused ? 24 : 20 }}>{icons[label] || '•'}</Text>
    </View>
  );
}

// Bottom Tab Navigator (Main App)
function MainTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Colors.tribeBlack },
        headerTintColor: Colors.tribeLight,
        tabBarStyle: {
          backgroundColor: Colors.tribeBlack,
          borderTopColor: 'rgba(255,255,255,0.1)',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: Colors.tribeGold,
        tabBarInactiveTintColor: Colors.tribeGray,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Live"
        component={LiveSessionsScreen}
        options={{ title: 'Live Sessions' }}
      />
      <Tab.Screen
        name="Learn"
        component={ContentScreen}
        options={{ title: 'Training' }}
      />
      <Tab.Screen
        name="Connections"
        component={ConnectionsScreen}
        options={{ title: 'Connections' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack (Login/Register)
function AuthStack(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.tribeBlack },
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// App Navigator (switches between Auth and Main based on auth state)
function AppNavigator(): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashText}>TheTribe</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.tribeBlack },
        headerTintColor: Colors.tribeLight,
      }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }: any) => ({
              title: route.params?.conversationName || 'Chat',
              headerShown: true,
            })}
          />
          <Stack.Screen
            name="CreateGroup"
            component={CreateGroupScreen}
            options={{ title: 'Create Group', headerShown: true }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={Colors.tribeBlack} />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.tribeBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.tribeGold,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
