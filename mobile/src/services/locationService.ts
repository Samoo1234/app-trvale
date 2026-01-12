// =============================================================================
// TRVALE DO BOI - Serviço de Localização GPS
// Captura de GPS a cada 5 segundos usando expo-location
// =============================================================================

import * as Location from 'expo-location';
import { calcularDistanciaHaversine, deslocamentoSignificativo } from '../utils/haversine';
import { salvarPontoGPS, atualizarKmViagem, buscarPontosGPS } from './databaseService';

// Configurações do rastreamento GPS - OTIMIZADO PARA MÁXIMA PRECISÃO
const CONFIG = {
    INTERVALO_MS: 1000,           // Captura a cada 1 segundo (5x mais pontos)
    DISTANCIA_MINIMA_M: 3,        // Ignora apenas ruídos < 3 metros
    PRECISAO_MAXIMA_M: 15,        // Descarta pontos com precisão GPS > 15m
    VELOCIDADE_MAXIMA_MS: 33.3,   // ~120 km/h - detecta saltos impossíveis
    PRECISAO_ALTA: true,          // Usar GPS de alta precisão
};

// Variáveis de controle
let watchSubscription: Location.LocationSubscription | null = null;
let viagemId: string | null = null;
let ultimaLocalizacao: { latitude: number; longitude: number; accuracy?: number; timestamp?: number } | null = null;
let kmAcumulado: number = 0;
let callbackAtualizacao: ((km: number) => void) | null = null;

/**
 * Solicitar permissão de localização
 * Retorna true se a permissão foi concedida
 */
export async function solicitarPermissaoGPS(): Promise<boolean> {
    try {
        // Solicitar permissão de uso em primeiro plano
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

        if (foregroundStatus !== 'granted') {
            console.log('[GPS] Permissão de localização negada');
            return false;
        }

        console.log('[GPS] Permissão de localização concedida');
        return true;
    } catch (error) {
        console.error('[GPS] Erro ao solicitar permissão:', error);
        return false;
    }
}

/**
 * Verificar se GPS está habilitado
 */
export async function verificarGPSAtivo(): Promise<boolean> {
    try {
        const enabled = await Location.hasServicesEnabledAsync();

        if (!enabled) {
            console.log('[GPS] Serviços de localização desabilitados');
        }

        return enabled;
    } catch (error) {
        console.error('[GPS] Erro ao verificar GPS:', error);
        return false;
    }
}

/**
 * Obter localização atual
 */
export async function obterLocalizacaoAtual(): Promise<{ latitude: number; longitude: number } | null> {
    try {
        const localizacao = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return {
            latitude: localizacao.coords.latitude,
            longitude: localizacao.coords.longitude,
        };
    } catch (error) {
        console.error('[GPS] Erro ao obter localização:', error);
        return null;
    }
}

/**
 * Iniciar rastreamento GPS para uma viagem
 * @param idViagem - ID da viagem no banco local
 * @param onKmAtualizado - Callback chamado quando o KM é atualizado
 */
export async function iniciarRastreamentoGPS(
    idViagem: string,
    onKmAtualizado?: (km: number) => void
): Promise<boolean> {
    // Parar rastreamento anterior se houver
    if (watchSubscription) {
        await pararRastreamentoGPS();
    }

    // Verificar permissões
    const temPermissao = await solicitarPermissaoGPS();
    if (!temPermissao) {
        return false;
    }

    // Verificar se GPS está ativo
    const gpsAtivo = await verificarGPSAtivo();
    if (!gpsAtivo) {
        return false;
    }

    // Inicializar variáveis
    viagemId = idViagem;
    ultimaLocalizacao = null;
    kmAcumulado = 0;
    callbackAtualizacao = onKmAtualizado || null;

    // Carregar pontos existentes para calcular KM acumulado
    const pontosExistentes = await buscarPontosGPS(idViagem);
    if (pontosExistentes.length > 0) {
        // Recalcular KM a partir dos pontos existentes
        for (let i = 1; i < pontosExistentes.length; i++) {
            const anterior = pontosExistentes[i - 1];
            const atual = pontosExistentes[i];

            if (deslocamentoSignificativo(
                anterior.latitude, anterior.longitude,
                atual.latitude, atual.longitude,
                CONFIG.DISTANCIA_MINIMA_M
            )) {
                kmAcumulado += calcularDistanciaHaversine(
                    anterior.latitude, anterior.longitude,
                    atual.latitude, atual.longitude
                );
            }
        }

        // Definir última localização
        const ultimoPonto = pontosExistentes[pontosExistentes.length - 1];
        ultimaLocalizacao = {
            latitude: ultimoPonto.latitude,
            longitude: ultimoPonto.longitude,
        };

        console.log(`[GPS] Retomando viagem. KM acumulado: ${(kmAcumulado / 1000).toFixed(2)}`);
    }

    try {
        // Iniciar monitoramento contínuo
        watchSubscription = await Location.watchPositionAsync(
            {
                accuracy: CONFIG.PRECISAO_ALTA
                    ? Location.Accuracy.BestForNavigation
                    : Location.Accuracy.High,
                timeInterval: CONFIG.INTERVALO_MS,
                distanceInterval: 1, // Receber atualizações mesmo com pouca movimentação
            },
            processarNovaLocalizacao
        );

        console.log('[GPS] Rastreamento iniciado para viagem:', idViagem);
        return true;
    } catch (error) {
        console.error('[GPS] Erro ao iniciar rastreamento:', error);
        return false;
    }
}

/**
 * Processar nova localização recebida do GPS
 * Inclui filtros de qualidade para máxima precisão
 */
async function processarNovaLocalizacao(location: Location.LocationObject): Promise<void> {
    if (!viagemId) return;

    const accuracy = location.coords.accuracy || 999;
    const timestamp = location.timestamp;

    // FILTRO 1: Verificar precisão do GPS
    // Descartar pontos com precisão muito baixa (erro alto)
    if (accuracy > CONFIG.PRECISAO_MAXIMA_M) {
        console.log(`[GPS] Ponto descartado - precisão ruim: ${accuracy.toFixed(0)}m`);
        return;
    }

    const novaLocalizacao = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: accuracy,
        timestamp: timestamp,
    };

    // Se é o primeiro ponto, apenas salvar
    if (!ultimaLocalizacao) {
        ultimaLocalizacao = novaLocalizacao;
        await salvarPontoGPS(viagemId, novaLocalizacao.latitude, novaLocalizacao.longitude);
        console.log(`[GPS] Primeiro ponto registrado (precisão: ${accuracy.toFixed(0)}m)`);
        return;
    }

    // Calcular distância percorrida
    const distancia = calcularDistanciaHaversine(
        ultimaLocalizacao.latitude,
        ultimaLocalizacao.longitude,
        novaLocalizacao.latitude,
        novaLocalizacao.longitude
    );

    // FILTRO 2: Verificar velocidade impossível (saltos de GPS)
    const tempoDecorrido = (timestamp - (ultimaLocalizacao.timestamp || timestamp)) / 1000; // segundos
    if (tempoDecorrido > 0) {
        const velocidade = distancia / tempoDecorrido; // metros/segundo
        if (velocidade > CONFIG.VELOCIDADE_MAXIMA_MS) {
            console.log(`[GPS] Ponto descartado - velocidade impossível: ${(velocidade * 3.6).toFixed(0)} km/h`);
            return;
        }
    }

    // FILTRO 3: Verificar deslocamento mínimo (ruído de GPS)
    if (distancia < CONFIG.DISTANCIA_MINIMA_M) {
        // Não é erro, apenas não houve movimento significativo
        return;
    }

    // Ponto válido - atualizar dados
    kmAcumulado += distancia;
    const kmAtual = kmAcumulado / 1000; // Converter para KM

    // Salvar ponto no banco
    await salvarPontoGPS(viagemId, novaLocalizacao.latitude, novaLocalizacao.longitude);

    // Atualizar KM da viagem no banco
    await atualizarKmViagem(viagemId, kmAtual);

    // Chamar callback de atualização
    if (callbackAtualizacao) {
        callbackAtualizacao(kmAtual);
    }

    console.log(`[GPS] +${distancia.toFixed(0)}m | Total: ${kmAtual.toFixed(2)}km | Precisão: ${accuracy.toFixed(0)}m`);

    // Atualizar última localização
    ultimaLocalizacao = novaLocalizacao;
}

/**
 * Parar rastreamento GPS
 * Retorna o KM total percorrido
 */
export async function pararRastreamentoGPS(): Promise<number> {
    if (watchSubscription) {
        watchSubscription.remove();
        watchSubscription = null;
        console.log('[GPS] Rastreamento parado');
    }

    const kmFinal = kmAcumulado / 1000;

    // Resetar variáveis
    viagemId = null;
    ultimaLocalizacao = null;
    const kmRetorno = kmAcumulado;
    kmAcumulado = 0;
    callbackAtualizacao = null;

    return kmRetorno / 1000;
}

/**
 * Verificar se o rastreamento está ativo
 */
export function rastreamentoAtivo(): boolean {
    return watchSubscription !== null;
}

/**
 * Obter KM atual acumulado
 */
export function obterKmAtual(): number {
    return kmAcumulado / 1000;
}

/**
 * Obter precisão atual do GPS em metros
 * Quanto menor, melhor a precisão
 */
export function obterPrecisaoAtual(): number {
    return ultimaLocalizacao?.accuracy || 0;
}
