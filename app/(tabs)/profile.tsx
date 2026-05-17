import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
    const handleLogout = () => {
        // Retorna para a tela de login
        router.replace('/(auth)/login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>Manage your account settings</Text>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#F3F1E8',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F1F1F',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#67635B',
        marginBottom: 32,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#3C6F44',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 32,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
