import { StyleSheet, Text, View } from 'react-native';

export default function AccountsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Accounts</Text>
            <Text style={styles.subtitle}>Manage your financial accounts</Text>
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
