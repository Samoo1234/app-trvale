// =============================================================================
// TRVALE DO BOI - Serviço de Banco de Dados Local (SQLite)
// Armazenamento offline para viagens e pontos GPS
// =============================================================================

import * as SQLite from 'expo-sqlite';
import { ViagemLocal, PontoGPSLocal } from '../types';
import { gerarId } from '../utils/formatters';

// Nome do banco de dados local
const DB_NAME = 'trvale.db';

// Instância do banco
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Executar SQL e retornar promise
 */
function executarSQL(database: SQLite.SQLiteDatabase, sql: string, args: any[] = []): Promise<SQLite.SQLResultSet> {
    return new Promise((resolve, reject) => {
        database.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    args,
                    (_, result) => resolve(result),
                    (_, error) => {
                        reject(error);
                        return false;
                    }
                );
            },
            error => reject(error)
        );
    });
}

/**
 * Inicializar o banco de dados SQLite
 * Cria as tabelas se não existirem
 */
export async function inicializarBanco(): Promise<void> {
    try {
        db = SQLite.openDatabase(DB_NAME);

        // Criar tabela de viagens
        await executarSQL(db, `
            CREATE TABLE IF NOT EXISTS viagens (
                id TEXT PRIMARY KEY,
                motorista_id TEXT NOT NULL,
                veiculo TEXT NOT NULL,
                origem TEXT NOT NULL,
                destino TEXT NOT NULL,
                qtd_gado INTEGER NOT NULL DEFAULT 0,
                km_total REAL DEFAULT 0,
                inicio_em TEXT NOT NULL,
                fim_em TEXT,
                sync INTEGER DEFAULT 0
            )
        `);

        // Criar tabela de pontos GPS
        await executarSQL(db, `
            CREATE TABLE IF NOT EXISTS pontos_gps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                viagem_id TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (viagem_id) REFERENCES viagens(id)
            )
        `);

        // Criar índices para melhor performance
        await executarSQL(db, `CREATE INDEX IF NOT EXISTS idx_viagens_sync ON viagens(sync)`);
        await executarSQL(db, `CREATE INDEX IF NOT EXISTS idx_pontos_viagem ON pontos_gps(viagem_id)`);

        console.log('[SQLite] Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('[SQLite] Erro ao inicializar banco:', error);
        throw error;
    }
}

/**
 * Obter instância do banco de dados
 */
function obterBanco(): SQLite.SQLiteDatabase {
    if (!db) {
        throw new Error('Banco de dados não inicializado. Chame inicializarBanco() primeiro.');
    }
    return db;
}

// =============================================================================
// CRUD de Viagens
// =============================================================================

/**
 * Criar nova viagem
 */
export async function criarViagem(dados: {
    motorista_id: string;
    veiculo: string;
    origem: string;
    destino: string;
    qtd_gado: number;
}): Promise<ViagemLocal> {
    const banco = obterBanco();
    const id = gerarId();
    const inicio_em = new Date().toISOString();

    await executarSQL(
        banco,
        `INSERT INTO viagens (id, motorista_id, veiculo, origem, destino, qtd_gado, inicio_em, sync)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [id, dados.motorista_id, dados.veiculo, dados.origem, dados.destino, dados.qtd_gado, inicio_em]
    );

    console.log('[SQLite] Viagem criada:', id);

    return {
        id,
        motorista_id: dados.motorista_id,
        veiculo: dados.veiculo,
        origem: dados.origem,
        destino: dados.destino,
        qtd_gado: dados.qtd_gado,
        km_total: 0,
        inicio_em,
        fim_em: null,
        sync: 0,
    };
}

/**
 * Buscar viagem por ID
 */
export async function buscarViagem(id: string): Promise<ViagemLocal | null> {
    const banco = obterBanco();

    const resultado = await executarSQL(
        banco,
        'SELECT * FROM viagens WHERE id = ?',
        [id]
    );

    if (resultado.rows.length > 0) {
        return resultado.rows.item(0) as ViagemLocal;
    }

    return null;
}

/**
 * Buscar viagem ativa (não finalizada) do motorista
 */
export async function buscarViagemAtiva(motoristaId: string): Promise<ViagemLocal | null> {
    const banco = obterBanco();

    const resultado = await executarSQL(
        banco,
        'SELECT * FROM viagens WHERE motorista_id = ? AND fim_em IS NULL ORDER BY inicio_em DESC LIMIT 1',
        [motoristaId]
    );

    if (resultado.rows.length > 0) {
        return resultado.rows.item(0) as ViagemLocal;
    }

    return null;
}

/**
 * Atualizar KM total da viagem
 */
export async function atualizarKmViagem(id: string, kmTotal: number): Promise<void> {
    const banco = obterBanco();

    await executarSQL(
        banco,
        'UPDATE viagens SET km_total = ? WHERE id = ?',
        [kmTotal, id]
    );

    console.log(`[SQLite] KM atualizado para viagem ${id}: ${kmTotal.toFixed(2)} km`);
}

/**
 * Finalizar viagem
 */
export async function finalizarViagem(id: string, kmTotal: number): Promise<ViagemLocal | null> {
    const banco = obterBanco();
    const fim_em = new Date().toISOString();

    await executarSQL(
        banco,
        'UPDATE viagens SET fim_em = ?, km_total = ? WHERE id = ?',
        [fim_em, kmTotal, id]
    );

    console.log('[SQLite] Viagem finalizada:', id);

    return buscarViagem(id);
}

/**
 * Listar viagens do motorista
 */
export async function listarViagens(
    motoristaId: string,
    limite: number = 20
): Promise<ViagemLocal[]> {
    const banco = obterBanco();

    const resultado = await executarSQL(
        banco,
        'SELECT * FROM viagens WHERE motorista_id = ? ORDER BY inicio_em DESC LIMIT ?',
        [motoristaId, limite]
    );

    const viagens: ViagemLocal[] = [];
    for (let i = 0; i < resultado.rows.length; i++) {
        viagens.push(resultado.rows.item(i) as ViagemLocal);
    }

    return viagens;
}

/**
 * Buscar viagens não sincronizadas
 */
export async function buscarViagensPendentes(): Promise<ViagemLocal[]> {
    const banco = obterBanco();

    const resultado = await executarSQL(
        banco,
        'SELECT * FROM viagens WHERE sync = 0 AND fim_em IS NOT NULL ORDER BY inicio_em ASC'
    );

    const viagens: ViagemLocal[] = [];
    for (let i = 0; i < resultado.rows.length; i++) {
        viagens.push(resultado.rows.item(i) as ViagemLocal);
    }

    return viagens;
}

/**
 * Marcar viagem como sincronizada
 */
export async function marcarViagemSincronizada(id: string): Promise<void> {
    const banco = obterBanco();

    await executarSQL(
        banco,
        'UPDATE viagens SET sync = 1 WHERE id = ?',
        [id]
    );

    console.log('[SQLite] Viagem marcada como sincronizada:', id);
}

// =============================================================================
// CRUD de Pontos GPS
// =============================================================================

/**
 * Salvar ponto GPS
 */
export async function salvarPontoGPS(
    viagemId: string,
    latitude: number,
    longitude: number
): Promise<void> {
    const banco = obterBanco();
    const timestamp = new Date().toISOString();

    await executarSQL(
        banco,
        'INSERT INTO pontos_gps (viagem_id, latitude, longitude, timestamp) VALUES (?, ?, ?, ?)',
        [viagemId, latitude, longitude, timestamp]
    );
}

/**
 * Buscar pontos GPS de uma viagem
 */
export async function buscarPontosGPS(viagemId: string): Promise<PontoGPSLocal[]> {
    const banco = obterBanco();

    const resultado = await executarSQL(
        banco,
        'SELECT * FROM pontos_gps WHERE viagem_id = ? ORDER BY timestamp ASC',
        [viagemId]
    );

    const pontos: PontoGPSLocal[] = [];
    for (let i = 0; i < resultado.rows.length; i++) {
        pontos.push(resultado.rows.item(i) as PontoGPSLocal);
    }

    return pontos;
}

/**
 * Buscar último ponto GPS de uma viagem
 */
export async function buscarUltimoPontoGPS(viagemId: string): Promise<PontoGPSLocal | null> {
    const banco = obterBanco();

    const resultado = await executarSQL(
        banco,
        'SELECT * FROM pontos_gps WHERE viagem_id = ? ORDER BY timestamp DESC LIMIT 1',
        [viagemId]
    );

    if (resultado.rows.length > 0) {
        return resultado.rows.item(0) as PontoGPSLocal;
    }

    return null;
}

/**
 * Contar pontos GPS de uma viagem
 */
export async function contarPontosGPS(viagemId: string): Promise<number> {
    const banco = obterBanco();

    const resultado = await executarSQL(
        banco,
        'SELECT COUNT(*) as count FROM pontos_gps WHERE viagem_id = ?',
        [viagemId]
    );

    if (resultado.rows.length > 0) {
        return resultado.rows.item(0).count || 0;
    }

    return 0;
}

/**
 * Deletar pontos GPS de uma viagem (após sincronização bem-sucedida)
 */
export async function deletarPontosGPS(viagemId: string): Promise<void> {
    const banco = obterBanco();

    await executarSQL(
        banco,
        'DELETE FROM pontos_gps WHERE viagem_id = ?',
        [viagemId]
    );

    console.log('[SQLite] Pontos GPS deletados para viagem:', viagemId);
}

// =============================================================================
// Estatísticas
// =============================================================================

/**
 * Obter estatísticas do motorista
 */
export async function obterEstatisticas(motoristaId: string): Promise<{
    totalViagens: number;
    kmTotal: number;
    viagensHoje: number;
    viagensPendentes: number;
}> {
    const banco = obterBanco();
    const hoje = new Date().toISOString().split('T')[0];

    // Total de viagens finalizadas
    const totalViagensResult = await executarSQL(
        banco,
        'SELECT COUNT(*) as count FROM viagens WHERE motorista_id = ? AND fim_em IS NOT NULL',
        [motoristaId]
    );

    // KM total
    const kmTotalResult = await executarSQL(
        banco,
        'SELECT COALESCE(SUM(km_total), 0) as total FROM viagens WHERE motorista_id = ? AND fim_em IS NOT NULL',
        [motoristaId]
    );

    // Viagens hoje
    const viagensHojeResult = await executarSQL(
        banco,
        "SELECT COUNT(*) as count FROM viagens WHERE motorista_id = ? AND DATE(inicio_em) = ?",
        [motoristaId, hoje]
    );

    // Viagens pendentes de sincronização
    const viagensPendentesResult = await executarSQL(
        banco,
        'SELECT COUNT(*) as count FROM viagens WHERE motorista_id = ? AND sync = 0 AND fim_em IS NOT NULL',
        [motoristaId]
    );

    return {
        totalViagens: totalViagensResult.rows.length > 0 ? totalViagensResult.rows.item(0).count : 0,
        kmTotal: kmTotalResult.rows.length > 0 ? kmTotalResult.rows.item(0).total : 0,
        viagensHoje: viagensHojeResult.rows.length > 0 ? viagensHojeResult.rows.item(0).count : 0,
        viagensPendentes: viagensPendentesResult.rows.length > 0 ? viagensPendentesResult.rows.item(0).count : 0,
    };
}
