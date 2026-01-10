'use client';

// =============================================================================
// TRVALE DO BOI - Componente de Filtros
// =============================================================================

import { useState } from 'react';
import { Motorista } from '@/lib/supabase';

interface FiltersProps {
    motoristas: Motorista[];
    onFilter: (filtros: {
        dataInicio?: string;
        dataFim?: string;
        motoristaId?: string;
        veiculo?: string;
    }) => void;
    onExport: () => void;
    loading?: boolean;
}

export function Filters({ motoristas, onFilter, onExport, loading }: FiltersProps) {
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [motoristaId, setMotoristaId] = useState('');
    const [veiculo, setVeiculo] = useState('');

    function handleFilter() {
        onFilter({
            dataInicio: dataInicio || undefined,
            dataFim: dataFim || undefined,
            motoristaId: motoristaId || undefined,
            veiculo: veiculo || undefined,
        });
    }

    function handleClear() {
        setDataInicio('');
        setDataFim('');
        setMotoristaId('');
        setVeiculo('');
        onFilter({});
    }

    return (
        <div className="card mb-6">
            <div className="flex flex-wrap items-end gap-4">
                {/* Data Início */}
                <div className="flex-1 min-w-[150px]">
                    <label htmlFor="dataInicio" className="label">
                        Data Início
                    </label>
                    <input
                        type="date"
                        id="dataInicio"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="input"
                    />
                </div>

                {/* Data Fim */}
                <div className="flex-1 min-w-[150px]">
                    <label htmlFor="dataFim" className="label">
                        Data Fim
                    </label>
                    <input
                        type="date"
                        id="dataFim"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="input"
                    />
                </div>

                {/* Motorista */}
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="motorista" className="label">
                        Motorista
                    </label>
                    <select
                        id="motorista"
                        value={motoristaId}
                        onChange={(e) => setMotoristaId(e.target.value)}
                        className="input"
                    >
                        <option value="">Todos os motoristas</option>
                        {motoristas.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nome}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Veículo */}
                <div className="flex-1 min-w-[150px]">
                    <label htmlFor="veiculo" className="label">
                        Veículo (Placa)
                    </label>
                    <input
                        type="text"
                        id="veiculo"
                        value={veiculo}
                        onChange={(e) => setVeiculo(e.target.value.toUpperCase())}
                        placeholder="ABC-1234"
                        className="input"
                        maxLength={8}
                    />
                </div>

                {/* Botões */}
                <div className="flex gap-2">
                    <button
                        onClick={handleFilter}
                        disabled={loading}
                        className="btn-primary"
                    >
                        Filtrar
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={loading}
                        className="btn-secondary"
                    >
                        Limpar
                    </button>
                    <button
                        onClick={onExport}
                        disabled={loading}
                        className="btn-outline"
                    >
                        📊 Exportar Excel
                    </button>
                </div>
            </div>
        </div>
    );
}
