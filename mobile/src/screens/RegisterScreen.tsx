// =============================================================================
// TRVALE DO BOI - Tela de Registro de Motorista
// Auto-cadastro de novos motoristas
// =============================================================================

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Input, Button } from '../components';
import { colors, spacing } from '../theme/colors';
import { formatarCPF, validarCPF } from '../utils/formatters';
import { registrarMotorista } from '../services/supabaseClient';

interface RegisterScreenProps {
    navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [erros, setErros] = useState<{
        nome?: string;
        cpf?: string;
        senha?: string;
        confirmarSenha?: string;
    }>({});

    /**
     * Formatar CPF enquanto digita
     */
    function handleCpfChange(text: string) {
        const formatted = formatarCPF(text);
        setCpf(formatted);

        // Limpar erro ao digitar
        if (erros.cpf) {
            setErros(prev => ({ ...prev, cpf: undefined }));
        }
    }

    /**
     * Validar formulário
     */
    function validarFormulario(): boolean {
        const novosErros: typeof erros = {};

        // Validar nome
        if (!nome.trim()) {
            novosErros.nome = 'Nome é obrigatório';
        } else if (nome.trim().length < 3) {
            novosErros.nome = 'Nome deve ter pelo menos 3 caracteres';
        }

        // Validar CPF
        if (!cpf) {
            novosErros.cpf = 'CPF é obrigatório';
        } else if (!validarCPF(cpf)) {
            novosErros.cpf = 'CPF inválido';
        }

        // Validar senha
        if (!senha) {
            novosErros.senha = 'Senha é obrigatória';
        } else if (senha.length < 6) {
            novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
        }

        // Validar confirmação de senha
        if (!confirmarSenha) {
            novosErros.confirmarSenha = 'Confirme sua senha';
        } else if (senha !== confirmarSenha) {
            novosErros.confirmarSenha = 'As senhas não coincidem';
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    }

    /**
     * Realizar registro
     */
    async function handleRegister() {
        if (!validarFormulario()) {
            return;
        }

        setIsLoading(true);

        try {
            await registrarMotorista(nome.trim(), cpf, senha);

            Alert.alert(
                'Cadastro realizado!',
                'Sua conta foi criada com sucesso. Faça login para continuar.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            let mensagem = 'Erro ao criar conta. Tente novamente.';

            if (error instanceof Error) {
                if (error.message.includes('já cadastrado')) {
                    mensagem = 'Este CPF já está cadastrado no sistema';
                } else if (error.message.includes('email')) {
                    mensagem = 'Este CPF já possui uma conta';
                } else {
                    mensagem = error.message;
                }
            }

            Alert.alert('Erro no cadastro', mensagem);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>DO BOI</Text>
                <Text style={styles.headerSubtitle}>TRANSPORTADORA</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Card de Registro */}
                    <View style={styles.card}>
                        <Text style={styles.title}>Criar Conta</Text>
                        <Text style={styles.subtitle}>
                            Preencha seus dados para se cadastrar
                        </Text>

                        {/* Campo Nome */}
                        <Input
                            label="Nome Completo"
                            placeholder="Seu nome completo"
                            value={nome}
                            onChangeText={(text) => {
                                setNome(text);
                                if (erros.nome) setErros(prev => ({ ...prev, nome: undefined }));
                            }}
                            autoCapitalize="words"
                            error={erros.nome}
                        />

                        {/* Campo CPF */}
                        <Input
                            label="CPF"
                            placeholder="000.000.000-00"
                            value={cpf}
                            onChangeText={handleCpfChange}
                            keyboardType="numeric"
                            maxLength={14}
                            error={erros.cpf}
                        />

                        {/* Campo Senha */}
                        <Input
                            label="Senha"
                            placeholder="Mínimo 6 caracteres"
                            value={senha}
                            onChangeText={(text) => {
                                setSenha(text);
                                if (erros.senha) setErros(prev => ({ ...prev, senha: undefined }));
                            }}
                            secureTextEntry
                            error={erros.senha}
                        />

                        {/* Campo Confirmar Senha */}
                        <Input
                            label="Confirmar Senha"
                            placeholder="Digite a senha novamente"
                            value={confirmarSenha}
                            onChangeText={(text) => {
                                setConfirmarSenha(text);
                                if (erros.confirmarSenha) setErros(prev => ({ ...prev, confirmarSenha: undefined }));
                            }}
                            secureTextEntry
                            error={erros.confirmarSenha}
                        />

                        {/* Botão de Cadastro */}
                        <Button
                            title="CADASTRAR"
                            onPress={handleRegister}
                            loading={isLoading}
                            style={styles.button}
                        />

                        {/* Link para Login */}
                        <TouchableOpacity
                            style={styles.linkContainer}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.linkText}>
                                Já tem uma conta? <Text style={styles.linkBold}>Faça login</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Rodapé */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>TRVALE Mobile v1.0.1</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    header: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.white,
        opacity: 0.8,
        letterSpacing: 2,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: colors.gray600,
        marginBottom: spacing.lg,
    },
    button: {
        marginTop: spacing.md,
    },
    linkContainer: {
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 14,
        color: colors.gray600,
    },
    linkBold: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    footer: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: colors.white,
        opacity: 0.6,
    },
});
