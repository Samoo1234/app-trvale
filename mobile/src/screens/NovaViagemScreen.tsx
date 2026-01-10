// =============================================================================
// TRVALE DO BOI - Tela de Nova Viagem
// Cadastro de nova viagem de transporte
// =============================================================================

import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../theme/colors';
import { formatarPlaca } from '../utils/formatters';
import { criarViagem } from '../services/databaseService';
import { solicitarPermissaoGPS, verificarGPSAtivo } from '../services/locationService';
import { RootStackParamList } from '../types';

type NovaViagemScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'NovaViagem'>;
};

export function NovaViagemScreen({ navigation }: NovaViagemScreenProps) {
    // Estados do formulário
    const [veiculo, setVeiculo] = useState('');
    const [origem, setOrigem] = useState('');
    const [destino, setDestino] = useState('');
    const [qtdGado, setQtdGado] = useState('');
    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState<{
        veiculo?: string;
        origem?: string;
        destino?: string;
        qtdGado?: string;
    }>({});

    // Hook de autenticação
    const { motorista } = useAuth();

    /**
     * Formatar placa enquanto digita
     */
    function handlePlacaChange(text: string) {
        const formatted = formatarPlaca(text);
        setVeiculo(formatted);
        if (erros.veiculo) {
            setErros(prev => ({ ...prev, veiculo: undefined }));
        }
    }

    /**
     * Formatar quantidade de gado (apenas números)
     */
    function handleQtdGadoChange(text: string) {
        const numeros = text.replace(/\D/g, '');
        setQtdGado(numeros);
        if (erros.qtdGado) {
            setErros(prev => ({ ...prev, qtdGado: undefined }));
        }
    }

    /**
     * Validar formulário
     */
    function validarFormulario(): boolean {
        const novosErros: typeof erros = {};

        // Validar placa
        if (!veiculo) {
            novosErros.veiculo = 'Placa do veículo é obrigatória';
        } else if (veiculo.replace(/[^A-Za-z0-9]/g, '').length < 7) {
            novosErros.veiculo = 'Placa inválida';
        }

        // Validar origem
        if (!origem.trim()) {
            novosErros.origem = 'Origem é obrigatória';
        }

        // Validar destino
        if (!destino.trim()) {
            novosErros.destino = 'Destino é obrigatório';
        }

        // Validar quantidade de gado
        if (!qtdGado) {
            novosErros.qtdGado = 'Quantidade de gado é obrigatória';
        } else if (parseInt(qtdGado) <= 0) {
            novosErros.qtdGado = 'Quantidade deve ser maior que zero';
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    }

    /**
     * Verificar permissões e GPS antes de iniciar
     */
    async function verificarPreRequisitos(): Promise<boolean> {
        // Verificar permissão de GPS
        const temPermissao = await solicitarPermissaoGPS();
        if (!temPermissao) {
            Alert.alert(
                'Permissão Necessária',
                'O app precisa de permissão para acessar sua localização durante a viagem.',
                [{ text: 'OK' }]
            );
            return false;
        }

        // Verificar se GPS está ativo
        const gpsAtivo = await verificarGPSAtivo();
        if (!gpsAtivo) {
            Alert.alert(
                'GPS Desativado',
                'Por favor, ative o GPS do seu celular para iniciar a viagem.',
                [{ text: 'OK' }]
            );
            return false;
        }

        return true;
    }

    /**
     * Iniciar viagem
     */
    async function handleIniciarViagem() {
        if (!validarFormulario()) {
            return;
        }

        if (!motorista) {
            Alert.alert('Erro', 'Sessão inválida. Faça login novamente.');
            return;
        }

        // Verificar pré-requisitos
        const pronto = await verificarPreRequisitos();
        if (!pronto) {
            return;
        }

        setLoading(true);

        try {
            // Criar viagem no banco local
            const novaViagem = await criarViagem({
                motorista_id: motorista.id,
                veiculo: veiculo.toUpperCase(),
                origem: origem.trim(),
                destino: destino.trim(),
                qtd_gado: parseInt(qtdGado),
            });

            console.log('[NovaViagem] Viagem criada:', novaViagem.id);

            // Navegar para tela de viagem ativa
            navigation.replace('ViagemAtiva', { viagemId: novaViagem.id });
        } catch (error) {
            console.error('[NovaViagem] Erro ao criar viagem:', error);
            Alert.alert('Erro', 'Não foi possível iniciar a viagem. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header
                title="Nova Viagem"
                subtitle="Preencha os dados para iniciar"
                showBack
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Placa do veículo */}
                    <Input
                        label="Placa do Veículo"
                        placeholder="ABC-1234"
                        value={veiculo}
                        onChangeText={handlePlacaChange}
                        maxLength={8}
                        autoCapitalize="characters"
                        error={erros.veiculo}
                    />

                    {/* Origem */}
                    <Input
                        label="Origem"
                        placeholder="Ex: Fazenda São João - Goiânia/GO"
                        value={origem}
                        onChangeText={(text) => {
                            setOrigem(text);
                            if (erros.origem) setErros(prev => ({ ...prev, origem: undefined }));
                        }}
                        error={erros.origem}
                    />

                    {/* Destino */}
                    <Input
                        label="Destino"
                        placeholder="Ex: Frigorífico Central - Anápolis/GO"
                        value={destino}
                        onChangeText={(text) => {
                            setDestino(text);
                            if (erros.destino) setErros(prev => ({ ...prev, destino: undefined }));
                        }}
                        error={erros.destino}
                    />

                    {/* Quantidade de gado */}
                    <Input
                        label="Quantidade de Cabeças"
                        placeholder="Ex: 25"
                        value={qtdGado}
                        onChangeText={handleQtdGadoChange}
                        keyboardType="number-pad"
                        maxLength={4}
                        error={erros.qtdGado}
                    />

                    {/* Botão Iniciar */}
                    <View style={styles.buttonContainer}>
                        <Button
                            title="INICIAR VIAGEM"
                            onPress={handleIniciarViagem}
                            loading={loading}
                            size="large"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
    },
    buttonContainer: {
        marginTop: spacing.xl,
    },
});
