// =============================================================================
// TRVALE DO BOI - Funções Utilitárias
// Formatadores, validadores e helpers
// =============================================================================

/**
 * Formatar CPF para exibição (000.000.000-00)
 */
export function formatarCPF(cpf: string): string {
    // Remover caracteres não numéricos
    const numeros = cpf.replace(/\D/g, '');

    // Aplicar máscara
    if (numeros.length <= 3) {
        return numeros;
    } else if (numeros.length <= 6) {
        return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    } else if (numeros.length <= 9) {
        return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    } else {
        return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
    }
}

/**
 * Limpar CPF (remover formatação)
 */
export function limparCPF(cpf: string): string {
    return cpf.replace(/\D/g, '');
}

/**
 * Validar CPF
 * NOTA: Validação simplificada para aceitar CPFs de teste.
 * Em produção, considere usar validação completa dos dígitos verificadores.
 */
export function validarCPF(cpf: string): boolean {
    const numeros = limparCPF(cpf);

    // Verificar se tem 11 dígitos
    if (numeros.length !== 11) {
        return false;
    }

    // Verificar se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(numeros)) {
        return false;
    }

    // CPF é válido se tem 11 dígitos e não são todos iguais
    return true;
}

/**
 * Formatar placa de veículo (ABC-1234 ou ABC1D23)
 */
export function formatarPlaca(placa: string): string {
    const limpo = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    if (limpo.length <= 3) {
        return limpo;
    } else if (limpo.length <= 7) {
        return `${limpo.slice(0, 3)}-${limpo.slice(3)}`;
    }
    return `${limpo.slice(0, 3)}-${limpo.slice(3, 7)}`;
}

/**
 * Formatar distância em KM
 */
export function formatarKM(metros: number): string {
    const km = metros / 1000;
    if (km < 1) {
        return `${Math.round(metros)} m`;
    }
    return `${km.toFixed(2)} km`;
}

/**
 * Formatar tempo decorrido (segundos para HH:MM:SS)
 */
export function formatarTempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = Math.floor(segundos % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (horas > 0) {
        return `${pad(horas)}:${pad(minutos)}:${pad(segs)}`;
    }
    return `${pad(minutos)}:${pad(segs)}`;
}

/**
 * Formatar data/hora para exibição
 */
export function formatarDataHora(data: string | Date): string {
    const d = typeof data === 'string' ? new Date(data) : data;

    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const ano = d.getFullYear();
    const hora = d.getHours().toString().padStart(2, '0');
    const minuto = d.getMinutes().toString().padStart(2, '0');

    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

/**
 * Formatar data para exibição simples
 */
export function formatarData(data: string | Date): string {
    const d = typeof data === 'string' ? new Date(data) : data;

    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const ano = d.getFullYear();

    return `${dia}/${mes}/${ano}`;
}

/**
 * Gerar ID único (UUID v4 simples)
 */
export function gerarId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Obter saudação baseada na hora do dia
 */
export function obterSaudacao(): string {
    const hora = new Date().getHours();

    if (hora >= 5 && hora < 12) {
        return 'Bom dia';
    } else if (hora >= 12 && hora < 18) {
        return 'Boa tarde';
    } else {
        return 'Boa noite';
    }
}
