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
import { setAuthToken } from '../../lib/auth-storage';

const API_URL = 'https://6a08f743e7e3f433d482e2dd.mockapi.io/finplan/api/v1/auth';

type LoginFieldProps = {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
    textContentType?: 'none' | 'emailAddress' | 'password';
    autoCapitalize?: 'none';
    rightAccessory?: ReactNode;
    editable?: boolean;
    errorMessage?: string;
};

function LoginField({
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
    errorMessage,
}: LoginFieldProps) {
    return (
        <View style={styles.fieldWrapper}>
            <View style={[styles.field, errorMessage && styles.fieldError]}>
                <Ionicons name={icon} size={18} color={COLORS.fieldIcon} style={styles.fieldIcon} />
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
            {errorMessage ? <Text style={styles.fieldErrorText}>{errorMessage}</Text> : null}
        </View>
    );
}

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const canSubmit = !isLoading;

    const handleLogin = async () => {
        const nextFieldErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            nextFieldErrors.email = 'Informe seu email.';
        }

        if (!password.trim()) {
            nextFieldErrors.password = 'Informe sua senha.';
        }

        if (nextFieldErrors.email || nextFieldErrors.password) {
            setFieldErrors(nextFieldErrors);
            setFormError('');
            return;
        }

        setFieldErrors({});
        setFormError('');
        setIsLoading(true);

        try {
            const response = await axios.post(API_URL, {
                email: email.trim(),
                password: password.trim(),
            });

            const { token } = response.data;

            if (token) {
                await setAuthToken(token);
                router.replace('/dashboard' as never);
            } else {
                setFormError('O servidor respondeu sem token. Tente novamente.');
            }
        } catch (error) {
            let errorMessage = 'Erro ao conectar com o servidor';

            if (isAxiosError(error)) {
                if (error.response) {
                    errorMessage =
                        error.response.data?.message || 'Email ou senha inválidos. Tente novamente.';
                } else if (error.request) {
                    errorMessage = 'Erro de conexão. Verifique sua internet.';
                } else {
                    errorMessage = error.message;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            setFormError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Alert.alert('Recuperação de Senha', 'Recurso de recuperação em breve.');
    };

    const handleSignUp = () => {
        Alert.alert('Cadastro', 'Tela de cadastro em breve.');
    };

    const handleBiometric = () => {
        Alert.alert('Login Biométrico', 'Autenticação biométrica em breve.');
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
                                Welcome
                                {'\n'}
                                Back
                            </Text>
                            <Text style={styles.subtitle}>Sign in to manage your growth and assets securely.</Text>

                            {formError ? (
                                <View style={styles.errorBanner}>
                                    <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
                                    <Text style={styles.errorBannerText}>{formError}</Text>
                                </View>
                            ) : null}

                            <View style={styles.form}>
                                <LoginField
                                    icon="mail-outline"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Email Address"
                                    keyboardType="email-address"
                                    textContentType="emailAddress"
                                    editable={canSubmit}
                                    errorMessage={fieldErrors.email}
                                />

                                <LoginField
                                    icon="lock-closed-outline"
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Password"
                                    secureTextEntry={!isPasswordVisible}
                                    textContentType="password"
                                    editable={canSubmit}
                                    errorMessage={fieldErrors.password}
                                    rightAccessory={
                                        <Pressable
                                            hitSlop={10}
                                            disabled={!canSubmit}
                                            accessibilityRole="button"
                                            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                                            onPress={() => setIsPasswordVisible((current) => !current)}>
                                            <Ionicons
                                                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                                size={22}
                                                color={COLORS.fieldIcon}
                                            />
                                        </Pressable>
                                    }
                                />

                                <Pressable
                                    style={styles.forgotPassword}
                                    disabled={isLoading}
                                    onPress={handleForgotPassword}>
                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
                                    disabled={!canSubmit}
                                    onPress={handleLogin}>
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={COLORS.buttonText} />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Login</Text>
                                    )}
                                </Pressable>

                                <View style={styles.dividerRow}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>SECURITY VERIFIED</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <Pressable
                                    style={styles.biometricButton}
                                    disabled={!canSubmit}
                                    onPress={handleBiometric}>
                                    <Ionicons name="finger-print-outline" size={22} color={COLORS.biometricColor} />
                                    <Text style={styles.biometricButtonText}>Login with Biometrics</Text>
                                </Pressable>

                                <View style={styles.signUpRow}>
                                    <Text style={styles.signUpPrefix}>New to IS Financial? </Text>
                                    <Pressable disabled={!canSubmit} onPress={handleSignUp}>
                                        <Text style={styles.signUpAction}>Sign Up</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <View style={styles.footerLine}>
                                <Ionicons name="lock-closed" size={13} color={COLORS.footer} />
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
    error: '#C0392B',
    errorBackground: '#FBE9E7',
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
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.errorBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F2C7C3',
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 18,
    },
    errorBannerText: {
        flex: 1,
        color: COLORS.error,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    fieldWrapper: {
        marginBottom: 16,
    },
    field: {
        height: 58,
        borderRadius: 10,
        backgroundColor: COLORS.fieldBackground,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    fieldError: {
        borderWidth: 1,
        borderColor: COLORS.error,
        backgroundColor: COLORS.errorBackground,
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
    fieldErrorText: {
        marginTop: 6,
        color: COLORS.error,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
        paddingLeft: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -4,
        marginBottom: 18,
    },
    forgotPasswordText: {
        color: COLORS.signUp,
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '500',
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
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 28,
        marginBottom: 26,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.divider,
    },
    dividerText: {
        color: COLORS.dividerText,
        fontSize: 12,
        letterSpacing: 1.6,
        fontWeight: '600',
    },
    biometricButton: {
        height: 48,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.biometricBorder,
        backgroundColor: COLORS.biometricBackground,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    biometricButtonText: {
        color: '#2A2A2A',
        fontSize: 15,
        fontWeight: '500',
    },
    signUpRow: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    signUpPrefix: {
        color: COLORS.subtitle,
        fontSize: 14,
        lineHeight: 18,
    },
    signUpAction: {
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
