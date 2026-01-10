// =============================================================================
// TRVALE DO BOI - Tela de Login
// Autenticação do motorista por CPF e senha
// =============================================================================

import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Text,
    TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogoHeader } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, fontSize } from '../theme/colors';
import { formatarCPF, validarCPF } from '../utils/formatters';
import { RootStackParamList } from '../types';

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: LoginScreenProps) {
    // Estados do formulário
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState<{ cpf?: string; senha?: string }>({});

    // Hook de autenticação
    const { signIn } = useAuth();

    /**
     * Formatar CPF enquanto digita
     */
    function handleCpfChange(text: string) {
        const formatted = formatarCPF(text);
        setCpf(formatted);

        // Limpar erro quando começar a digitar
        if (erros.cpf) {
            setErros(prev => ({ ...prev, cpf: undefined }));
        }
    }

    /**
     * Validar formulário
     */
    function validarFormulario(): boolean {
        const novosErros: { cpf?: string; senha?: string } = {};

        // Validar CPF
        if (!cpf) {
            novosErros.cpf = 'CPF é obrigatório';
        } else if (!validarCPF(cpf)) {
            novosErros.cpf = 'CPF inválido';
        }

        // Validar senha
        if (!senha) {
            novosErros.senha = 'Senha é obrigatória';
        } else if (senha.length < 4) {
            novosErros.senha = 'Senha deve ter no mínimo 4 caracteres';
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    }

    /**
     * Fazer login
     */
    async function handleLogin() {
        if (!validarFormulario()) {
            return;
        }

        setLoading(true);

        try {
            await signIn(cpf, senha);
            // Navegação é feita automaticamente pelo App.tsx ao detectar autenticação
        } catch (error: any) {
            console.error('Erro no login:', error);

            // Mostrar mensagem de erro amigável
            let mensagem = 'Não foi possível fazer login. Tente novamente.';

            if (error.message?.includes('Invalid login credentials')) {
                mensagem = 'CPF ou senha incorretos';
            } else if (error.message?.includes('não encontrado')) {
                mensagem = 'CPF não cadastrado no sistema';
            }

            Alert.alert('Erro no Login', mensagem);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header com logo */}
            <LogoHeader />

            {/* Formulário */}
            <ScrollView
                style={styles.formContainer}
                contentContainerStyle={styles.formContent}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.welcomeText}>Bem-vindo, motorista!</Text>
                <Text style={styles.instructionText}>
                    Entre com seu CPF e senha para acessar o sistema
                </Text>

                {/* Campo CPF */}
                <Input
                    label="CPF"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChangeText={handleCpfChange}
                    keyboardType="numeric"
                    maxLength={14}
                    error={erros.cpf}
                    autoCapitalize="none"
                />

                {/* Campo Senha */}
                <Input
                    label="Senha"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChangeText={(text) => {
                        setSenha(text);
                        if (erros.senha) {
                            setErros(prev => ({ ...prev, senha: undefined }));
                        }
                    }}
                    secureTextEntry={!senhaVisivel}
                    error={erros.senha}
                    autoCapitalize="none"
                />

                {/* Botão de Login */}
                <View style={styles.buttonContainer}>
                    <Button
                        title="ENTRAR"
                        onPress={handleLogin}
                        loading={loading}
                        size="large"
                    />
                </View>

                {/* Link para Cadastro */}
                <TouchableOpacity
                    style={styles.registerLink}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.registerText}>
                        Não tem conta? <Text style={styles.registerBold}>Cadastre-se</Text>
                    </Text>
                </TouchableOpacity>

                {/* Versão do app */}
                <Text style={styles.version}>TRVALE Mobile v1.0.1</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    formContainer: {
        flex: 1,
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
    },
    formContent: {
        padding: spacing.xl,
        paddingTop: spacing.xxl,
    },
    welcomeText: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: spacing.xs,
    },
    instructionText: {
        fontSize: fontSize.md,
        color: colors.gray600,
        marginBottom: spacing.xl,
    },
    buttonContainer: {
        marginTop: spacing.lg,
    },
    registerLink: {
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    registerText: {
        fontSize: fontSize.sm,
        color: colors.gray600,
    },
    registerBold: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    version: {
        textAlign: 'center',
        color: colors.gray500,
        fontSize: fontSize.xs,
        marginTop: spacing.xxl,
    },
});
