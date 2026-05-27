import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome to your financial dashboard</Text>
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
    },
});
