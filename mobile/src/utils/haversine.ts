// =============================================================================
// TRVALE DO BOI - Fórmula de Haversine
// Cálculo de distância entre coordenadas GPS
// =============================================================================

/**
 * Raio da Terra em metros
 */
const RAIO_TERRA_METROS = 6371000;

/**
 * Converter graus para radianos
 */
function grausParaRadianos(graus: number): number {
    return graus * (Math.PI / 180);
}

/**
 * Calcular distância entre dois pontos GPS usando a fórmula de Haversine
 * 
 * A fórmula de Haversine calcula a distância entre dois pontos em uma esfera
 * dado suas latitudes e longitudes. É precisa para distâncias curtas e médias.
 * 
 * @param lat1 - Latitude do ponto 1 (em graus)
 * @param lon1 - Longitude do ponto 1 (em graus)
 * @param lat2 - Latitude do ponto 2 (em graus)
 * @param lon2 - Longitude do ponto 2 (em graus)
 * @returns Distância em metros
 */
export function calcularDistanciaHaversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    // Converter coordenadas para radianos
    const φ1 = grausParaRadianos(lat1);
    const φ2 = grausParaRadianos(lat2);
    const Δφ = grausParaRadianos(lat2 - lat1);
    const Δλ = grausParaRadianos(lon2 - lon1);

    // Fórmula de Haversine
    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distância em metros
    const distancia = RAIO_TERRA_METROS * c;

    return distancia;
}

/**
 * Verificar se o deslocamento é significativo (maior que threshold)
 * Usado para filtrar ruído de GPS
 * 
 * @param lat1 - Latitude do ponto anterior
 * @param lon1 - Longitude do ponto anterior
 * @param lat2 - Latitude do ponto atual
 * @param lon2 - Longitude do ponto atual
 * @param thresholdMetros - Distância mínima em metros (padrão: 10m)
 * @returns true se o deslocamento for significativo
 */
export function deslocamentoSignificativo(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    thresholdMetros: number = 10
): boolean {
    const distancia = calcularDistanciaHaversine(lat1, lon1, lat2, lon2);
    return distancia >= thresholdMetros;
}

/**
 * Calcular distância total de uma lista de pontos GPS
 * Ignora deslocamentos menores que o threshold
 * 
 * @param pontos - Array de pontos com latitude e longitude
 * @param thresholdMetros - Distância mínima para considerar (padrão: 10m)
 * @returns Distância total em metros
 */
export function calcularDistanciaTotal(
    pontos: Array<{ latitude: number; longitude: number }>,
    thresholdMetros: number = 10
): number {
    if (pontos.length < 2) {
        return 0;
    }

    let distanciaTotal = 0;

    for (let i = 1; i < pontos.length; i++) {
        const pontoAnterior = pontos[i - 1];
        const pontoAtual = pontos[i];

        const distancia = calcularDistanciaHaversine(
            pontoAnterior.latitude,
            pontoAnterior.longitude,
            pontoAtual.latitude,
            pontoAtual.longitude
        );

        // Só adicionar se for um deslocamento significativo
        // Isso filtra erros de GPS quando o veículo está parado
        if (distancia >= thresholdMetros) {
            distanciaTotal += distancia;
        }
    }

    return distanciaTotal;
}

/**
 * Converter metros para quilômetros
 */
export function metrosParaKm(metros: number): number {
    return metros / 1000;
}

/**
 * Calcular velocidade média em km/h
 * 
 * @param distanciaMetros - Distância em metros
 * @param tempoSegundos - Tempo em segundos
 * @returns Velocidade em km/h
 */
export function calcularVelocidadeMedia(
    distanciaMetros: number,
    tempoSegundos: number
): number {
    if (tempoSegundos <= 0) {
        return 0;
    }

    const distanciaKm = metrosParaKm(distanciaMetros);
    const tempoHoras = tempoSegundos / 3600;

    return distanciaKm / tempoHoras;
}
