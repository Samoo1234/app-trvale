// =============================================================================
// TRVALE DO BOI - Tela de Dashboard
// Painel principal do motorista
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { StatCard, TravelCard } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, fontSize, shadows } from '../theme/colors';
import { obterSaudacao, formatarData, formatarKM } from '../utils/formatters';
import { listarViagens, buscarViagemAtiva, obterEstatisticas } from '../services/databaseService';
import { forcarSincronizacao, obterViagensPendentes } from '../services/syncService';
import { RootStackParamList, ViagemLocal, Estatisticas } from '../types';

type DashboardScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

export function DashboardScreen({ navigation }: DashboardScreenProps) {
    // Estados
    const [viagens, setViagens] = useState<ViagemLocal[]>([]);
    const [viagemAtiva, setViagemAtiva] = useState<ViagemLocal | null>(null);
    const [estatisticas, setEstatisticas] = useState<Estatisticas>({
        totalViagens: 0,
        kmTotal: 0,
        viagensHoje: 0,
        viagensPendentes: 0,
    });
    const [refreshing, setRefreshing] = useState(false);
    const [sincronizando, setSincronizando] = useState(false);

    // Hook de autenticação
    const { motorista, signOut } = useAuth();

    // Carregar dados quando a tela recebe foco
    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [motorista])
    );

    /**
     * Carregar todos os dados
     */
    async function carregarDados() {
        if (!motorista) return;

        try {
            // Buscar viagem ativa
            const ativa = await buscarViagemAtiva(motorista.id);
            setViagemAtiva(ativa);

            // Buscar viagens recentes
            const viagensRecentes = await listarViagens(motorista.id, 10);
            setViagens(viagensRecentes);

            // Buscar estatísticas
            const stats = await obterEstatisticas(motorista.id);
            setEstatisticas(stats);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    /**
     * Atualizar dados (pull to refresh)
     */
    async function handleRefresh() {
        setRefreshing(true);
        await carregarDados();
        setRefreshing(false);
    }

    /**
     * Forçar sincronização
     */
    async function handleSincronizar() {
        setSincronizando(true);

        try {
            const sucesso = await forcarSincronizacao();

            if (sucesso) {
                Alert.alert('Sincronizado!', 'Todas as viagens foram enviadas ao servidor.');
            } else {
                const pendentes = await obterViagensPendentes();
                Alert.alert(
                    'Parcialmente Sincronizado',
                    `${pendentes} viagem(ns) ainda pendente(s). Verifique sua conexão.`
                );
            }

            await carregarDados();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível sincronizar. Tente novamente.');
        } finally {
            setSincronizando(false);
        }
    }

    /**
     * Iniciar nova viagem
     */
    function handleNovaViagem() {
        if (viagemAtiva) {
            Alert.alert(
                'Viagem em Andamento',
                'Você já tem uma viagem ativa. Finalize-a antes de iniciar outra.',
                [
                    { text: 'Ver Viagem', onPress: () => navigation.navigate('ViagemAtiva', { viagemId: viagemAtiva.id }) },
                    { text: 'Cancelar', style: 'cancel' },
                ]
            );
            return;
        }

        navigation.navigate('NovaViagem');
    }

    /**
     * Fazer logout
     */
    async function handleLogout() {
        Alert.alert(
            'Sair do Sistema',
            'Deseja realmente sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
                        }
                    }
                },
            ]
        );
    }

    // Obter status de viagem
    function obterStatusViagem(viagem: ViagemLocal): 'finalizada' | 'em_andamento' | 'pendente' {
        if (!viagem.fim_em) return 'em_andamento';
        if (viagem.sync === 0) return 'pendente';
        return 'finalizada';
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header
                title={`${obterSaudacao()}, ${motorista?.nome.split(' ')[0]}!`}
                subtitle="Sistema de Transporte"
                rightComponent={
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>
                }
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                    />
                }
            >
                {/* Alerta de viagem ativa */}
                {viagemAtiva && (
                    <TouchableOpacity
                        style={styles.activeTrip}
                        onPress={() => navigation.navigate('ViagemAtiva', { viagemId: viagemAtiva.id })}
                    >
                        <View style={styles.activeTripContent}>
                            <Text style={styles.activeTripLabel}>VIAGEM EM ANDAMENTO</Text>
                            <Text style={styles.activeTripRoute}>
                                {viagemAtiva.origem} → {viagemAtiva.destino}
                            </Text>
                        </View>
                        <Text style={styles.activeTripArrow}>→</Text>
                    </TouchableOpacity>
                )}

                {/* Estatísticas */}
                <View style={styles.statsContainer}>
                    <StatCard
                        value={estatisticas.totalViagens}
                        label="Viagens"
                        style={styles.statCard}
                    />
                    <StatCard
                        value={`${estatisticas.kmTotal.toFixed(0)}`}
                        label="KM Total"
                        style={styles.statCard}
                    />
                </View>

                {/* Sincronização pendente */}
                {estatisticas.viagensPendentes > 0 && (
                    <TouchableOpacity
                        style={styles.syncAlert}
                        onPress={handleSincronizar}
                        disabled={sincronizando}
                    >
                        <View style={styles.syncContent}>
                            <Text style={styles.syncLabel}>
                                {estatisticas.viagensPendentes} viagem(ns) pendente(s) de sincronização
                            </Text>
                            <Text style={styles.syncAction}>
                                {sincronizando ? 'Sincronizando...' : 'Toque para sincronizar'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Botão Nova Viagem */}
                <View style={styles.newTripContainer}>
                    <Button
                        title={viagemAtiva ? 'CONTINUAR VIAGEM' : 'INICIAR NOVA VIAGEM'}
                        onPress={viagemAtiva
                            ? () => navigation.navigate('ViagemAtiva', { viagemId: viagemAtiva.id })
                            : handleNovaViagem
                        }
                        size="large"
                    />
                </View>

                {/* Viagens Recentes */}
                <View style={styles.recentSection}>
                    <Text style={styles.sectionTitle}>Viagens Recentes</Text>

                    {viagens.length === 0 ? (
                        <Text style={styles.emptyText}>
                            Nenhuma viagem registrada ainda.
                        </Text>
                    ) : (
                        viagens.map((viagem) => (
                            <TravelCard
                                key={viagem.id}
                                origem={viagem.origem}
                                destino={viagem.destino}
                                data={formatarData(viagem.inicio_em)}
                                km={formatarKM(viagem.km_total * 1000)}
                                qtdGado={viagem.qtd_gado}
                                status={obterStatusViagem(viagem)}
                                onPress={!viagem.fim_em
                                    ? () => navigation.navigate('ViagemAtiva', { viagemId: viagem.id })
                                    : undefined
                                }
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
    },
    logoutButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    logoutText: {
        color: colors.white,
        fontSize: fontSize.sm,
        fontWeight: '600',
    },

    // Viagem ativa
    activeTrip: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...shadows.medium,
    },
    activeTripContent: {
        flex: 1,
    },
    activeTripLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: fontSize.xs,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    activeTripRoute: {
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        marginTop: spacing.xs,
    },
    activeTripArrow: {
        color: colors.white,
        fontSize: 24,
        marginLeft: spacing.md,
    },

    // Estatísticas
    statsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
    },

    // Alerta de sincronização
    syncAlert: {
        backgroundColor: colors.warning,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    syncContent: {},
    syncLabel: {
        color: colors.white,
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    syncAction: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: fontSize.xs,
        marginTop: spacing.xs,
    },

    // Nova viagem
    newTripContainer: {
        marginBottom: spacing.xl,
    },

    // Viagens recentes
    recentSection: {
        marginTop: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: spacing.md,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.gray500,
        fontSize: fontSize.md,
        padding: spacing.xl,
    },
});
