// =============================================================================
// TRVALE DO BOI - Definições de Tipos
// =============================================================================

// Motorista autenticado
export interface Motorista {
    id: string;
    nome: string;
    cpf: string;
    ativo: boolean;
    created_at: string;
}

// Viagem
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
}

// Viagem local (SQLite)
export interface ViagemLocal {
    id: string;
    motorista_id: string;
    veiculo: string;
    origem: string;
    destino: string;
    qtd_gado: number;
    km_total: number;
    inicio_em: string;
    fim_em: string | null;
    sync: number; // SQLite usa 0/1 para boolean
}

// Ponto GPS
export interface PontoGPS {
    latitude: number;
    longitude: number;
    timestamp: string;
}

// Ponto GPS local (SQLite)
export interface PontoGPSLocal {
    id: number;
    viagem_id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
}

// Dados para criar nova viagem
export interface NovaViagemDTO {
    veiculo: string;
    origem: string;
    destino: string;
    qtd_gado: number;
}

// Estado da viagem ativa
export interface ViagemAtivaState {
    viagem: ViagemLocal;
    kmPercorrido: number;
    tempoDecorrido: number; // em segundos
    ultimoPonto: PontoGPS | null;
}

// Contexto de autenticação
export interface AuthContextData {
    motorista: Motorista | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (cpf: string, senha: string) => Promise<void>;
    signOut: () => Promise<void>;
}

// Estatísticas do dashboard
export interface Estatisticas {
    totalViagens: number;
    kmTotal: number;
    viagensHoje: number;
    viagensPendentes: number;
}

// Tipos de navegação
export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Dashboard: undefined;
    NovaViagem: undefined;
    ViagemAtiva: { viagemId: string };
    Historico: undefined;
};
