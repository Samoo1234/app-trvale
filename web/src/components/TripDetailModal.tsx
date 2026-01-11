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
        // Guard clause para TypeScript - viagem já foi verificado no escopo pai
        if (!viagem) return;

        // Captura local para TypeScript type narrowing
        const trip = viagem;

        // Criar documento A4 (210mm x 297mm), mas usaremos metade da altura
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [210, 148.5] // Meia página A4
        });

        const primaryColor: [number, number, number] = [183, 28, 28]; // #B71C1C
        const pageWidth = 210;
        let y = 0;

        // ============ HEADER ============
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 28, 'F');

        // Título
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('MINUTA DIGITAL', 10, 12);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('TRVALE DO BOI - Transportadora', 10, 18);

        // Número da viagem (destaque no header)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Viagem Nº: ${numeroViagem}`, 10, 25);

        // Data de emissão no canto direito
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const dataEmissao = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        doc.text(dataEmissao, pageWidth - 10, 12, { align: 'right' });

        y = 35;

        // ============ MOTORISTA E VEÍCULO ============
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(7);
        doc.text('MOTORISTA', 10, y);
        doc.text('PLACA DO VEÍCULO', 110, y);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(trip.motoristas?.nome || 'Não informado', 10, y + 5);
        doc.text(trip.veiculo || 'N/A', 110, y + 5);

        y += 15;

        // ============ ITINERÁRIO ============
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('ORIGEM', 10, y);
        doc.text('DESTINO', 110, y);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');

        // Truncar texto longo
        const maxTextWidth = 90;
        const origem = trip.origem.length > 40 ? trip.origem.substring(0, 37) + '...' : trip.origem;
        const destino = trip.destino.length > 40 ? trip.destino.substring(0, 37) + '...' : trip.destino;

        doc.text(origem, 10, y + 5);
        doc.text(destino, 110, y + 5);

        // Seta entre origem e destino
        doc.setTextColor(...primaryColor);
        doc.setFontSize(14);
        doc.text('→', 100, y + 5);

        y += 18;

        // ============ LINHA DIVISÓRIA ============
        doc.setDrawColor(200, 200, 200);
        doc.line(10, y, pageWidth - 10, y);
        y += 5;

        // ============ DADOS DA CARGA (3 COLUNAS) ============
        const colWidth = (pageWidth - 20) / 3;

        // Cabeças de Gado
        doc.setFillColor(220, 252, 231); // verde claro
        doc.roundedRect(10, y, colWidth - 5, 25, 3, 3, 'F');
        doc.setTextColor(22, 101, 52);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('CABEÇAS DE GADO', 10 + (colWidth - 5) / 2, y + 6, { align: 'center' });
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(String(trip.qtd_gado), 10 + (colWidth - 5) / 2, y + 18, { align: 'center' });

        // KM Percorrido
        doc.setFillColor(254, 226, 226); // vermelho claro
        doc.roundedRect(10 + colWidth, y, colWidth - 5, 25, 3, 3, 'F');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('KM PERCORRIDO', 10 + colWidth + (colWidth - 5) / 2, y + 6, { align: 'center' });
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(formatarKM(trip.km_total), 10 + colWidth + (colWidth - 5) / 2, y + 18, { align: 'center' });

        // Duração
        doc.setFillColor(229, 231, 235); // cinza claro
        doc.roundedRect(10 + colWidth * 2, y, colWidth - 5, 25, 3, 3, 'F');
        doc.setTextColor(55, 65, 81);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('DURAÇÃO', 10 + colWidth * 2 + (colWidth - 5) / 2, y + 6, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(calcularDuracao(trip.inicio_em, trip.fim_em), 10 + colWidth * 2 + (colWidth - 5) / 2, y + 18, { align: 'center' });

        y += 32;

        // ============ DATAS ============
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('INÍCIO DA VIAGEM', 10, y);
        doc.text('FIM DA VIAGEM', 110, y);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(formatarData(trip.inicio_em, true), 10, y + 5);
        doc.text(trip.fim_em ? formatarData(trip.fim_em, true) : 'Em andamento', 110, y + 5);

        y += 15;

        // ============ FOOTER ============
        doc.setDrawColor(200, 200, 200);
        doc.line(10, y, pageWidth - 10, y);
        y += 5;

        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Documento gerado automaticamente pelo sistema TRVALE DO BOI', pageWidth / 2, y + 3, { align: 'center' });

        // Salvar PDF
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
