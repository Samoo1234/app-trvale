'use client';

// =============================================================================
// TRVALE DO BOI - Modal de Minuta Digital
// Exibe detalhes completos de uma viagem com geração de PDF
// =============================================================================

import { Viagem } from '@/lib/supabase';
import { formatarData, formatarKM, calcularDuracao } from '@/lib/utils';
import jsPDF from 'jspdf';

interface TripDetailModalProps {
    viagem: Viagem | null;
    onClose: () => void;
    isOpen: boolean;
}

export function TripDetailModal({ viagem, onClose, isOpen }: TripDetailModalProps) {
    if (!isOpen || !viagem) return null;

    // Gerar número da viagem (primeiros 8 caracteres do ID em maiúsculo)
    const numeroViagem = viagem.id.slice(0, 8).toUpperCase();

    // Função para gerar PDF monocromático
    function handleGeneratePDF() {
        if (!viagem) return;
        const trip = viagem;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [210, 148.5]
        });

        const BLACK = '#000000';
        const GRAY = '#666666';
        const LIGHT = '#999999';

        const W = 210;
        const H = 148.5;
        const M = 20; // margem maior
        const CW = W - (M * 2); // 170mm de conteúdo
        const CENTER = W / 2;

        let y = 15;

        // ===== TÍTULO CENTRALIZADO =====
        doc.setTextColor(BLACK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('MINUTA DE TRANSPORTE', CENTER, y, { align: 'center' });

        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('TRVALE DO BOI TRANSPORTADORA', CENTER, y, { align: 'center' });

        y += 6;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Nº ${numeroViagem}`, CENTER, y, { align: 'center' });

        y += 4;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(GRAY);
        const agora = new Date();
        doc.text(`Emitido em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, CENTER, y, { align: 'center' });

        y += 8;

        // ===== LINHA DIVISÓRIA =====
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(M, y, W - M, y);

        y += 8;

        // ===== TABELA DE DADOS =====
        const col1 = M;
        const col2 = M + CW / 2;

        // Linha 1: Motorista | Placa
        doc.setTextColor(GRAY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('MOTORISTA', col1, y);
        doc.text('PLACA DO VEÍCULO', col2, y);

        y += 5;
        doc.setTextColor(BLACK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(trip.motoristas?.nome || 'Não informado', col1, y);
        doc.text(trip.veiculo || 'N/A', col2, y);

        y += 8;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(M, y, W - M, y);
        y += 6;

        // Linha 2: Origem | Destino
        doc.setTextColor(GRAY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('ORIGEM', col1, y);
        doc.text('DESTINO', col2, y);

        y += 5;
        doc.setTextColor(BLACK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        const ori = trip.origem.length > 35 ? trip.origem.slice(0, 32) + '...' : trip.origem;
        const des = trip.destino.length > 35 ? trip.destino.slice(0, 32) + '...' : trip.destino;
        doc.text(ori, col1, y);
        doc.text(des, col2, y);

        y += 8;
        doc.line(M, y, W - M, y);
        y += 6;

        // Linha 3: Cabeças | KM | Duração (3 colunas)
        const colW = CW / 3;
        const c1 = M + colW / 2;
        const c2 = M + colW + colW / 2;
        const c3 = M + colW * 2 + colW / 2;

        doc.setTextColor(GRAY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('CABEÇAS DE GADO', c1, y, { align: 'center' });
        doc.text('KM RODADO', c2, y, { align: 'center' });
        doc.text('DURAÇÃO', c3, y, { align: 'center' });

        y += 7;
        doc.setTextColor(BLACK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(String(trip.qtd_gado), c1, y, { align: 'center' });
        doc.text(trip.km_total.toFixed(1) + ' km', c2, y, { align: 'center' });
        doc.setFontSize(14);
        doc.text(calcularDuracao(trip.inicio_em, trip.fim_em), c3, y, { align: 'center' });

        y += 8;
        doc.line(M, y, W - M, y);
        y += 6;

        // Linha 4: Início | Fim
        doc.setTextColor(GRAY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('INÍCIO', col1, y);
        doc.text('FIM', col2, y);

        y += 5;
        doc.setTextColor(BLACK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(formatarData(trip.inicio_em, true), col1, y);
        doc.text(trip.fim_em ? formatarData(trip.fim_em, true) : 'Em andamento', col2, y);

        // ===== FOOTER =====
        doc.setTextColor(LIGHT);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('Documento gerado pelo sistema TRVALE DO BOI', CENTER, H - 10, { align: 'center' });

        doc.save(`minuta_${numeroViagem}.pdf`);
    }



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-primary text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Minuta Digital</h2>
                            <p className="text-white/80 text-sm mt-1">
                                TRVALE DO BOI - Transportadora
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-white/80 hover:text-white text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                    <div className="mt-4 text-sm text-white/80">
                        Viagem Nº: <span className="font-mono text-white text-lg font-bold">{numeroViagem}</span>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6 space-y-6">
                    {/* Motorista e Veículo */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Motorista</label>
                            <p className="text-lg font-bold text-trvale-black mt-1">
                                {viagem.motoristas?.nome || 'Não informado'}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Placa do Veículo</label>
                            <p className="text-lg font-bold text-trvale-black font-mono mt-1">
                                {viagem.veiculo}
                            </p>
                        </div>
                    </section>

                    {/* Itinerário */}
                    <section className="bg-gray-50 rounded-xl p-4">
                        <label className="text-xs text-gray-500 uppercase tracking-wide">Itinerário</label>
                        <div className="mt-3 flex items-center gap-4">
                            <div className="flex-1">
                                <div className="text-xs text-gray-400">ORIGEM</div>
                                <p className="font-semibold text-trvale-black">{viagem.origem}</p>
                            </div>
                            <div className="text-primary text-2xl">→</div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-400">DESTINO</div>
                                <p className="font-semibold text-trvale-black">{viagem.destino}</p>
                            </div>
                        </div>
                    </section>

                    {/* Dados da Carga */}
                    <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <label className="text-xs text-green-600 uppercase tracking-wide">Cabeças de Gado</label>
                            <p className="text-3xl font-bold text-green-700 mt-2">
                                {viagem.qtd_gado}
                            </p>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-4 text-center">
                            <label className="text-xs text-primary uppercase tracking-wide">KM Percorrido</label>
                            <p className="text-3xl font-bold text-primary mt-2">
                                {formatarKM(viagem.km_total)}
                            </p>
                        </div>
                        <div className="bg-gray-100 rounded-xl p-4 text-center col-span-2 md:col-span-1">
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Duração</label>
                            <p className="text-3xl font-bold text-gray-700 mt-2">
                                {calcularDuracao(viagem.inicio_em, viagem.fim_em)}
                            </p>
                        </div>
                    </section>

                    {/* Datas */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Início da Viagem</label>
                            <p className="font-semibold text-trvale-black mt-1">
                                {formatarData(viagem.inicio_em, true)}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Fim da Viagem</label>
                            <p className="font-semibold text-trvale-black mt-1">
                                {viagem.fim_em ? formatarData(viagem.fim_em, true) : 'Em andamento'}
                            </p>
                        </div>
                    </section>

                    {/* Botão de PDF */}
                    <section className="flex justify-center border-t pt-6">
                        <button
                            type="button"
                            onClick={handleGeneratePDF}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Baixar PDF
                        </button>
                    </section>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t">
                    <p className="text-center text-xs text-gray-400">
                        Documento gerado automaticamente pelo sistema TRVALE DO BOI
                    </p>
                </div>
            </div>
        </div>
    );
}
