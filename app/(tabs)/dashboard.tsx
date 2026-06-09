import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios, { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, Line, Path, Svg, Text as SvgText } from 'react-native-svg';
import { ActivityRow } from '../../components/ui/activity-row';
import { API_BASE_URL } from '../../lib/api';
import { getAuthToken } from '../../lib/auth-storage';

const MOVIMENTACOES_API_URL = `${API_BASE_URL}/movimentacoes/recentes`;
const ORCAMENTO_API_URL = `${API_BASE_URL}/orcamento`;
const MOVIMENTACOES_GRAFICO_API_URL = `${API_BASE_URL}/movimentacoes?pageNumber=1&pageSize=60`;
const CATEGORIAS_API_URL = `${API_BASE_URL}/movimentacoes/categorias`;

interface Movimentacao {
    categoria: string;
    dataMovimentacao: string;
    descricao: string;
    valor: number;
    tag: string;
}

interface Tendencia {
    data: string;
    valor: number;
}

interface MovimentacaoGraficoApiResponseItem {
    dataMovimentacao: string;
    valor: number | string;
}

interface MovimentacoesGraficoApiResponse {
    data: MovimentacaoGraficoApiResponseItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

type GraficoMovimentacao = {
    data: string;
    valor: number;
};

type CategoriaGrafico = {
    categoria: string;
    value: number;
    color: string;
};

type CategoriasApiResponseItem = {
    categoria: string;
    valor: number | string;
};

type OrcamentoApiResponse =
    | number
    | string
    | {
        total?: number | string;
        valor?: number | string;
        saldo?: number | string;
        orcamento?: number | string;
        value?: number | string;
        amount?: number | string;
        data?: {
            total?: number | string;
            valor?: number | string;
            saldo?: number | string;
            orcamento?: number | string;
            value?: number | string;
            amount?: number | string;
        };
    };

type ChartPoint = {
    label: string;
    value: number;
};

type CategoryLegendRowProps = {
    label: string;
    value: number;
    color: string;
};

const CATEGORY_COLORS = ['#3F6F45', '#1E7462', '#2E5F4F', '#5C8F63', '#7BAA84'];

const COLORS = {
    background: '#F4F0E8',
    surface: '#FFFFFF',
    surfaceMuted: '#F0EBE1',
    text: '#1D1D1B',
    textSoft: '#70675E',
    brand: '#3C6F44',
    brandDeep: '#295A3A',
    success: '#3F7D4F',
    danger: '#D33B2F',
    expenseTint: '#DDF3E0',
    incomeTint: '#C9ECE7',
    border: '#EEE6D9',
};

const BALANCE_DELTA_TEXT = '+2.4% this month';

export default function DashboardScreen() {
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [isLoadingMovimentacoes, setIsLoadingMovimentacoes] = useState(true);
    const [movimentacoesError, setMovimentacoesError] = useState('');
    const [tendencia, setTendencia] = useState<Tendencia[]>([]);
    const [totalPortfolioBalance, setTotalPortfolioBalance] = useState(0);
    const [categoriasGrafico, setCategoriasGrafico] = useState<CategoriaGrafico[]>([]);
    const [isLoadingCategorias, setIsLoadingCategorias] = useState(true);
    const [categoriasError, setCategoriasError] = useState('');
    const [isLoadingTendencia, setIsLoadingTendencia] = useState(true);
    const [tendenciaError, setTendenciaError] = useState('');

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            const fetchMovimentacoes = async () => {
                setIsLoadingMovimentacoes(true);
                setMovimentacoesError('');

                try {
                    const token = await getAuthToken();
                    const response = await axios.get<Movimentacao[]>(
                        MOVIMENTACOES_API_URL,
                        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
                    );

                    if (isMounted) {
                        const nextMovimentacoes = Array.isArray(response.data) ? response.data : [];

                        setMovimentacoes(nextMovimentacoes);
                    }
                } catch (error) {
                    if (isMounted) {
                        setMovimentacoes([]);

                        if (isAxiosError(error) && error.response?.status === 401) {
                            router.replace('/(auth)/login');
                            return;
                        }

                        if (isAxiosError(error)) {
                            setMovimentacoesError(
                                error.response?.data?.message || 'Não foi possível carregar as movimentações.',
                            );
                        } else if (error instanceof Error) {
                            setMovimentacoesError(error.message);
                        } else {
                            setMovimentacoesError('Não foi possível carregar as movimentações.');
                        }
                    }

                    console.error('Erro ao carregar movimentações:', error);
                } finally {
                    if (isMounted) {
                        setIsLoadingMovimentacoes(false);
                    }
                }
            };

            const fetchOrcamento = async () => {
                try {
                    const token = await getAuthToken();
                    const response = await axios.get<OrcamentoApiResponse>(
                        ORCAMENTO_API_URL,
                        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
                    );

                    if (isMounted) {
                        setTotalPortfolioBalance(extractBudgetValue(response.data));
                    }
                } catch (error) {
                    if (isMounted) {
                        setTotalPortfolioBalance(0);
                    }

                    console.error('Erro ao carregar orçamento:', error);
                }
            };

            const fetchCategorias = async () => {
                setIsLoadingCategorias(true);
                setCategoriasError('');

                try {
                    const token = await getAuthToken();
                    const response = await axios.get<CategoriasApiResponseItem[]>(
                        CATEGORIAS_API_URL,
                        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
                    );

                    if (isMounted) {
                        const rawItems = Array.isArray(response.data) ? response.data : [];
                        const nextCategorias = rawItems
                            .map((item, index) => ({
                                categoria: item.categoria,
                                value: Number(item.valor),
                                color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                            }))
                            .sort((a, b) => b.value - a.value);

                        setCategoriasGrafico(nextCategorias);
                    }
                } catch (error) {
                    if (isMounted) {
                        setCategoriasGrafico([]);

                        if (isAxiosError(error)) {
                            setCategoriasError(error.response?.data?.message || 'Não foi possível carregar as categorias.');
                        } else if (error instanceof Error) {
                            setCategoriasError(error.message);
                        } else {
                            setCategoriasError('Não foi possível carregar as categorias.');
                        }
                    }

                    console.error('Erro ao carregar categorias:', error);
                } finally {
                    if (isMounted) {
                        setIsLoadingCategorias(false);
                    }
                }
            };

            const fetchTendencia = async () => {
                setIsLoadingTendencia(true);
                setTendenciaError('');

                try {
                    const token = await getAuthToken();
                    const response = await axios.get<MovimentacoesGraficoApiResponse>(
                        MOVIMENTACOES_GRAFICO_API_URL,
                        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
                    );

                    if (isMounted) {
                        const rawItems = Array.isArray(response.data?.data) ? response.data.data.slice(0, 12) : [];
                        const graficoMovimentacoes: GraficoMovimentacao[] = rawItems.map((item) => ({
                            data: item.dataMovimentacao,
                            valor: Number(item.valor),
                        }));

                        setTendencia(groupTrendByMonth(graficoMovimentacoes));
                    }
                } catch (error) {
                    if (isMounted) {
                        setTendencia([]);

                        if (isAxiosError(error) && error.response?.status === 401) {
                            router.replace('/(auth)/login');
                            return;
                        }

                        if (isAxiosError(error)) {
                            setTendenciaError(error.response?.data?.message || 'Não foi possível carregar o gráfico.');
                        } else if (error instanceof Error) {
                            setTendenciaError(error.message);
                        } else {
                            setTendenciaError('Não foi possível carregar o gráfico.');
                        }
                    }

                    console.error('Erro ao carregar gráfico:', error);
                } finally {
                    if (isMounted) {
                        setIsLoadingTendencia(false);
                    }
                }
            };

            fetchMovimentacoes();
            fetchOrcamento();
            fetchTendencia();
            fetchCategorias();

            return () => {
                isMounted = false;
            };
        }, []),
    );

    const chartData = useMemo(
        () => tendencia.map((item) => ({
            label: formatMonthShort(item.data),
            value: item.valor,
        })),
        [tendencia],
    );

    const categoryBreakdown = useMemo(() => categoriasGrafico, [categoriasGrafico]);
    const totalCategories = categoryBreakdown.reduce((sum, item) => sum + item.value, 0);
    const mainCategoryPercent = totalCategories > 0
        ? Math.round(((categoryBreakdown[0]?.value ?? 0) / totalCategories) * 100)
        : 0;

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.avatarWrap}>
                            <Text style={styles.avatarInitials}>LF</Text>
                        </View>
                        <Text style={styles.brand}>FinPlan</Text>
                    </View>

                    <View style={styles.balanceCard}>
                        <Text style={styles.cardLabel}>Total Portfolio Balance</Text>
                        <Text style={styles.balanceValue}>{formatCurrency(totalPortfolioBalance)}</Text>
                        <View style={styles.deltaPill}>
                            <Ionicons name="trending-up-outline" size={13} color={COLORS.success} />
                            <Text style={styles.deltaText}>{BALANCE_DELTA_TEXT}</Text>
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Spending Trend</Text>
                            <Text style={styles.sectionMeta}>By Month</Text>
                        </View>
                        <View style={styles.chartContainer}>
                            {isLoadingTendencia ? (
                                <View style={styles.activityLoadingState}>
                                    <ActivityIndicator size="small" color={COLORS.brand} />
                                    <Text style={styles.activityLoadingText}>Carregando gráfico...</Text>
                                </View>
                            ) : tendenciaError ? (
                                <View style={styles.activityEmptyState}>
                                    <Ionicons name="alert-circle-outline" size={20} color={COLORS.textSoft} />
                                    <Text style={styles.activityEmptyText}>{tendenciaError}</Text>
                                </View>
                            ) : (
                                <AutoSizeLineChart data={chartData} />
                            )}
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>By Category</Text>

                        <View style={styles.categoryContent}>
                            {isLoadingCategorias ? (
                                <View style={styles.activityLoadingState}>
                                    <ActivityIndicator size="small" color={COLORS.brand} />
                                    <Text style={styles.activityLoadingText}>Carregando categorias...</Text>
                                </View>
                            ) : categoriasError ? (
                                <View style={styles.activityEmptyState}>
                                    <Ionicons name="alert-circle-outline" size={20} color={COLORS.textSoft} />
                                    <Text style={styles.activityEmptyText}>{categoriasError}</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.donutWrap}>
                                        <Svg width={190} height={190}>
                                            <Circle
                                                cx="95"
                                                cy="95"
                                                r="72"
                                                stroke={COLORS.surfaceMuted}
                                                strokeWidth="14"
                                                fill="transparent"
                                            />
                                            {categoryBreakdown.map((item, index) => {
                                                const circumference = 2 * Math.PI * 72;
                                                const previousTotal = categoryBreakdown
                                                    .slice(0, index)
                                                    .reduce((sum, current) => sum + current.value, 0);
                                                const segmentLength = totalCategories > 0 ? (item.value / totalCategories) * circumference : 0;
                                                const dashOffset = totalCategories > 0
                                                    ? -(previousTotal / totalCategories) * circumference
                                                    : 0;

                                                return (
                                                    <Circle
                                                        key={item.categoria}
                                                        cx="95"
                                                        cy="95"
                                                        r="72"
                                                        stroke={item.color}
                                                        strokeWidth="14"
                                                        fill="transparent"
                                                        strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                                                        strokeDashoffset={dashOffset}
                                                        strokeLinecap="round"
                                                        rotation="-90"
                                                        origin="95, 95"
                                                    />
                                                );
                                            })}
                                        </Svg>
                                        <View style={styles.donutCenter}>
                                            <Text style={styles.donutPercent}>{mainCategoryPercent}%</Text>
                                        </View>
                                    </View>

                                    <View style={styles.categoryLegend}>
                                        {categoryBreakdown.map((item) => (
                                            <CategoryLegendRow key={item.categoria} label={item.categoria} value={item.value} color={item.color} />
                                        ))}
                                        <CategoryLegendRow label="Total" value={totalCategories} color={COLORS.brand} />
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    <View style={styles.activityHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <Pressable
                            style={styles.actionButton}
                            onPress={() => router.push('/register-transaction' as never)}
                        >
                            <Ionicons name="add" size={18} color={COLORS.surface} />
                            <Text style={styles.actionButtonText}>New Transaction</Text>
                        </Pressable>
                    </View>

                    <View style={styles.activityCard}>
                        {isLoadingMovimentacoes ? (
                            <View style={styles.activityLoadingState}>
                                <ActivityIndicator size="small" color={COLORS.brand} />
                                <Text style={styles.activityLoadingText}>Carregando movimentações...</Text>
                            </View>
                        ) : movimentacoesError ? (
                            <View style={styles.activityEmptyState}>
                                <Ionicons name="alert-circle-outline" size={20} color={COLORS.textSoft} />
                                <Text style={styles.activityEmptyText}>{movimentacoesError}</Text>
                            </View>
                        ) : movimentacoes.length > 0 ? (
                            movimentacoes.map((item, index) => (
                                <ActivityRow
                                    key={`${item.categoria}-${item.dataMovimentacao}-${index}`}
                                    item={item}
                                    isLast={index === movimentacoes.length - 1}
                                />
                            ))
                        ) : (
                            <View style={styles.activityEmptyState}>
                                <Ionicons name="document-text-outline" size={20} color={COLORS.textSoft} />
                                <Text style={styles.activityEmptyText}>Nenhuma movimentação encontrada.</Text>
                            </View>
                        )}
                    </View>

                    <Pressable
                        style={styles.viewAllButton}
                        onPress={() => Alert.alert('Transactions', 'Lista completa em breve.')}
                    >
                        <Text style={styles.viewAllText}>View All Transactions</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function CategoryLegendRow({ label, value, color }: CategoryLegendRowProps) {
    return (
        <View style={styles.legendRow}>
            <View style={styles.legendLabelWrap}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendLabel}>{label}</Text>
            </View>
            <Text style={styles.legendValue}>{formatCurrency(value)}</Text>
        </View>
    );
}

function extractBudgetValue(response: OrcamentoApiResponse) {
    if (typeof response === 'number') {
        return response;
    }

    if (typeof response === 'string') {
        return Number(response) || 0;
    }

    const candidateValues = [
        response.total,
        response.valor,
        response.saldo,
        response.orcamento,
        response.value,
        response.amount,
        response.data?.total,
        response.data?.valor,
        response.data?.saldo,
        response.data?.orcamento,
        response.data?.value,
        response.data?.amount,
    ];

    for (const candidate of candidateValues) {
        if (candidate !== undefined && candidate !== null) {
            const parsedValue = Number(candidate);

            if (!Number.isNaN(parsedValue)) {
                return parsedValue;
            }
        }
    }

    return 0;
}



function groupTrendByMonth(items: GraficoMovimentacao[]) {
    const monthlyTotals = new Map<string, number>();
    const parsedItems = items
        .map((item) => ({
            ...item,
            parsedDate: new Date(item.data),
        }))
        .filter((item) => !Number.isNaN(item.parsedDate.getTime()));

    parsedItems.forEach((item) => {
        const monthKey = toMonthKey(item.data);
        const currentTotal = monthlyTotals.get(monthKey) ?? 0;
        monthlyTotals.set(monthKey, currentTotal + item.valor);
    });

    const sortedMonths = Array.from(monthlyTotals.keys()).sort();

    if (sortedMonths.length === 0) {
        return [];
    }

    const expandedMonths = expandMonthRange(sortedMonths[0], sortedMonths[sortedMonths.length - 1]);

    return expandedMonths.map((monthKey) => ({
        data: `${monthKey}-01`,
        valor: monthlyTotals.get(monthKey) ?? 0,
    }));
}

function expandMonthRange(startMonthKey: string, endMonthKey: string) {
    const months: string[] = [];
    const current = new Date(`${startMonthKey}-01T00:00:00`);
    const end = new Date(`${endMonthKey}-01T00:00:00`);

    while (current <= end) {
        months.push(current.toISOString().slice(0, 7));
        current.setMonth(current.getMonth() + 1);
    }

    return months;
}

function toMonthKey(value: string) {
    return value.slice(0, 7);
}

function formatMonthShort(value: string) {
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat('pt-BR', { month: 'short' })
        .format(date)
        .replace('.', '')
        .replace(/\s/g, '.');
}



function AutoSizeLineChart({ data }: { data: ChartPoint[] }) {
    const [containerWidth, setContainerWidth] = useState(0);
    const pointCount = data.length;
    const chartWidth = Math.max(containerWidth, 0);
    const chartHeight = 220;
    const leftPadding = 44;
    const rightPadding = 18;
    const topPadding = 18;
    const bottomPadding = 36;

    const values = data.map((item) => item.value);
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);
    const valueRange = Math.max(maxValue - minValue, 1);
    const innerWidth = Math.max(chartWidth - leftPadding - rightPadding, 1);
    const innerHeight = Math.max(chartHeight - topPadding - bottomPadding, 1);
    const stepX = pointCount > 1 ? innerWidth / (pointCount - 1) : innerWidth;

    const points = data.map((item, index) => {
        const x = leftPadding + index * stepX;
        const normalizedValue = (item.value - minValue) / valueRange;
        const y = topPadding + innerHeight - normalizedValue * innerHeight;

        return { ...item, x, y };
    });

    const linePath = buildSmoothLinePath(points);

    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${topPadding + innerHeight} L ${points[0].x} ${topPadding + innerHeight} Z`
        : '';

    const gridLines = [0, 0.33, 0.66, 1].map((ratio) => {
        const y = topPadding + innerHeight - ratio * innerHeight;
        const value = minValue + ratio * valueRange;

        return { y, value };
    });

    return (
        <View
            style={styles.chartWrapper}
            onLayout={(event) => {
                setContainerWidth(event.nativeEvent.layout.width);
            }}
        >
            {containerWidth > 0 ? (
                <Svg width={chartWidth} height={chartHeight} style={styles.chartSvg}>
                    {gridLines.map((line, index) => (
                        <Line
                            key={index}
                            x1={leftPadding}
                            y1={line.y}
                            x2={chartWidth - rightPadding}
                            y2={line.y}
                            stroke={COLORS.surfaceMuted}
                            strokeWidth={1}
                            strokeDasharray="4 4"
                        />
                    ))}
                    {areaPath ? (
                        <Path d={areaPath} fill="rgba(60, 111, 68, 0.10)" stroke="none" />
                    ) : null}
                    {linePath ? (
                        <Path d={linePath} fill="none" stroke={COLORS.brand} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
                    ) : null}
                    {points.map((point, index) => (
                        <Circle key={index} cx={point.x} cy={point.y} r={4.5} fill={COLORS.brandDeep} />
                    ))}
                    {gridLines.map((line, index) => (
                        <SvgText
                            key={`y-${index}`}
                            x={leftPadding - 8}
                            y={line.y + 4}
                            fontSize="11"
                            fill={COLORS.textSoft}
                            textAnchor="end"
                        >
                            {formatChartCurrency(line.value)}
                        </SvgText>
                    ))}
                    {points.map((point, index) => (
                        <SvgText
                            key={`x-${index}`}
                            x={point.x}
                            y={chartHeight - 12}
                            fontSize="11"
                            fill={COLORS.textSoft}
                            textAnchor="middle"
                        >
                            {point.label}
                        </SvgText>
                    ))}
                </Svg>
            ) : null}
        </View>
    );
}



function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 2,
    }).format(value);
}

function formatChartCurrency(value: number) {
    const absoluteValue = Math.abs(value);

    if (absoluteValue >= 1000) {
        const compact = (value / 1000).toFixed(1).replace('.', ',');
        return `R$ ${compact} mil`;
    }

    return `R$ ${Math.round(value)}`;
}

function buildSmoothLinePath(points: { x: number; y: number }[]) {
    if (points.length === 0) {
        return '';
    }

    if (points.length === 1) {
        return `M ${points[0].x} ${points[0].y}`;
    }

    const pathCommands = [`M ${points[0].x} ${points[0].y}`];

    for (let index = 0; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];
        const previous = points[index - 1] ?? current;
        const afterNext = points[index + 2] ?? next;

        const controlPoint1X = current.x + (next.x - previous.x) / 6;
        const controlPoint1Y = current.y + (next.y - previous.y) / 6;
        const controlPoint2X = next.x - (afterNext.x - current.x) / 6;
        const controlPoint2Y = next.y - (afterNext.y - current.y) / 6;

        pathCommands.push(
            `C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${next.x} ${next.y}`,
        );
    }

    return pathCommands.join(' ');
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 18,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingBottom: 2,
    },
    avatarWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.brandDeep,
        borderWidth: 1,
        borderColor: COLORS.surface,
    },
    avatarInitials: {
        color: COLORS.surface,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    brand: {
        color: COLORS.brand,
        fontSize: 24,
        lineHeight: 28,
        fontWeight: '700',
        letterSpacing: -0.4,
    },
    balanceCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 18,
        shadowColor: '#2E2418',
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardLabel: {
        color: COLORS.textSoft,
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 6,
    },
    balanceValue: {
        color: COLORS.brand,
        fontSize: 42,
        lineHeight: 48,
        fontWeight: '800',
        letterSpacing: -1.1,
    },
    deltaPill: {
        alignSelf: 'flex-start',
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: COLORS.expenseTint,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    deltaText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '600',
    },
    sectionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 18,
        overflow: 'hidden',
        shadowColor: '#2E2418',
        shadowOpacity: 0.05,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 24,
        lineHeight: 29,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    sectionMeta: {
        color: COLORS.brand,
        fontSize: 14,
        fontWeight: '500',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    chartWrapper: {
        width: '100%',
        minHeight: 220,
    },
    chartSvg: {
        alignSelf: 'stretch',
    },
    categoryContent: {
        marginTop: 6,
        alignItems: 'center',
        gap: 14,
    },
    donutWrap: {
        width: 190,
        height: 190,
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        paddingHorizontal: 6,
    },
    donutPercent: {
        color: COLORS.brand,
        fontSize: 28,
        lineHeight: 32,
        fontWeight: '800',
        textAlign: 'center',
    },
    donutLabel: {
        color: COLORS.textSoft,
        fontSize: 13,
        marginTop: 2,
        textAlign: 'center',
    },
    categoryLegend: {
        width: '100%',
        gap: 12,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    legendLabelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    legendDot: {
        width: 9,
        height: 9,
        borderRadius: 999,
    },
    legendLabel: {
        color: COLORS.text,
        fontSize: 15,
        lineHeight: 20,
    },
    legendValue: {
        color: COLORS.text,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '500',
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.brand,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        shadowColor: COLORS.brandDeep,
        shadowOpacity: 0.22,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
    },
    actionButtonText: {
        color: COLORS.surface,
        fontSize: 14,
        fontWeight: '600',
    },
    activityCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#2E2418',
        shadowOpacity: 0.05,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 2,
    },
    activityLoadingState: {
        minHeight: 92,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    activityLoadingText: {
        color: COLORS.textSoft,
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
    },
    activityEmptyState: {
        minHeight: 92,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    activityEmptyText: {
        flexShrink: 1,
        color: COLORS.textSoft,
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
    },
    viewAllButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    viewAllText: {
        color: COLORS.brand,
        fontSize: 15,
        fontWeight: '600',
    },
});
