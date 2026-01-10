// =============================================================================
// TRVALE DO BOI - Componente Header
// Cabeçalho vermelho padrão das telas
// =============================================================================

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '../theme/colors';

interface HeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightComponent?: React.ReactNode;
}

export function Header({
    title,
    subtitle,
    showBack = false,
    onBack,
    rightComponent,
}: HeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
                <View style={styles.content}>
                    {/* Botão voltar */}
                    {showBack && (
                        <TouchableOpacity style={styles.backButton} onPress={onBack}>
                            <Text style={styles.backIcon}>←</Text>
                        </TouchableOpacity>
                    )}

                    {/* Título e subtítulo */}
                    <View style={[styles.titleContainer, showBack && styles.titleWithBack]}>
                        <Text style={styles.title} numberOfLines={1}>
                            {title}
                        </Text>
                        {subtitle && (
                            <Text style={styles.subtitle} numberOfLines={1}>
                                {subtitle}
                            </Text>
                        )}
                    </View>

                    {/* Componente direito (opcional) */}
                    {rightComponent && (
                        <View style={styles.rightContainer}>{rightComponent}</View>
                    )}
                </View>
            </View>
        </>
    );
}

// Header simples para tela de login
export function LogoHeader() {
    const insets = useSafeAreaInsets();

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            <View style={[styles.logoContainer, { paddingTop: insets.top + spacing.xl }]}>
                <Text style={styles.logoText}>TRVALE</Text>
                <Text style={styles.logoSubtext}>DO BOI</Text>
                <Text style={styles.logoTagline}>TRANSPORTADORA</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
        marginLeft: -spacing.sm,
    },
    backIcon: {
        fontSize: 24,
        color: colors.white,
        fontWeight: 'bold',
    },
    titleContainer: {
        flex: 1,
    },
    titleWithBack: {
        marginLeft: spacing.xs,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.white,
    },
    subtitle: {
        fontSize: fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: spacing.xs,
    },
    rightContainer: {
        marginLeft: spacing.md,
    },

    // Logo Header
    logoContainer: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        paddingBottom: spacing.xxl,
    },
    logoText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.white,
        letterSpacing: 4,
    },
    logoSubtext: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
        marginTop: -spacing.sm,
        letterSpacing: 2,
    },
    logoTagline: {
        fontSize: fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: spacing.sm,
        letterSpacing: 3,
    },
});
