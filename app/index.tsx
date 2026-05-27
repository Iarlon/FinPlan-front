import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Componente de entrada do aplicativo (SplashScreen)
 * Verifica se há um token salvo no SecureStore e redireciona o usuário
 * para a tela apropriada (login ou dashboard)
 */
export default function Index() {
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuthToken = async () => {
            try {
                // Tenta recuperar o token armazenado de forma segura
                const token = await SecureStore.getItemAsync('userToken');

                if (token) {
                    // Token existe, usuário está autenticado - redireciona para dashboard
                    router.replace('/(tabs)/home');
                } else {
                    // Token não existe, usuário precisa fazer login
                    router.replace('/(auth)/login');
                }
            } catch (error) {
                // Em caso de erro ao recuperar o token, redireciona para login por segurança
                console.error('Erro ao verificar token:', error);
                router.replace('/(auth)/login');
            } finally {
                setIsChecking(false);
            }
        };

        checkAuthToken();
    }, []);

    // Enquanto verifica o token, mostra uma tela de carregamento
    if (isChecking) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#3C6F44" />
            </View>
        );
    }

    // Este return nunca deve ser alcançado pois os redirects ocorrem antes
    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F1E8',
    },
});