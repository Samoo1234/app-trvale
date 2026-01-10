// =============================================================================
// TRVALE DO BOI - Componente Button
// Botão reutilizável com estilo padrão vermelho
// =============================================================================

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, borderRadius, spacing, fontSize, shadows } from '../theme/colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'large',
    disabled = false,
    loading = false,
    style,
    textStyle,
    icon,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    const buttonStyles = [
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        isDisabled && styles.buttonDisabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
        isDisabled && styles.textDisabled,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? colors.primary : colors.white}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <Text style={textStyles}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        ...shadows.medium,
    },

    // Variantes
    button_primary: {
        backgroundColor: colors.primary,
    },
    button_secondary: {
        backgroundColor: colors.secondary,
    },
    button_outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    button_danger: {
        backgroundColor: colors.error,
    },

    // Tamanhos
    button_small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        minHeight: 36,
    },
    button_medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: 48,
    },
    button_large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        minHeight: 56,
    },

    // Estado desabilitado
    buttonDisabled: {
        backgroundColor: colors.gray400,
        opacity: 0.7,
    },

    // Texto
    text: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    text_primary: {
        color: colors.white,
    },
    text_secondary: {
        color: colors.white,
    },
    text_outline: {
        color: colors.primary,
    },
    text_danger: {
        color: colors.white,
    },
    text_small: {
        fontSize: fontSize.sm,
    },
    text_medium: {
        fontSize: fontSize.md,
    },
    text_large: {
        fontSize: fontSize.lg,
    },
    textDisabled: {
        color: colors.gray100,
    },
});
