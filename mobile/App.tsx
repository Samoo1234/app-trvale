// =============================================================================
// TRVALE DO BOI - App Principal
// Ponto de entrada do aplicativo mobile
// =============================================================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Contexto de autenticação
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Telas
import { LoginScreen } from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { NovaViagemScreen } from './src/screens/NovaViagemScreen';
import { ViagemAtivaScreen } from './src/screens/ViagemAtivaScreen';

// Tipos
import { RootStackParamList } from './src/types';

// Cores
import { colors } from './src/theme/colors';

// Criar navegador de stack
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Componente de navegação
 * Alterna entre rotas autenticadas e não autenticadas
 */
function Navigation() {
    const { isAuthenticated, isLoading } = useAuth();

    // Mostrar tela de loading enquanto verifica autenticação
    if (isLoading) {
        return null; // Poderia ser uma splash screen
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
            }}
        >
            {isAuthenticated ? (
                // Rotas autenticadas
                <>
                    <Stack.Screen name="Dashboard" component={DashboardScreen} />
                    <Stack.Screen name="NovaViagem" component={NovaViagemScreen} />
                    <Stack.Screen name="ViagemAtiva" component={ViagemAtivaScreen} />
                </>
            ) : (
                // Rotas de autenticação
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}

/**
 * Componente principal do app
 */
export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <NavigationContainer>
                    <StatusBar style="light" backgroundColor={colors.primary} />
                    <Navigation />
                </NavigationContainer>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
