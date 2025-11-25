/**
 * App Navigation
 * Main navigation structure with authentication flow
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

// Main Screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ProjectsScreen from '../screens/Projects/ProjectsScreen';
import ProjectDetailScreen from '../screens/Projects/ProjectDetailScreen';
import BlueprintsScreen from '../screens/Blueprints/BlueprintsScreen';
import BlueprintDetailScreen from '../screens/Blueprints/BlueprintDetailScreen';
import MonitoringScreen from '../screens/Monitoring/MonitoringScreen';
import CostAnalyticsScreen from '../screens/CostAnalytics/CostAnalyticsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';

import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Dashboard Tab
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="DashboardMain"
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
  </Stack.Navigator>
);

// Projects Tab
const ProjectsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ProjectsList"
      component={ProjectsScreen}
      options={{ title: 'Projects' }}
    />
    <Stack.Screen
      name="ProjectDetail"
      component={ProjectDetailScreen}
      options={{ title: 'Project Details' }}
    />
  </Stack.Navigator>
);

// Blueprints Tab
const BlueprintsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="BlueprintsList"
      component={BlueprintsScreen}
      options={{ title: 'Blueprints' }}
    />
    <Stack.Screen
      name="BlueprintDetail"
      component={BlueprintDetailScreen}
      options={{ title: 'Blueprint Details' }}
    />
  </Stack.Navigator>
);

// Monitoring Tab
const MonitoringStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MonitoringMain"
      component={MonitoringScreen}
      options={{ title: 'Monitoring' }}
    />
  </Stack.Navigator>
);

// Cost Analytics Tab
const CostStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="CostAnalyticsMain"
      component={CostAnalyticsScreen}
      options={{ title: 'Cost Analytics' }}
    />
  </Stack.Navigator>
);

// Bottom Tabs
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#1e3a8a',
      tabBarInactiveTintColor: '#6b7280',
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardStack}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="view-dashboard" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Projects"
      component={ProjectsStack}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="folder-multiple" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Blueprints"
      component={BlueprintsStack}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="file-document-multiple" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Monitoring"
      component={MonitoringStack}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="monitor-dashboard" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="CostAnalytics"
      component={CostStack}
      options={{
        tabBarLabel: 'Costs',
        tabBarIcon: ({ color, size }) => (
          <Icon name="chart-line" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main Drawer
const MainDrawer = () => (
  <Drawer.Navigator
    screenOptions={{
      headerShown: true,
      drawerActiveTintColor: '#1e3a8a',
      drawerInactiveTintColor: '#6b7280',
    }}
  >
    <Drawer.Screen
      name="Home"
      component={MainTabs}
      options={{
        drawerIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        drawerIcon: ({ color, size }) => (
          <Icon name="account" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        drawerIcon: ({ color, size }) => (
          <Icon name="cog" size={size} color={color} />
        ),
      }}
    />
  </Drawer.Navigator>
);

// Root Navigator
const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainDrawer} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
