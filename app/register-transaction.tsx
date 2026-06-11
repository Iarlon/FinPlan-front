import { Ionicons } from '@expo/vector-icons';
import axios, { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { API_BASE_URL } from '../lib/api';
import { getAuthToken } from '../lib/auth-storage';

const API_URL = `${API_BASE_URL}/movimentacoes`;

const CATEGORIES_LIST = [
    { id: 1, descricao: "Alimentacao", tipo: 2, icon: "restaurant-outline" },
    { id: 2, descricao: "Moradia", tipo: 2, icon: "home-outline" },
    { id: 3, descricao: "Transporte", tipo: 2, icon: "bus-outline" },
    { id: 4, descricao: "Lazer", tipo: 2, icon: "game-controller-outline" },
    { id: 5, descricao: "Saude", tipo: 2, icon: "medical-outline" },
    { id: 6, descricao: "Educacao", tipo: 2, icon: "book-outline" },
    { id: 7, descricao: "Investimentos", tipo: 2, icon: "trending-up-outline" },
    { id: 998, descricao: "Outros", tipo: 2, icon: "ellipsis-horizontal-circle-outline" },
    { id: 100, descricao: "Salario", tipo: 1, icon: "cash-outline" },
    { id: 101, descricao: "Bonus", tipo: 1, icon: "gift-outline" },
    { id: 102, descricao: "Comissao", tipo: 1, icon: "pie-chart-outline" },
    { id: 103, descricao: "HoraExtra", tipo: 1, icon: "time-outline" },
    { id: 104, descricao: "Freelance", tipo: 1, icon: "laptop-outline" },
    { id: 107, descricao: "Transferencias", tipo: 1, icon: "swap-horizontal-outline" },
    { id: 108, descricao: "Vendas", tipo: 1, icon: "cart-outline" },
    { id: 109, descricao: "Servicos", tipo: 1, icon: "construct-outline" },
    { id: 999, descricao: "Outros", tipo: 1, icon: "ellipsis-horizontal-circle-outline" },
];

type InputFieldProps = {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric';
    editable?: boolean;
    errorMessage?: string;
    onPress?: () => void;
    isPicker?: boolean;
};

function InputField({
    icon,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    editable = true,
    errorMessage,
    onPress,
    isPicker,
}: InputFieldProps) {
    const Container = onPress ? Pressable : View;

    return (
        <View style={styles.fieldWrapper}>
            <Container 
                onPress={onPress}
                style={[styles.field, errorMessage && styles.fieldError]}
            >
                <Ionicons name={icon} size={18} color={COLORS.fieldIcon} style={styles.fieldIcon} />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType={keyboardType}
                    editable={onPress ? false : editable}
                    pointerEvents={onPress ? "none" : "auto"}
                    style={styles.fieldInput}
                />
                {isPicker && (
                    <Ionicons name="chevron-down" size={18} color={COLORS.fieldIcon} />
                )}
            </Container>
            {errorMessage ? <Text style={styles.fieldErrorText}>{errorMessage}</Text> : null}
        </View>
    );
}

export default function RegisterTransactionScreen() {
    const [tipo, setTipo] = useState<1 | 2>(2);
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [dataStr, setDataStr] = useState(new Date().toLocaleDateString('pt-BR'));
    const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES_LIST[0] | null>(null);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [tag, setTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ descricao?: string; valor?: string; categoria?: string }>({});

    const filteredCategories = useMemo(() => 
        CATEGORIES_LIST.filter(cat => cat.tipo === tipo), 
    [tipo]);

    const handleTypeChange = (newType: 1 | 2) => {
        setTipo(newType);
        setSelectedCategory(null);
    };

    const handleRegister = async () => {
        const nextFieldErrors: { descricao?: string; valor?: string; categoria?: string } = {};

        if (!descricao.trim()) nextFieldErrors.descricao = 'Informe a descrição.';
        if (!valor.trim()) nextFieldErrors.valor = 'Informe o valor.';
        if (!selectedCategory) nextFieldErrors.categoria = 'Selecione uma categoria.';

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            return;
        }

        setFieldErrors({});
        setIsLoading(true);

        try {
            const token = await getAuthToken();
            
            // Converte data pt-BR para ISO
            const [day, month, year] = dataStr.split('/');
            const dataMovimentacao = new Date(`${year}-${month}-${day}T12:00:00Z`).toISOString();

            const response = await axios.post(
                API_URL,
                {
                    descricao: descricao.trim(),
                    valor: parseFloat(valor.replace(',', '.')),
                    dataMovimentacao,
                    categoriaId: selectedCategory?.id,
                    tag: tag.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 201 || response.status === 200) {
                Alert.alert('Sucesso', 'Movimentação registrada com sucesso!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            let errorMessage = 'Erro ao conectar com o servidor';

            if (isAxiosError(error) && error.response?.status === 401) {
                Alert.alert('Sessão Expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
                router.replace('/(auth)/login');
                return;
            }

            if (isAxiosError(error)) {
                errorMessage = error.response?.data?.message || 'Erro ao registrar. Tente novamente.';
            }

            Alert.alert('Falha no registro', errorMessage);
        } finally {
            setIsLoading(false);
        }
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
                        <View style={styles.header}>
                            <Pressable onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color={COLORS.brand} />
                            </Pressable>
                            <View style={styles.brandContainer} />
                            
                            <View style={styles.typeToggle}>
                                <Pressable 
                                    onPress={() => handleTypeChange(2)}
                                    style={[styles.typeButton, tipo === 2 && styles.typeButtonExpense]}
                                >
                                    <Text style={[styles.typeButtonText, tipo === 2 && styles.typeButtonTextActive]}>
                                        Despesa
                                    </Text>
                                </Pressable>
                                <Pressable 
                                    onPress={() => handleTypeChange(1)}
                                    style={[styles.typeButton, tipo === 1 && styles.typeButtonIncome]}
                                >
                                    <Text style={[styles.typeButtonText, tipo === 1 && styles.typeButtonTextActive]}>
                                        Receita
                                    </Text>
                                </Pressable>
                            </View>
                            <View style={styles.headerSpacer} />
                        </View>

                        <Text style={styles.brand}>FinPlan</Text>

                        <View style={styles.sectionCard}>
                            <Text style={styles.title}>Nova{'\n'}Transação</Text>
                            <Text style={styles.subtitle}>
                                {tipo === 1 ? 'Registre uma nova entrada.' : 'Registre uma nova saída.'}
                            </Text>

                            <View style={styles.form}>
                                <InputField
                                    icon="document-text-outline"
                                    value={descricao}
                                    onChangeText={setDescricao}
                                    placeholder="Descrição (ex: Salário)"
                                    editable={!isLoading}
                                    errorMessage={fieldErrors.descricao}
                                />

                                <InputField
                                    icon="cash-outline"
                                    value={valor}
                                    onChangeText={setValor}
                                    placeholder="Valor (ex: 250.00)"
                                    keyboardType="numeric"
                                    editable={!isLoading}
                                    errorMessage={fieldErrors.valor}
                                />

                                <InputField
                                    icon="calendar-outline"
                                    value={dataStr}
                                    onChangeText={setDataStr}
                                    placeholder="Data (DD/MM/AAAA)"
                                    editable={!isLoading}
                                />

                                <InputField
                                    icon="list-circle-outline"
                                    value={selectedCategory?.descricao || ''}
                                    onChangeText={() => {}}
                                    placeholder="Selecionar Categoria"
                                    onPress={() => setIsCategoryModalVisible(true)}
                                    isPicker
                                    errorMessage={fieldErrors.categoria}
                                />

                                <InputField
                                    icon="pricetag-outline"
                                    value={tag}
                                    onChangeText={setTag}
                                    placeholder="Tag ou Observação"
                                    editable={!isLoading}
                                />

                                <Pressable
                                    style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled, { marginTop: 12 }]}
                                    disabled={isLoading}
                                    onPress={handleRegister}>
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={COLORS.buttonText} />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Registrar Movimentação</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <Modal
                    visible={isCategoryModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsCategoryModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Selecione a Categoria</Text>
                            <FlatList
                                data={filteredCategories}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <Pressable 
                                        style={styles.categoryItem} 
                                        onPress={() => {
                                            setSelectedCategory(item);
                                            setIsCategoryModalVisible(false);
                                        }}
                                    >
                                        <Ionicons name={item.icon as any} size={22} color={COLORS.brand} />
                                        <Text style={styles.categoryItemText}>{item.descricao}</Text>
                                    </Pressable>
                                )}
                            />
                            <Pressable onPress={() => setIsCategoryModalVisible(false)} style={styles.modalCloseButton}>
                                <Text style={styles.modalCloseButtonText}>Fechar</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const COLORS = {
    background: '#F4F0E8',
    brand: '#426C45',
    surface: '#FFFFFF',
    title: '#1F1F1F',
    subtitle: '#67635B',
    fieldBackground: '#F0EBE4',
    fieldIcon: '#67635B',
    placeholder: '#80776E',
    inputText: '#2A2A2A',
    primaryButton: '#3C6F44',
    primaryButtonDisabled: '#A8C8B0',
    brandDeep: '#295A3A',
    buttonText: '#FFFFFF',
    income: '#1E7462',
    expense: '#D33B2F',
    error: '#C0392B',
    errorBackground: '#FBE9E7',
    border: '#EEE6D9',
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    keyboardAvoidingView: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    screen: { flex: 1, paddingHorizontal: 20, paddingTop: 12, gap: 18 },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 8 
    },
    backButton: { padding: 4, minWidth: 40 },
    headerSpacer: { minWidth: 40 },
    brandContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: -1 },
    typeToggle: { 
        flexDirection: 'row', 
        backgroundColor: '#EBE6DA', 
        borderRadius: 14, 
        padding: 4,
        alignSelf: 'center'
    },
    typeButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
    typeButtonExpense: { backgroundColor: COLORS.expense },
    typeButtonIncome: { backgroundColor: COLORS.income },
    typeButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.subtitle },
    typeButtonTextActive: { color: '#FFF' },
    brand: { 
        color: COLORS.brand, 
        fontSize: 24, 
        fontWeight: '700', 
        letterSpacing: -0.4,
        marginBottom: 2 
    },
    sectionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#2E2418',
        shadowOpacity: 0.06,
        shadowRadius: 18,
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 28,
        elevation: 6,
    },
    title: { color: COLORS.title, fontSize: 42, lineHeight: 42, fontWeight: '800', letterSpacing: -1.2 },
    subtitle: { marginTop: 14, color: COLORS.subtitle, fontSize: 16, lineHeight: 22 },
    form: { marginTop: 24 },
    fieldWrapper: { marginBottom: 16 },
    field: {
        height: 58,
        borderRadius: 10,
        backgroundColor: COLORS.fieldBackground,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    fieldError: { borderWidth: 1, borderColor: COLORS.error, backgroundColor: COLORS.errorBackground },
    fieldIcon: { marginRight: 10 },
    fieldInput: { flex: 1, fontSize: 15, color: COLORS.inputText },
    fieldErrorText: { marginTop: 6, color: COLORS.error, fontSize: 12, fontWeight: '500', paddingLeft: 4 },
    primaryButton: {
        height: 56,
        borderRadius: 999,
        backgroundColor: COLORS.primaryButton,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonDisabled: { backgroundColor: COLORS.primaryButtonDisabled },
    primaryButtonText: { color: COLORS.buttonText, fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
    modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.title, marginBottom: 16 },
    categoryItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#F0F0F0',
        gap: 12
    },
    categoryItemText: { fontSize: 16, color: COLORS.inputText },
    modalCloseButton: { marginTop: 16, padding: 16, alignItems: 'center' },
    modalCloseButtonText: { color: COLORS.brand, fontWeight: '700', fontSize: 16 },
});