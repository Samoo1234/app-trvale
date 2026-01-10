// =============================================================================
// TRVALE DO BOI - Serviço de Sincronização
// Sincroniza dados offline com o Supabase quando há conexão
// =============================================================================

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { buscarViagensPendentes, marcarViagemSincronizada, buscarPontosGPS, deletarPontosGPS } from './databaseService';
import { sincronizarViagem, sincronizarPontosGPS } from './supabaseClient';

// Configurações
const CONFIG = {
    INTERVALO_VERIFICACAO_MS: 30000, // Verificar a cada 30 segundos
    MAX_TENTATIVAS: 3,               // Máximo de tentativas por viagem
};

// Variáveis de controle
let intervalId: NodeJS.Timeout | null = null;
let sincronizando: boolean = false;
let tentativasViagem: Map<string, number> = new Map();
let callbackStatus: ((sincronizando: boolean, pendentes: number) => void) | null = null;

/**
 * Verificar se há conexão com internet
 */
export async function verificarConexao(): Promise<boolean> {
    try {
        const state = await NetInfo.fetch();
        return state.isConnected === true && state.isInternetReachable === true;
    } catch (error) {
        console.error('[Sync] Erro ao verificar conexão:', error);
        return false;
    }
}

/**
 * Iniciar serviço de sincronização automática
 * @param onStatusChange - Callback chamado quando o status muda
 */
export function iniciarSincronizacaoAutomatica(
    onStatusChange?: (sincronizando: boolean, pendentes: number) => void
): void {
    if (intervalId) {
        console.log('[Sync] Serviço já está em execução');
        return;
    }

    callbackStatus = onStatusChange || null;

    // Configurar listener de mudança de conexão
    NetInfo.addEventListener(handleConexaoMudou);

    // Iniciar verificação periódica
    intervalId = setInterval(executarSincronizacao, CONFIG.INTERVALO_VERIFICACAO_MS);

    // Executar sincronização inicial
    executarSincronizacao();

    console.log('[Sync] Serviço de sincronização iniciado');
}

/**
 * Parar serviço de sincronização automática
 */
export function pararSincronizacaoAutomatica(): void {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    callbackStatus = null;
    console.log('[Sync] Serviço de sincronização parado');
}

/**
 * Handler para mudança de conexão
 */
function handleConexaoMudou(state: NetInfoState): void {
    if (state.isConnected && state.isInternetReachable) {
        console.log('[Sync] Conexão detectada, iniciando sincronização...');
        executarSincronizacao();
    }
}

/**
 * Executar sincronização de viagens pendentes
 */
export async function executarSincronizacao(): Promise<void> {
    // Evitar múltiplas execuções simultâneas
    if (sincronizando) {
        console.log('[Sync] Sincronização já em andamento');
        return;
    }

    // Verificar conexão
    const temConexao = await verificarConexao();
    if (!temConexao) {
        console.log('[Sync] Sem conexão com internet');
        return;
    }

    sincronizando = true;

    try {
        // Buscar viagens pendentes de sincronização
        const viagensPendentes = await buscarViagensPendentes();

        if (viagensPendentes.length === 0) {
            console.log('[Sync] Nenhuma viagem pendente');
            notificarStatus(false, 0);
            return;
        }

        console.log(`[Sync] ${viagensPendentes.length} viagem(ns) pendente(s)`);
        notificarStatus(true, viagensPendentes.length);

        // Sincronizar cada viagem
        for (const viagem of viagensPendentes) {
            try {
                await sincronizarUmaViagem(viagem);
            } catch (error) {
                console.error(`[Sync] Erro ao sincronizar viagem ${viagem.id}:`, error);

                // Incrementar tentativas
                const tentativas = (tentativasViagem.get(viagem.id) || 0) + 1;
                tentativasViagem.set(viagem.id, tentativas);

                if (tentativas >= CONFIG.MAX_TENTATIVAS) {
                    console.warn(`[Sync] Viagem ${viagem.id} excedeu limite de tentativas`);
                }
            }
        }

        // Buscar viagens pendentes restantes
        const pendentesRestantes = await buscarViagensPendentes();
        notificarStatus(false, pendentesRestantes.length);

    } catch (error) {
        console.error('[Sync] Erro na sincronização:', error);
    } finally {
        sincronizando = false;
    }
}

/**
 * Sincronizar uma viagem específica
 */
async function sincronizarUmaViagem(viagem: any): Promise<void> {
    console.log(`[Sync] Sincronizando viagem ${viagem.id}...`);

    // Enviar viagem para o Supabase
    await sincronizarViagem({
        id: viagem.id,
        motorista_id: viagem.motorista_id,
        veiculo: viagem.veiculo,
        origem: viagem.origem,
        destino: viagem.destino,
        qtd_gado: viagem.qtd_gado,
        km_total: viagem.km_total,
        inicio_em: viagem.inicio_em,
        fim_em: viagem.fim_em,
    });

    // Buscar e enviar pontos GPS
    const pontos = await buscarPontosGPS(viagem.id);
    if (pontos.length > 0) {
        await sincronizarPontosGPS(viagem.id, pontos);

        // Deletar pontos locais após sincronização
        await deletarPontosGPS(viagem.id);
    }

    // Marcar viagem como sincronizada
    await marcarViagemSincronizada(viagem.id);

    // Limpar contagem de tentativas
    tentativasViagem.delete(viagem.id);

    console.log(`[Sync] Viagem ${viagem.id} sincronizada com sucesso`);
}

/**
 * Notificar mudança de status
 */
function notificarStatus(emSincronizacao: boolean, pendentes: number): void {
    if (callbackStatus) {
        callbackStatus(emSincronizacao, pendentes);
    }
}

/**
 * Forçar sincronização imediata
 */
export async function forcarSincronizacao(): Promise<boolean> {
    try {
        await executarSincronizacao();
        const pendentes = await buscarViagensPendentes();
        return pendentes.length === 0;
    } catch (error) {
        console.error('[Sync] Erro ao forçar sincronização:', error);
        return false;
    }
}

/**
 * Obter número de viagens pendentes
 */
export async function obterViagensPendentes(): Promise<number> {
    const pendentes = await buscarViagensPendentes();
    return pendentes.length;
}
