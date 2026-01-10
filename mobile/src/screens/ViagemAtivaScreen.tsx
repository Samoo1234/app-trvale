// =============================================================================
// TRVALE DO BOI - Tela de Viagem Ativa
// Monitoramento GPS e finalização de viagem
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Alert,
    AppState,
    AppStateStatus,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors, spacing, fontSize, shadows } from '../theme/colors';
import { formatarTempo, formatarKM } from '../utils/formatters';
import { buscarViagem, finalizarViagem } from '../services/databaseService';
import {
    iniciarRastreamentoGPS,
    pararRastreamentoGPS,
    rastreamentoAtivo,
    obterKmAtual,
} from '../services/locationService';
import { RootStackParamList, ViagemLocal } from '../types';

type ViagemAtivaScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'ViagemAtiva'>;
    route: RouteProp<RootStackParamList, 'ViagemAtiva'>;
};

export function ViagemAtivaScreen({ navigation, route }: ViagemAtivaScreenProps) {
    const { viagemId } = route.params;

    // Estados
    const [viagem, setViagem] = useState<ViagemLocal | null>(null);
    const [kmPercorrido, setKmPercorrido] = useState(0);
    const [tempoDecorrido, setTempoDecorrido] = useState(0);
    const [loading, setLoading] = useState(true);
    const [finalizando, setFinalizando] = useState(false);

    // Refs para controle
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const appStateRef = useRef(AppState.currentState);

    // Carregar viagem e iniciar rastreamento
    useEffect(() => {
        carregarViagem();

        // Listener para mudança de estado do app (background/foreground)
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            pararTimer();
        };
    }, [viagemId]);

    /**
     * Carregar dados da viagem
     */
    async function carregarViagem() {
        try {
            const viagemData = await buscarViagem(viagemId);

            if (!viagemData) {
                Alert.alert('Erro', 'Viagem não encontrada.');
                navigation.goBack();
                return;
            }

            setViagem(viagemData);
            setKmPercorrido(viagemData.km_total);

            // Calcular tempo decorrido
            const inicio = new Date(viagemData.inicio_em);
            const agora = new Date();
            const segundosDecorridos = Math.floor((agora.getTime() - inicio.getTime()) / 1000);
            setTempoDecorrido(segundosDecorridos);

            // Iniciar timer de tempo
            iniciarTimer();

            // Iniciar rastreamento GPS se a viagem ainda está ativa
            if (!viagemData.fim_em) {
                await iniciarRastreamentoGPS(viagemId, (km) => {
                    setKmPercorrido(km);
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('[ViagemAtiva] Erro ao carregar viagem:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados da viagem.');
            navigation.goBack();
        }
    }

    /**
     * Iniciar timer de tempo decorrido
     */
    function iniciarTimer() {
        if (timerRef.current) return;

        timerRef.current = setInterval(() => {
            setTempoDecorrido(prev => prev + 1);
        }, 1000);
    }

    /**
     * Parar timer
     */
    function pararTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }

    /**
     * Handler para mudança de estado do app
     */
    function handleAppStateChange(nextAppState: AppStateStatus) {
        if (
            appStateRef.current.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            // App voltou ao primeiro plano - recalcular tempo
            if (viagem) {
                const inicio = new Date(viagem.inicio_em);
                const agora = new Date();
                const segundosDecorridos = Math.floor((agora.getTime() - inicio.getTime()) / 1000);
                setTempoDecorrido(segundosDecorridos);
            }
        }

        appStateRef.current = nextAppState;
    }

    /**
     * Finalizar viagem
     */
    async function handleFinalizarViagem() {
        Alert.alert(
            'Finalizar Viagem',
            'Deseja realmente finalizar esta viagem?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Finalizar',
                    style: 'destructive',
                    onPress: confirmarFinalizacao,
                },
            ]
        );
    }

    /**
     * Confirmar finalização
     */
    async function confirmarFinalizacao() {
        setFinalizando(true);

        try {
            // Parar rastreamento GPS
            const kmFinal = await pararRastreamentoGPS();

            // Usar o maior valor entre o retornado e o estado atual
            const kmTotal = Math.max(kmFinal, kmPercorrido);

            // Finalizar viagem no banco
            const viagemFinalizada = await finalizarViagem(viagemId, kmTotal);

            // Parar timer
            pararTimer();

            // Exibir resumo
            Alert.alert(
                'Viagem Finalizada!',
                `Resumo da viagem:\n\n` +
                `📍 ${viagem?.origem} → ${viagem?.destino}\n` +
                `🚛 Veículo: ${viagem?.veiculo}\n` +
                `🐂 Cabeças: ${viagem?.qtd_gado}\n` +
                `📏 Distância: ${formatarKM(kmTotal * 1000)}\n` +
                `⏱️ Tempo: ${formatarTempo(tempoDecorrido)}`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Dashboard'),
                    },
                ]
            );
        } catch (error) {
            console.error('[ViagemAtiva] Erro ao finalizar viagem:', error);
            Alert.alert('Erro', 'Não foi possível finalizar a viagem. Tente novamente.');
        } finally {
            setFinalizando(false);
        }
    }

    // Mostrar loading enquanto carrega
    if (loading || !viagem) {
        return (
            <View style={styles.container}>
                <Header title="Viagem em Andamento" showBack onBack={() => navigation.goBack()} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header
                title="Viagem em Andamento"
                subtitle={`${viagem.veiculo} • ${viagem.qtd_gado} cabeças`}
                showBack
                onBack={() => {
                    Alert.alert(
                        'Atenção',
                        'A viagem continuará sendo rastreada em segundo plano. Deseja voltar?',
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Voltar', onPress: () => navigation.goBack() },
                        ]
                    );
                }}
            />

            <View style={styles.content}>
                {/* Rota */}
                <Card style={styles.routeCard}>
                    <View style={styles.routeContainer}>
                        <View style={styles.routePoint}>
                            <View style={[styles.routeDot, styles.routeDotOrigin]} />
                            <View style={styles.routeTextContainer}>
                                <Text style={styles.routeLabel}>ORIGEM</Text>
                                <Text style={styles.routeText}>{viagem.origem}</Text>
                            </View>
                        </View>

                        <View style={styles.routeLine} />

                        <View style={styles.routePoint}>
                            <View style={[styles.routeDot, styles.routeDotDestino]} />
                            <View style={styles.routeTextContainer}>
                                <Text style={styles.routeLabel}>DESTINO</Text>
                                <Text style={styles.routeText}>{viagem.destino}</Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* KM Percorrido - Destaque */}
                <View style={styles.kmContainer}>
                    <Text style={styles.kmValue}>{kmPercorrido.toFixed(2)}</Text>
                    <Text style={styles.kmLabel}>KM PERCORRIDOS</Text>
                </View>

                {/* Tempo decorrido */}
                <View style={styles.timeContainer}>
                    <Text style={styles.timeValue}>{formatarTempo(tempoDecorrido)}</Text>
                    <Text style={styles.timeLabel}>TEMPO DE VIAGEM</Text>
                </View>

                {/* Status do GPS */}
                <View style={styles.gpsStatus}>
                    <View style={[styles.gpsIndicator, rastreamentoAtivo() && styles.gpsActive]} />
                    <Text style={styles.gpsText}>
                        {rastreamentoAtivo() ? 'GPS Ativo - Capturando localização' : 'GPS Inativo'}
                    </Text>
                </View>

                {/* Botão Finalizar */}
                <View style={styles.buttonContainer}>
                    <Button
                        title="FINALIZAR VIAGEM"
                        onPress={handleFinalizarViagem}
                        loading={finalizando}
                        variant="danger"
                        size="large"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: fontSize.lg,
        color: colors.gray500,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },

    // Rota
    routeCard: {
        marginBottom: spacing.lg,
    },
    routeContainer: {
        paddingVertical: spacing.sm,
    },
    routePoint: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    routeDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: spacing.md,
    },
    routeDotOrigin: {
        backgroundColor: colors.success,
    },
    routeDotDestino: {
        backgroundColor: colors.primary,
    },
    routeLine: {
        width: 2,
        height: 24,
        backgroundColor: colors.gray300,
        marginLeft: 7,
        marginVertical: spacing.xs,
    },
    routeTextContainer: {
        flex: 1,
    },
    routeLabel: {
        fontSize: fontSize.xs,
        color: colors.gray500,
        letterSpacing: 1,
    },
    routeText: {
        fontSize: fontSize.md,
        color: colors.black,
        fontWeight: '600',
        marginTop: 2,
    },

    // KM
    kmContainer: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...shadows.large,
    },
    kmValue: {
        fontSize: 64,
        fontWeight: 'bold',
        color: colors.white,
    },
    kmLabel: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 2,
        marginTop: spacing.xs,
    },

    // Tempo
    timeContainer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...shadows.medium,
    },
    timeValue: {
        fontSize: fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.black,
    },
    timeLabel: {
        fontSize: fontSize.xs,
        color: colors.gray500,
        letterSpacing: 1,
        marginTop: spacing.xs,
    },

    // GPS Status
    gpsStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    gpsIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.gray400,
        marginRight: spacing.sm,
    },
    gpsActive: {
        backgroundColor: colors.success,
    },
    gpsText: {
        fontSize: fontSize.sm,
        color: colors.gray600,
    },

    // Botão
    buttonContainer: {
        marginTop: 'auto',
        paddingBottom: spacing.lg,
    },
});
