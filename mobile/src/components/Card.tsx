// =============================================================================
// TRVALE DO BOI - Componente Card
// Card reutilizável para exibir informações
// =============================================================================

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, fontSize, shadows } from '../theme/colors';

interface CardProps {
    title?: string;
    subtitle?: string;
    children?: ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    variant?: 'default' | 'highlight' | 'success' | 'warning';
}

export function Card({
    title,
    subtitle,
    children,
    style,
    onPress,
    variant = 'default',
}: CardProps) {
    const cardStyles = [
        styles.container,
        styles[`container_${variant}`],
        style,
    ];

    const content = (
        <>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {children}
        </>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                style={cardStyles}
                onPress={onPress}
                activeOpacity={0.9}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyles}>{content}</View>;
}

// Card para exibir estatística (valor grande + label)
interface StatCardProps {
    value: string | number;
    label: string;
    icon?: ReactNode;
    style?: ViewStyle;
    color?: string;
}

export function StatCard({ value, label, icon, style, color }: StatCardProps) {
    return (
        <View style={[styles.statContainer, style]}>
            {icon && <View style={styles.statIcon}>{icon}</View>}
            <Text style={[styles.statValue, color ? { color } : undefined]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// Card de viagem
interface TravelCardProps {
    origem: string;
    destino: string;
    data: string;
    km: string;
    qtdGado: number;
    status: 'finalizada' | 'em_andamento' | 'pendente';
    onPress?: () => void;
}

export function TravelCard({
    origem,
    destino,
    data,
    km,
    qtdGado,
    status,
    onPress,
}: TravelCardProps) {
    const statusColors = {
        finalizada: colors.success,
        em_andamento: colors.primary,
        pendente: colors.warning,
    };

    const statusLabels = {
        finalizada: 'Finalizada',
        em_andamento: 'Em Andamento',
        pendente: 'Pendente Sync',
    };

    return (
        <TouchableOpacity
            style={styles.travelCard}
            onPress={onPress}
            activeOpacity={0.9}
            disabled={!onPress}
        >
            <View style={styles.travelHeader}>
                <View style={styles.travelRoute}>
                    <Text style={styles.travelOrigin}>{origem}</Text>
                    <Text style={styles.travelArrow}>→</Text>
                    <Text style={styles.travelDestino}>{destino}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[status] }]}>
                    <Text style={styles.statusText}>{statusLabels[status]}</Text>
                </View>
            </View>

            <View style={styles.travelDetails}>
                <View style={styles.travelInfo}>
                    <Text style={styles.travelLabel}>Data</Text>
                    <Text style={styles.travelValue}>{data}</Text>
                </View>
                <View style={styles.travelInfo}>
                    <Text style={styles.travelLabel}>Distância</Text>
                    <Text style={styles.travelValue}>{km}</Text>
                </View>
                <View style={styles.travelInfo}>
                    <Text style={styles.travelLabel}>Cabeças</Text>
                    <Text style={styles.travelValue}>{qtdGado}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.medium,
    },
    container_default: {},
    container_highlight: {
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    container_success: {
        borderLeftWidth: 4,
        borderLeftColor: colors.success,
    },
    container_warning: {
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.sm,
        color: colors.gray600,
        marginBottom: spacing.md,
    },

    // Stat Card
    statContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        flex: 1,
        ...shadows.medium,
    },
    statIcon: {
        marginBottom: spacing.sm,
    },
    statValue: {
        fontSize: fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.gray600,
        marginTop: spacing.xs,
        textAlign: 'center',
    },

    // Travel Card
    travelCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.medium,
    },
    travelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    travelRoute: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        flexWrap: 'wrap',
    },
    travelOrigin: {
        fontSize: fontSize.md,
        fontWeight: 'bold',
        color: colors.black,
    },
    travelArrow: {
        fontSize: fontSize.lg,
        color: colors.primary,
        marginHorizontal: spacing.sm,
    },
    travelDestino: {
        fontSize: fontSize.md,
        fontWeight: 'bold',
        color: colors.black,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginLeft: spacing.sm,
    },
    statusText: {
        color: colors.white,
        fontSize: fontSize.xs,
        fontWeight: 'bold',
    },
    travelDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
        paddingTop: spacing.md,
    },
    travelInfo: {
        alignItems: 'center',
    },
    travelLabel: {
        fontSize: fontSize.xs,
        color: colors.gray600,
        marginBottom: spacing.xs,
    },
    travelValue: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.black,
    },
});
