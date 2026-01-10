'use client';

// =============================================================================
// TRVALE DO BOI - Dashboard Principal
// Painel com métricas e resumo do mês
// =============================================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { StatCard, StatsGrid } from '@/components/Card';
import { DataTable } from '@/components/DataTable';
import { buscarEstatisticasMes, buscarViagens, obterSessao, Estatisticas, Viagem } from '@/lib/supabase';
import { formatarKM } from '@/lib/utils';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Estatisticas>({
        totalKm: 0,
        totalViagens: 0,
        totalGado: 0,
        veiculosAtivos: 0,
    });
    const [viagensRecentes, setViagensRecentes] = useState<Viagem[]>([]);

    // Verificar autenticação e carregar dados
    useEffect(() => {
        async function init() {
            try {
                const sessao = await obterSessao();
                if (!sessao) {
                    router.push('/login');
                    return;
                }

                // Carregar estatísticas
                const estatisticas = await buscarEstatisticasMes();
                setStats(estatisticas);

                // Carregar viagens recentes (últimas 5)
                const viagens = await buscarViagens();
                setViagensRecentes(viagens.slice(0, 5));
            } catch (error) {
                console.error('Erro ao carregar dashboard:', error);
            } finally {
                setLoading(false);
            }
        }

        init();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    // Obter nome do mês atual
    const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-trvale-gray">
            <Header title="Dashboard" />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Título */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-trvale-black">
                        Resumo do Mês
                    </h2>
                    <p className="text-gray-500 capitalize">{mesAtual}</p>
                </div>

                {/* Cards de estatísticas */}
                <StatsGrid>
                    <StatCard
                        title="Total de KM"
                        value={formatarKM(stats.totalKm)}
                        icon={<span>🛣️</span>}
                        color="red"
                    />
                    <StatCard
                        title="Total de Viagens"
                        value={stats.totalViagens}
                        icon={<span>🚛</span>}
                        color="blue"
                    />
                    <StatCard
                        title="Cabeças Transportadas"
                        value={stats.totalGado.toLocaleString('pt-BR')}
                        icon={<span>🐂</span>}
                        color="green"
                    />
                    <StatCard
                        title="Veículos Ativos"
                        value={stats.veiculosAtivos}
                        icon={<span>🚚</span>}
                        color="orange"
                    />
                </StatsGrid>

                {/* Viagens recentes */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-trvale-black">
                                Viagens Recentes
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Últimas viagens registradas no sistema
                            </p>
                        </div>
                        <a
                            href="/dashboard/viagens"
                            className="btn-outline text-sm"
                        >
                            Ver todas →
                        </a>
                    </div>

                    <DataTable viagens={viagensRecentes} loading={loading} />
                </div>
            </main>
        </div>
    );
}
