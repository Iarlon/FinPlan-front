import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { getAuthToken } from '../lib/auth-storage';

/**
 * Componente de entrada do aplicativo (SplashScreen)
 * Verifica se há um token salvo no armazenamento local e redireciona o usuário
 * para a tela apropriada (login ou dashboard)
 */
export default function Index() {
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuthToken = async () => {
            try {
                const token = await getAuthToken();

                if (token) {
                    router.replace('/dashboard' as never);
                } else {
                    router.replace('/(auth)/login');
                }
            } catch (error) {
                console.error('Erro ao verificar token:', error);
                router.replace('/(auth)/login');
            } finally {
                setIsChecking(false);
            }
        };

        checkAuthToken();
    }, []);

    if (isChecking) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#3C6F44" />
            </View>
        );
    }

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