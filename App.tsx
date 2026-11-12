import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import InicioScreen from './src/screens/InicioScreen';
import DetalhesScreen from './src/screens/DetalhesScreen';
import FavoritosScreen from './src/screens/FavoritosScreen';
import { RootStackParams } from './src/types';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParams>();

export default function App() { return <SafeAreaProvider><NavigationContainer><Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}>
  <Stack.Screen name="Inicio" component={InicioScreen} options={{ title: 'SPBus' }} />
  <Stack.Screen name="Detalhes" component={DetalhesScreen} options={{ title: 'Detalhes da linha' }} />
  <Stack.Screen name="Favoritos" component={FavoritosScreen} options={{ title: 'Favoritos' }} />
    </Stack.Navigator>
  </NavigationContainer>
</SafeAreaProvider>; }
