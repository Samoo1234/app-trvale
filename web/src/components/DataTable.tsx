'use client';

// =============================================================================
// TRVALE DO BOI - Componente de Tabela de Dados
// =============================================================================

import { formatarData, formatarKM, calcularDuracao } from '@/lib/utils';
import { Viagem } from '@/lib/supabase';

interface DataTableProps {
    viagens: Viagem[];
    loading?: boolean;
    onViewDetail?: (viagem: Viagem) => void;
}

export function DataTable({ viagens, loading = false, onViewDetail }: DataTableProps) {
    if (loading) {
        return (
            <div className="table-container p-12 text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando viagens...</p>
            </div>
        );
    }

    if (viagens.length === 0) {
        return (
            <div className="table-container p-12 text-center">
                <p className="text-gray-500 text-lg">Nenhuma viagem encontrada</p>
                <p className="text-gray-400 text-sm mt-2">
                    Ajuste os filtros ou aguarde novas viagens
                </p>
            </div>
        );
    }

    return (
        <div className="table-container overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Motorista</th>
                        <th>Veículo</th>
                        <th>Origem</th>
                        <th>Destino</th>
                        <th className="text-center">Cabeças</th>
                        <th className="text-right">KM Rodado</th>
                        <th className="text-center">Duração</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {viagens.map((viagem) => (
                        <tr key={viagem.id} className="hover:bg-gray-50 transition-colors">
                            <td className="whitespace-nowrap">
                                {formatarData(viagem.inicio_em)}
                            </td>
                            <td>
                                <div className="font-medium">
                                    {viagem.motoristas?.nome || 'N/A'}
                                </div>
                            </td>
                            <td className="font-mono font-medium">
                                {viagem.veiculo}
                            </td>
                            <td className="max-w-[200px] truncate" title={viagem.origem}>
                                {viagem.origem}
                            </td>
                            <td className="max-w-[200px] truncate" title={viagem.destino}>
                                {viagem.destino}
                            </td>
                            <td className="text-center font-medium">
                                {viagem.qtd_gado}
                            </td>
                            <td className="text-right font-medium text-primary">
                                {formatarKM(viagem.km_total)}
                            </td>
                            <td className="text-center text-gray-500">
                                {calcularDuracao(viagem.inicio_em, viagem.fim_em)}
                            </td>
                            <td className="text-center">
                                {viagem.fim_em ? (
                                    viagem.sync ? (
                                        <span className="badge-success">Sincronizada</span>
                                    ) : (
                                        <span className="badge-warning">Pendente</span>
                                    )
                                ) : (
                                    <span className="badge-info">Em andamento</span>
                                )}
                            </td>
                            <td className="text-center">
                                <button
                                    type="button"
                                    onClick={() => onViewDetail?.(viagem)}
                                    className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-medium text-sm transition-colors cursor-pointer"
                                    title="Ver Minuta"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Minuta
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

