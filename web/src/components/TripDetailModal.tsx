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

    // Função para gerar PDF com jsPDF (meia página A4)
    function handleGeneratePDF() {
        if (!viagem) return;
        const trip = viagem;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [210, 148.5]
        });

        // Cores
        const RED: [number, number, number] = [183, 28, 28];
        const BLACK: [number, number, number] = [33, 33, 33];
        const GRAY: [number, number, number] = [120, 120, 120];
        const WHITE: [number, number, number] = [255, 255, 255];

        // Dimensões
        const W = 210;
        const H = 148.5;
        const M = 15; // margem
        const CW = W - M * 2; // largura do conteúdo (180mm)

        // ========== HEADER (fundo vermelho) ==========
        doc.setFillColor(...RED);
        doc.rect(0, 0, W, 25, 'F');

        // Título esquerda
        doc.setTextColor(...WHITE);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('MINUTA DE TRANSPORTE', M, 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('TRVALE DO BOI TRANSPORTADORA', M, 19);

        // Número da viagem direita (grande)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`Nº ${numeroViagem}`, W - M, 12, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const agora = new Date();
        doc.text(`${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, W - M, 19, { align: 'right' });

        // ========== CORPO ==========
        let y = 32;

        // --- MOTORISTA E PLACA ---
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('MOTORISTA', M, y);
        doc.text('PLACA', M + CW / 2 + 5, y);

        doc.setTextColor(...BLACK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(trip.motoristas?.nome || 'Não informado', M, y + 6);
        doc.text(trip.veiculo || 'N/A', M + CW / 2 + 5, y + 6);

        y += 14;

        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(M, y, W - M, y);

        y += 6;

        // --- ORIGEM E DESTINO ---
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('ORIGEM', M, y);
        doc.text('DESTINO', M + CW / 2 + 5, y);

        doc.setTextColor(...BLACK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const ori = trip.origem.length > 30 ? trip.origem.slice(0, 27) + '...' : trip.origem;
        const des = trip.destino.length > 30 ? trip.destino.slice(0, 27) + '...' : trip.destino;
        doc.text(ori, M, y + 6);
        doc.text(des, M + CW / 2 + 5, y + 6);

        y += 14;

        // Linha separadora
        doc.line(M, y, W - M, y);

        y += 8;

        // --- 3 CAIXAS: CABEÇAS | KM | DURAÇÃO ---
        const boxW = (CW - 10) / 3;
        const boxH = 22;
        const boxY = y;

        // Caixa 1: Cabeças (verde)
        doc.setFillColor(220, 252, 231);
        doc.roundedRect(M, boxY, boxW, boxH, 2, 2, 'F');
        doc.setTextColor(22, 101, 52);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('CABEÇAS', M + boxW / 2, boxY + 6, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(String(trip.qtd_gado), M + boxW / 2, boxY + 16, { align: 'center' });

        // Caixa 2: KM (vermelho)
        doc.setFillColor(254, 226, 226);
        doc.roundedRect(M + boxW + 5, boxY, boxW, boxH, 2, 2, 'F');
        doc.setTextColor(...RED);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('KM RODADO', M + boxW + 5 + boxW / 2, boxY + 6, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(trip.km_total.toFixed(1) + ' km', M + boxW + 5 + boxW / 2, boxY + 16, { align: 'center' });

        // Caixa 3: Duração (cinza)
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(M + (boxW + 5) * 2, boxY, boxW, boxH, 2, 2, 'F');
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('DURAÇÃO', M + (boxW + 5) * 2 + boxW / 2, boxY + 6, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(calcularDuracao(trip.inicio_em, trip.fim_em), M + (boxW + 5) * 2 + boxW / 2, boxY + 16, { align: 'center' });

        y = boxY + boxH + 8;

        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(M, y, W - M, y);

        y += 6;

        // --- PERÍODO ---
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('INÍCIO', M, y);
        doc.text('FIM', M + CW / 2 + 5, y);

        doc.setTextColor(...BLACK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(formatarData(trip.inicio_em, true), M, y + 6);
        doc.text(trip.fim_em ? formatarData(trip.fim_em, true) : 'Em andamento', M + CW / 2 + 5, y + 6);

        // ========== FOOTER ==========
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('Documento gerado pelo sistema TRVALE DO BOI', W / 2, H - 8, { align: 'center' });

        // Salvar
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
