import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type Movimentacao = {
    categoria: string;
    dataMovimentacao: string;
    descricao: string;
    valor: number;
    tag: string;
    tipo?: 1 | 2;
};

type ActivityRowProps = {
    item: Movimentacao;
    isLast: boolean;
};

const COLORS = {
    text: '#1D1D1B',
    textSoft: '#70675E',
    success: '#3F7D4F',
    danger: '#D33B2F',
    expenseTint: '#DDF3E0',
    incomeTint: '#C9ECE7',
    border: '#EEE6D9',
};

export function ActivityRow({ item, isLast }: ActivityRowProps) {
    const isExpense = item.tipo === 2 ? true : item.tipo === 1 ? false : item.valor < 0;
    const iconName = getActivityIcon(item.categoria);
    const accentColor = isExpense ? COLORS.danger : COLORS.success;
    const iconBackground = isExpense ? COLORS.expenseTint : COLORS.incomeTint;
    const valueLabel = `${isExpense ? '-' : '+'}${formatCurrency(Math.abs(item.valor))}`;

    return (
        <View style={[styles.row, !isLast && styles.rowDivider]}>
            <View style={[styles.icon, { backgroundColor: iconBackground }]}>
                <Ionicons name={iconName} size={23} color={accentColor} />
            </View>

            <View style={styles.info}>
                <Text style={styles.title}>{item.categoria}</Text>
                <Text style={styles.meta}>{buildActivityMeta(item)}</Text>
            </View>

            <Text style={[styles.value, { color: accentColor }]}>{valueLabel}</Text>
        </View>
    );
}

function buildActivityMeta(item: Movimentacao) {
    const metaParts: string[] = [];

    if (item.dataMovimentacao) {
        metaParts.push(formatMovimentacaoDate(item.dataMovimentacao));
    }

    if (item.descricao) {
        metaParts.push(item.descricao);
    }

    if (item.tag) {
        metaParts.push(`#${item.tag}`);
    }

    if (metaParts.length > 0) {
        return metaParts.join(' • ');
    }

    return item.valor < 0 ? 'Despesa' : 'Receita';
}

function getActivityIcon(categoria: string): keyof typeof Ionicons.glyphMap {
    const normalized = removeAccents(categoria.toLowerCase());

    if (normalized.includes('bonus') || normalized.includes('bônus')) {
        return 'gift-outline';
    }

    if (normalized.includes('sports') || normalized.includes('sport') || normalized.includes('esporte')) {
        return 'barbell-outline';
    }

    if (normalized.includes('clothing') || normalized.includes('roupa') || normalized.includes('vestuario')) {
        return 'shirt-outline';
    }

    if (normalized.includes('beauty') || normalized.includes('beleza')) {
        return 'sparkles-outline';
    }

    if (normalized.includes('industrial') || normalized.includes('industria')) {
        return 'construct-outline';
    }

    if (normalized.includes('comida') || normalized.includes('aliment') || normalized.includes('food')) {
        return 'fast-food-outline';
    }

    if (normalized.includes('salario') || normalized.includes('trabalho') || normalized.includes('work')) {
        return 'briefcase-outline';
    }

    if (normalized.includes('mercado') || normalized.includes('supermercado')) {
        return 'cart-outline';
    }

    if (normalized.includes('transporte') || normalized.includes('uber') || normalized.includes('bus')) {
        return 'bus-outline';
    }

    if (normalized.includes('casa') || normalized.includes('moradia') || normalized.includes('housing')) {
        return 'home-outline';
    }

    if (normalized.includes('saude') || normalized.includes('health')) {
        return 'medical-outline';
    }

    if (normalized.includes('lazer') || normalized.includes('entreten')) {
        return 'film-outline';
    }

    if (normalized.includes('receita') || normalized.includes('income')) {
        return 'cash-outline';
    }

    return 'card-outline';
}

function removeAccents(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function formatMovimentacaoDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 2,
    }).format(value);
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    rowDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        gap: 3,
    },
    title: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 22,
    },
    meta: {
        color: COLORS.textSoft,
        fontSize: 13,
        lineHeight: 18,
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 21,
    },
});