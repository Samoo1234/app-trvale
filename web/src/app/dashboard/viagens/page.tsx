'use client';

// =============================================================================
// TRVALE DO BOI - Página de Viagens
// Lista completa com filtros e exportação Excel
// =============================================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Header } from '@/components/Header';
import { DataTable } from '@/components/DataTable';
import { Filters } from '@/components/Filters';
import { TripDetailModal } from '@/components/TripDetailModal';
import {
    buscarViagens,
    buscarMotoristas,
    obterSessao,
    Viagem,
    Motorista
} from '@/lib/supabase';
import { formatarData, formatarKM, calcularDuracao, gerarNomeArquivo } from '@/lib/utils';

export default function ViagensPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [viagens, setViagens] = useState<Viagem[]>([]);
    const [motoristas, setMotoristas] = useState<Motorista[]>([]);
    const [filtrosAtivos, setFiltrosAtivos] = useState<{
        dataInicio?: string;
        dataFim?: string;
        motoristaId?: string;
        veiculo?: string;
    }>({});

    // Estado para o modal de detalhes
    const [viagemSelecionada, setViagemSelecionada] = useState<Viagem | null>(null);
    const [modalAberto, setModalAberto] = useState(false);

    // Verificar autenticação e carregar dados
    useEffect(() => {
        async function init() {
            try {
                const sessao = await obterSessao();
                if (!sessao) {
                    router.push('/login');
                    return;
                }

                // Carregar motoristas para o filtro
                const listaMotoristasData = await buscarMotoristas();
                setMotoristas(listaMotoristasData);

                // Carregar viagens
                await carregarViagens({});
            } catch (error) {
                console.error('Erro ao carregar viagens:', error);
            } finally {
                setLoading(false);
            }
        }

        init();
    }, [router]);

    /**
     * Carregar viagens com filtros
     */
    async function carregarViagens(filtros: typeof filtrosAtivos) {
        setLoading(true);
        try {
            const viagensData = await buscarViagens(filtros);
            setViagens(viagensData);
            setFiltrosAtivos(filtros);
        } catch (error) {
            console.error('Erro ao buscar viagens:', error);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Abrir modal de detalhes
     */
    function abrirDetalhes(viagem: Viagem) {
        setViagemSelecionada(viagem);
        setModalAberto(true);
    }

    /**
     * Fechar modal de detalhes
     */
    function fecharDetalhes() {
        setModalAberto(false);
        setViagemSelecionada(null);
    }

    /**
     * Exportar para Excel
     */
    function exportarExcel() {
        // Preparar dados para exportação
        const dados = viagens.map((v) => ({
            'Data': formatarData(v.inicio_em),
            'Motorista': v.motoristas?.nome || 'N/A',
            'Veículo': v.veiculo,
            'Origem': v.origem,
            'Destino': v.destino,
            'Qtd Gado': v.qtd_gado,
            'KM Rodado': v.km_total.toFixed(2),
            'Duração': calcularDuracao(v.inicio_em, v.fim_em),
            'Status': v.fim_em ? (v.sync ? 'Sincronizada' : 'Pendente') : 'Em andamento',
        }));

        // Criar workbook
        const ws = XLSX.utils.json_to_sheet(dados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Viagens');

        // Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 12 },  // Data
            { wch: 25 },  // Motorista
            { wch: 10 },  // Veículo
            { wch: 30 },  // Origem
            { wch: 30 },  // Destino
            { wch: 10 },  // Qtd Gado
            { wch: 12 },  // KM Rodado
            { wch: 12 },  // Duração
            { wch: 15 },  // Status
        ];

        // Baixar arquivo
        XLSX.writeFile(wb, gerarNomeArquivo('viagens_trvale'));
    }

    // Calcular totais dos dados filtrados
    const totalKm = viagens.reduce((acc, v) => acc + v.km_total, 0);
    const totalGado = viagens.reduce((acc, v) => acc + v.qtd_gado, 0);

    return (
        <div className="min-h-screen bg-trvale-gray">
            <Header title="Viagens" />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Título */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-trvale-black">
                        Histórico de Viagens
                    </h2>
                    <p className="text-gray-500">
                        Pesquise, filtre e exporte os dados das viagens
                    </p>
                </div>

                {/* Filtros */}
                <Filters
                    motoristas={motoristas}
                    onFilter={carregarViagens}
                    onExport={exportarExcel}
                    loading={loading}
                />

                {/* Resumo dos dados filtrados */}
                {viagens.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-6 text-sm">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                            <span className="text-gray-500">Total: </span>
                            <span className="font-bold text-trvale-black">{viagens.length} viagens</span>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                            <span className="text-gray-500">KM Total: </span>
                            <span className="font-bold text-primary">{formatarKM(totalKm)}</span>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                            <span className="text-gray-500">Cabeças: </span>
                            <span className="font-bold text-green-600">{totalGado.toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                )}

                {/* Tabela */}
                <DataTable
                    viagens={viagens}
                    loading={loading}
                    onViewDetail={abrirDetalhes}
                />
            </main>

            {/* Modal de Minuta Digital */}
            <TripDetailModal
                viagem={viagemSelecionada}
                isOpen={modalAberto}
                onClose={fecharDetalhes}
            />
        </div>
    );
}

