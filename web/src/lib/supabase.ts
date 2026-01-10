// =============================================================================
// TRVALE DO BOI - Cliente Supabase (Web)
// Configuração da conexão com o backend
// =============================================================================

import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase - TRVALE DO BOI (Painel Administrativo)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://erczvpnhgumzkzvudlcv.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyY3p2cG5oZ3Vtemt6dnVkbGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDUyMTAsImV4cCI6MjA4MzI4MTIxMH0.GHQ48BNSNRIl3tDbm1-iiZ9HJmJcacoOb7_HRC_Cn48';

// Criar cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================================================================
// Tipos
// =============================================================================

export interface Motorista {
    id: string;
    nome: string;
    cpf: string;
    ativo: boolean;
    created_at: string;
}

export interface Viagem {
    id: string;
    motorista_id: string;
    veiculo: string;
    origem: string;
    destino: string;
    qtd_gado: number;
    km_total: number;
    inicio_em: string;
    fim_em: string | null;
    sync: boolean;
    created_at: string;
    // Join com motorista
    motoristas?: Motorista;
}

export interface Estatisticas {
    totalKm: number;
    totalViagens: number;
    totalGado: number;
    veiculosAtivos: number;
}

// =============================================================================
// Funções de Autenticação
// =============================================================================

/**
 * Login administrativo
 */
export async function loginAdmin(email: string, senha: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
    });

    if (error) throw error;
    return data;
}

/**
 * Logout
 */
export async function logoutAdmin() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Obter sessão atual
 */
export async function obterSessao() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

// =============================================================================
// Funções de Viagens
// =============================================================================

/**
 * Buscar viagens com filtros
 */
export async function buscarViagens(filtros?: {
    dataInicio?: string;
    dataFim?: string;
    motoristaId?: string;
    veiculo?: string;
}) {
    let query = supabase
        .from('viagens')
        .select(`
      *,
      motoristas (
        id,
        nome,
        cpf
      )
    `)
        .order('inicio_em', { ascending: false });

    // Aplicar filtros
    if (filtros?.dataInicio) {
        query = query.gte('inicio_em', filtros.dataInicio);
    }
    if (filtros?.dataFim) {
        query = query.lte('inicio_em', filtros.dataFim);
    }
    if (filtros?.motoristaId) {
        query = query.eq('motorista_id', filtros.motoristaId);
    }
    if (filtros?.veiculo) {
        query = query.ilike('veiculo', `%${filtros.veiculo}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Viagem[];
}

/**
 * Buscar estatísticas do mês atual
 */
export async function buscarEstatisticasMes(): Promise<Estatisticas> {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('viagens')
        .select('km_total, qtd_gado, veiculo')
        .gte('inicio_em', inicioMes.toISOString())
        .not('fim_em', 'is', null);

    if (error) throw error;

    const viagens = data || [];
    const veiculosUnicos = new Set(viagens.map(v => v.veiculo));

    return {
        totalKm: viagens.reduce((acc, v) => acc + (v.km_total || 0), 0),
        totalViagens: viagens.length,
        totalGado: viagens.reduce((acc, v) => acc + (v.qtd_gado || 0), 0),
        veiculosAtivos: veiculosUnicos.size,
    };
}

/**
 * Buscar motoristas
 */
export async function buscarMotoristas() {
    const { data, error } = await supabase
        .from('motoristas')
        .select('*')
        .eq('ativo', true)
        .order('nome');

    if (error) throw error;
    return data as Motorista[];
}
