import { Ionicons } from '@expo/vector-icons';
import axios, { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const API_URL = 'http://planfin.tech:8080/usuarios';

type InputFieldProps = {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
    textContentType?: 'none' | 'emailAddress' | 'password' | 'name';
    autoCapitalize?: 'none' | 'words';
    rightAccessory?: ReactNode;
    editable?: boolean;
};

function InputField({
    icon,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType = 'default',
    textContentType,
    autoCapitalize = 'none',
    rightAccessory,
    editable = true,
}: InputFieldProps) {
    return (
        <View style={styles.field}>
            <Ionicons nome={icon} size={18} color={COLORS.fieldIcon} style={styles.fieldIcon} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                textContentType={textContentType}
                autoCapitalize={autoCapitalize}
                editable={editable}
                style={styles.fieldInput}
            />
            {rightAccessory ? <View style={styles.fieldAccessory}>{rightAccessory}</View> : null}
        </View>
    );
}

export default function SignUpScreen() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmSenha, setConfirmSenha] = useState('');
    const [isSenhaVisible, setIsSenhaVisible] = useState(false);
    const [isConfirmSenhaVisible, setIsConfirmSenhaVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        // Validação básica
        if (!nome.trim() || !email.trim() || !senha.trim() || !confirmSenha.trim()) {
            Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos.');
            return;
        }

        if (senha !== confirmSenha) {
            Alert.alert('Senhas incompatíveis', 'As senhas informadas não coincidem.');
            return;
        }

        if (senha.length < 6) {
            Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(API_URL, {
                nome: nome.trim(),
                email: email.trim(),
                senha: senha.trim(),
            });

            if (response.status === 201 || response.status === 200) {
                Alert.alert('Sucesso', 'Conta criada com sucesso!', [
                    { text: 'Ir para Login', onPress: () => router.replace('/login') }
                ]);
            }
        } catch (error) {
            let errorMessage = 'Erro ao conectar com o servidor';

            if (isAxiosError(error)) {
                if (error.response) {
                    errorMessage =
                        error.response.data?.message || 'Erro ao criar conta. Tente novamente.';
                } else if (error.request) {
                    errorMessage = 'Erro de conexão. Verifique sua internet.';
                } else {
                    errorMessage = error.message;
                }
            }

            Alert.alert('Falha no cadastro', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = () => {
        router.navigate('/login'); 
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    <View style={styles.screen}>
                        <Text style={styles.brand}>FinPlan</Text>

                        <View style={styles.card}>
                            <Text style={styles.title}>
                                Create
                                {'\n'}
                                Account
                            </Text>
                            <Text style={styles.subtitle}>Join us to manage your growth and assets securely.</Text>

                            <View style={styles.form}>
                                <InputField
                                    icon="person-outline"
                                    value={nome}
                                    onChangeText={setNome}
                                    placeholder="Full name"
                                    textContentType="name"
                                    autoCapitalize="words"
                                    editable={!isLoading}
                                />

                                <InputField
                                    icon="mail-outline"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Email Address"
                                    keyboardType="email-address"
                                    textContentType="emailAddress"
                                    editable={!isLoading}
                                />

                                <InputField
                                    icon="lock-closed-outline"
                                    value={senha}
                                    onChangeText={setSenha}
                                    placeholder="senha"
                                    secureTextEntry={!isSenhaVisible}
                                    textContentType="password"
                                    editable={!isLoading}
                                    rightAccessory={
                                        <Pressable
                                            hitSlop={10}
                                            disabled={isLoading}
                                            onPress={() => setIsSenhaVisible((current) => !current)}>
                                            <Ionicons
                                                nome={isSenhaVisible ? 'eye-off-outline' : 'eye-outline'}
                                                size={22}
                                                color={COLORS.fieldIcon}
                                            />
                                        </Pressable>
                                    }
                                />

                                <InputField
                                    icon="shield-checkmark-outline"
                                    value={confirmSenha}
                                    onChangeText={setConfirmSenha}
                                    placeholder="Confirm senha"
                                    secureTextEntry={!isConfirmSenhaVisible}
                                    textContentType="password"
                                    editable={!isLoading}
                                    rightAccessory={
                                        <Pressable
                                            hitSlop={10}
                                            disabled={isLoading}
                                            onPress={() => setIsConfirmSenhaVisible((current) => !current)}>
                                            <Ionicons
                                                nome={isConfirmSenhaVisible ? 'eye-off-outline' : 'eye-outline'}
                                                size={22}
                                                color={COLORS.fieldIcon}
                                            />
                                        </Pressable>
                                    }
                                />

                                <Pressable
                                    style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled, { marginTop: 12 }]}
                                    disabled={isLoading}
                                    onPress={handleSignUp}>
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={COLORS.buttonText} />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Sign Up</Text>
                                    )}
                                </Pressable>

                                <View style={styles.signInRow}>
                                    <Text style={styles.signInPrefix}>Already have an account? </Text>
                                    <Pressable disabled={isLoading} onPress={handleSignIn}>
                                        <Text style={styles.signInAction}>Sign In</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <View style={styles.footerLine}>
                                <Ionicons nome="lock-closed" size={13} color={COLORS.footer} />
                                <Text style={styles.footerText}>256-bit SSL Encryption Secured</Text>
                            </View>
                            <Text style={styles.footerText}>© 2024 IS Financial Services. Member FDIC.</Text>
                            <Text style={styles.footerText}>Equal Housing Lender.</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const COLORS = {
    background: '#F3F1E8',
    brand: '#426C45',
    card: '#FFFFFF',
    title: '#1F1F1F',
    subtitle: '#67635B',
    fieldBackground: '#F0EBE4',
    fieldIcon: '#67635B',
    placeholder: '#80776E',
    inputText: '#2A2A2A',
    primaryButton: '#3C6F44',
    primaryButtonDisabled: '#A8C8B0',
    buttonText: '#FFFFFF',
    divider: '#D5CEC4',
    dividerText: '#5D5A55',
    biometricBorder: '#D4C8B8',
    biometricBackground: '#FAF7F2',
    biometricColor: '#2A2A2A',
    signUp: '#376E48',
    footer: '#9A948A',
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    screen: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 18,
    },
    brand: {
        color: COLORS.brand,
        fontSize: 26,
        lineHeight: 30,
        fontWeight: '700',
        letterSpacing: -0.4,
        marginLeft: 14,
        marginBottom: 12,
    },
    card: {
        width: '100%',
        maxWidth: 320,
        alignSelf: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 28,
        shadowColor: '#000000',
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: {
            width: 0,
            height: 7,
        },
        elevation: 6,
    },
    title: {
        color: COLORS.title,
        fontSize: 42,
        lineHeight: 42,
        fontWeight: '800',
        letterSpacing: -1.2,
    },
    subtitle: {
        marginTop: 14,
        color: COLORS.subtitle,
        fontSize: 16,
        lineHeight: 22,
    },
    form: {
        marginTop: 24,
    },
    field: {
        height: 58,
        borderRadius: 10,
        backgroundColor: COLORS.fieldBackground,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    fieldIcon: {
        marginRight: 10,
    },
    fieldInput: {
        flex: 1,
        fontSize: 15,
        lineHeight: 18,
        color: COLORS.inputText,
        paddingVertical: 0,
    },
    fieldAccessory: {
        marginLeft: 10,
    },
    primaryButton: {
        height: 56,
        borderRadius: 999,
        backgroundColor: COLORS.primaryButton,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#26432C',
        shadowOpacity: 0.16,
        shadowRadius: 14,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        elevation: 5,
    },
    primaryButtonDisabled: {
        backgroundColor: COLORS.primaryButtonDisabled,
    },
    primaryButtonText: {
        color: COLORS.buttonText,
        fontSize: 16,
        fontWeight: '700',
    },
    signInRow: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    signInPrefix: {
        color: COLORS.subtitle,
        fontSize: 14,
        lineHeight: 18,
    },
    signInAction: {
        color: COLORS.signUp,
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        marginTop: 14,
    },
    footerLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    footerText: {
        color: COLORS.footer,
        fontSize: 12,
        lineHeight: 16,
        textAlign: 'center',
    },
});