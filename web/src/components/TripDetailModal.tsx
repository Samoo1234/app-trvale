'use client';

// =============================================================================
// TRVALE DO BOI - Modal de Minuta Digital
// Exibe detalhes completos de uma viagem com geração de PDF
// =============================================================================

import { Viagem } from '@/lib/supabase';
import { formatarData, formatarKM, calcularDuracao } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TripDetailModalProps {
    viagem: Viagem | null;
    onClose: () => void;
    isOpen: boolean;
}

export function TripDetailModal({ viagem, onClose, isOpen }: TripDetailModalProps) {
    if (!isOpen || !viagem) return null;

    // Gerar número da viagem (primeiros 8 caracteres do ID em maiúsculo)
    const numeroViagem = viagem.id.slice(0, 8).toUpperCase();

    // Função para gerar PDF com autoTable
    function handleGeneratePDF() {
        if (!viagem) return;
        const trip = viagem;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4' // A4 completo: 210x297mm
        });

        console.log('Gerando PDF v8 - A4 completo');

        const MID = 105; // Centro de A4 (210mm / 2)
        const H = 297; // Altura A4 completa
        let y = 15;

        // TÍTULO
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('MINUTA DE TRANSPORTE', MID, y, { align: 'center' });

        y += 5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('TRVALE DO BOI TRANSPORTADORA', MID, y, { align: 'center' });

        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`Nº ${numeroViagem}`, MID, y, { align: 'center' });

        y += 4;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const dt = new Date();
        doc.text(`Emitido em ${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, MID, y, { align: 'center' });

        y += 6;

        // TABELA 1: Motorista e Placa
        autoTable(doc, {
            startY: y,
            margin: { left: 5, right: 5 },
            head: [['MOTORISTA', 'PLACA DO VEÍCULO']],
            body: [[trip.motoristas?.nome || 'Não informado', trip.veiculo || 'N/A']],
            headStyles: { fillColor: [240, 240, 240], textColor: [100, 100, 100], fontSize: 7, fontStyle: 'normal', halign: 'center' },
            bodyStyles: { textColor: [0, 0, 0], fontSize: 10, fontStyle: 'bold', halign: 'center' },
            theme: 'plain',
            styles: { cellPadding: 2 }
        });

        y = (doc as any).lastAutoTable.finalY + 2;

        // TABELA 2: Origem e Destino
        autoTable(doc, {
            startY: y,
            margin: { left: 5, right: 5 },
            head: [['ORIGEM', 'DESTINO']],
            body: [[trip.origem, trip.destino]],
            headStyles: { fillColor: [240, 240, 240], textColor: [100, 100, 100], fontSize: 7, fontStyle: 'normal', halign: 'center' },
            bodyStyles: { textColor: [0, 0, 0], fontSize: 9, fontStyle: 'bold', halign: 'center' },
            theme: 'plain',
            styles: { cellPadding: 2 }
        });

        y = (doc as any).lastAutoTable.finalY + 2;

        // TABELA 3: Cabeças, KM, Duração
        autoTable(doc, {
            startY: y,
            margin: { left: 5, right: 5 },
            head: [['CABEÇAS DE GADO', 'KM RODADO', 'DURAÇÃO']],
            body: [[
                String(trip.qtd_gado),
                trip.km_total.toFixed(1) + ' km',
                calcularDuracao(trip.inicio_em, trip.fim_em)
            ]],
            headStyles: { fillColor: [240, 240, 240], textColor: [100, 100, 100], fontSize: 7, fontStyle: 'normal', halign: 'center' },
            bodyStyles: { textColor: [0, 0, 0], fontSize: 14, fontStyle: 'bold', halign: 'center' },
            theme: 'plain',
            styles: { cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' }
            }
        });

        y = (doc as any).lastAutoTable.finalY + 2;

        // TABELA 4: Início e Fim
        autoTable(doc, {
            startY: y,
            margin: { left: 5, right: 5 },
            head: [['INÍCIO', 'FIM']],
            body: [[
                formatarData(trip.inicio_em, true),
                trip.fim_em ? formatarData(trip.fim_em, true) : 'Em andamento'
            ]],
            headStyles: { fillColor: [240, 240, 240], textColor: [100, 100, 100], fontSize: 7, fontStyle: 'normal', halign: 'center' },
            bodyStyles: { textColor: [0, 0, 0], fontSize: 9, fontStyle: 'bold', halign: 'center' },
            theme: 'plain',
            styles: { cellPadding: 2 }
        });

        // FOOTER
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.text('Documento gerado pelo sistema TRVALE DO BOI', MID, H - 8, { align: 'center' });

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
