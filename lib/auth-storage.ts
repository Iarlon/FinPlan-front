import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'userToken';

export async function getAuthToken() {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.warn('Falha ao ler o token de autenticação:', error);
        return null;
    }
}

export async function setAuthToken(token: string) {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.warn('Falha ao salvar o token de autenticação:', error);
    }
}

export async function clearAuthToken() {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.warn('Falha ao limpar o token de autenticação:', error);
    }
}