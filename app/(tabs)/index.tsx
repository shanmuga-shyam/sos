import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@/src/screens/LoginScreen';
import HomeScreen from '@/src/screens/HomeScreen';
import SettingsScreen from '@/src/screens/SettingsScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
