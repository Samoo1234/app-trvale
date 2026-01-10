// =============================================================================
// TRVALE DO BOI - Componente Input
// Campo de entrada reutilizável com estilo padrão
// =============================================================================

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { colors, borderRadius, spacing, fontSize, shadows } from '../theme/colors';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

export function Input({
    label,
    error,
    containerStyle,
    icon,
    rightIcon,
    onRightIconPress,
    ...rest
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    const inputContainerStyles = [
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        !!error && styles.inputContainerError,
    ];

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={inputContainerStyles}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}

                <TextInput
                    style={[styles.input, icon ? styles.inputWithIcon : undefined]}
                    placeholderTextColor={colors.gray500}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...rest}
                />

                {rightIcon && (
                    <TouchableOpacity
                        style={styles.rightIconContainer}
                        onPress={onRightIconPress}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.black,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.gray300,
        minHeight: 56,
        paddingHorizontal: spacing.md,
        ...shadows.small,
    },
    inputContainerFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    inputContainerError: {
        borderColor: colors.error,
        borderWidth: 2,
    },
    iconContainer: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: fontSize.md,
        color: colors.black,
        paddingVertical: spacing.md,
    },
    inputWithIcon: {
        paddingLeft: 0,
    },
    rightIconContainer: {
        paddingLeft: spacing.sm,
    },
    error: {
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
});
