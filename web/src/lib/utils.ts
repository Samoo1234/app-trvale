// =============================================================================
// TRVALE DO BOI - Funções Utilitárias (Web)
// =============================================================================

/**
 * Formatar data para exibição
 */
export function formatarData(data: string | Date, includeTime: boolean = false): string {
    const d = typeof data === 'string' ? new Date(data) : data;

    if (includeTime) {
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Formatar data e hora
 */
export function formatarDataHora(data: string | Date): string {
    const d = typeof data === 'string' ? new Date(data) : data;
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Formatar KM
 */
export function formatarKM(km: number): string {
    return `${km.toFixed(2)} km`;
}

/**
 * Formatar CPF
 */
export function formatarCPF(cpf: string): string {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Calcular duração entre duas datas
 */
export function calcularDuracao(inicio: string, fim: string | null): string {
    if (!fim) return 'Em andamento';

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    const diff = dataFim.getTime() - dataInicio.getTime();

    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (horas > 0) {
        return `${horas}h ${minutos}min`;
    }
    return `${minutos}min`;
}

/**
 * Gerar nome do arquivo para exportação
 */
export function gerarNomeArquivo(prefixo: string): string {
    const data = new Date().toISOString().split('T')[0];
    return `${prefixo}_${data}.xlsx`;
}
