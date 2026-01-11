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

        const RED: [number, number, number] = [183, 28, 28];
        const BLACK: [number, number, number] = [0, 0, 0];
        const GRAY: [number, number, number] = [100, 100, 100];
        const LIGHT_GRAY: [number, number, number] = [240, 240, 240];
        const WHITE: [number, number, number] = [255, 255, 255];

        const pageWidth = 210;
        const margin = 10;
        const contentWidth = pageWidth - margin * 2;
        let y = 0;

        // ============ HEADER VERMELHO ============
        doc.setFillColor(...RED);
        doc.rect(0, 0, pageWidth, 22, 'F');

        doc.setTextColor(...WHITE);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('MINUTA DE TRANSPORTE', margin, 10);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('TRVALE DO BOI TRANSPORTADORA', margin, 17);

        // Número da viagem no canto direito do header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Nº ${numeroViagem}`, pageWidth - margin, 10, { align: 'right' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const dataEmissao = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        doc.text(dataEmissao, pageWidth - margin, 17, { align: 'right' });

        y = 28;

        // ============ SEÇÃO: DADOS DO TRANSPORTE ============
        // Borda externa
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.rect(margin, y, contentWidth, 35);

        // Título da seção
        doc.setFillColor(...LIGHT_GRAY);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setTextColor(...BLACK);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('DADOS DO TRANSPORTE', margin + 3, y + 5);

        y += 10;

        // Grid 2x2
        const halfWidth = contentWidth / 2;

        // Linha 1: Motorista | Placa
        doc.setTextColor(...GRAY);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('MOTORISTA', margin + 3, y);
        doc.text('PLACA DO VEÍCULO', margin + halfWidth + 3, y);

        doc.setTextColor(...BLACK);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(trip.motoristas?.nome || 'Não informado', margin + 3, y + 6);
        doc.text(trip.veiculo || 'N/A', margin + halfWidth + 3, y + 6);

        // Linha divisória horizontal
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y + 10, margin + contentWidth, y + 10);

        y += 14;

        // Linha 2: Origem | Destino
        doc.setTextColor(...GRAY);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('ORIGEM', margin + 3, y);
        doc.text('DESTINO', margin + halfWidth + 3, y);

        doc.setTextColor(...BLACK);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');

        const origem = trip.origem.length > 35 ? trip.origem.substring(0, 32) + '...' : trip.origem;
        const destino = trip.destino.length > 35 ? trip.destino.substring(0, 32) + '...' : trip.destino;

        doc.text(origem, margin + 3, y + 6);
        doc.text(destino, margin + halfWidth + 3, y + 6);

        // Linha divisória vertical central
        doc.line(margin + halfWidth, y - 14, margin + halfWidth, y + 10);

        y += 18;

        // ============ SEÇÃO: DADOS DA CARGA ============
        doc.setDrawColor(180, 180, 180);
        doc.rect(margin, y, contentWidth, 28);

        doc.setFillColor(...LIGHT_GRAY);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setTextColor(...BLACK);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('DADOS DA CARGA', margin + 3, y + 5);

        y += 10;

        // 3 colunas: Cabeças | KM | Duração
        const colWidth = contentWidth / 3;

        // Coluna 1: Cabeças
        doc.setTextColor(...GRAY);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('CABEÇAS DE GADO', margin + colWidth / 2, y, { align: 'center' });
        doc.setTextColor(22, 101, 52); // verde
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(String(trip.qtd_gado), margin + colWidth / 2, y + 10, { align: 'center' });

        // Coluna 2: KM
        doc.setTextColor(...GRAY);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('KM PERCORRIDO', margin + colWidth + colWidth / 2, y, { align: 'center' });
        doc.setTextColor(...RED);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(formatarKM(trip.km_total), margin + colWidth + colWidth / 2, y + 10, { align: 'center' });

        // Coluna 3: Duração
        doc.setTextColor(...GRAY);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('DURAÇÃO', margin + colWidth * 2 + colWidth / 2, y, { align: 'center' });
        doc.setTextColor(...BLACK);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(calcularDuracao(trip.inicio_em, trip.fim_em), margin + colWidth * 2 + colWidth / 2, y + 10, { align: 'center' });

        // Linhas divisórias verticais
        doc.setDrawColor(200, 200, 200);
        doc.line(margin + colWidth, y - 3, margin + colWidth, y + 14);
        doc.line(margin + colWidth * 2, y - 3, margin + colWidth * 2, y + 14);

        y += 21;

        // ============ SEÇÃO: PERÍODO ============
        doc.setDrawColor(180, 180, 180);
        doc.rect(margin, y, contentWidth, 20);

        doc.setFillColor(...LIGHT_GRAY);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setTextColor(...BLACK);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('PERÍODO DA VIAGEM', margin + 3, y + 5);

        y += 10;

        // Início | Fim
        doc.setTextColor(...GRAY);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('INÍCIO', margin + 3, y);
        doc.text('FIM', margin + halfWidth + 3, y);

        doc.setTextColor(...BLACK);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(formatarData(trip.inicio_em, true), margin + 3, y + 6);
        doc.text(trip.fim_em ? formatarData(trip.fim_em, true) : 'Em andamento', margin + halfWidth + 3, y + 6);

        // Linha divisória vertical
        doc.line(margin + halfWidth, y - 3, margin + halfWidth, y + 8);

        y += 15;

        // ============ FOOTER ============
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Documento gerado automaticamente pelo sistema TRVALE DO BOI', pageWidth / 2, y + 3, { align: 'center' });

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
