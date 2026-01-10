// =============================================================================
// TRVALE DO BOI - Cliente Supabase
// Configuração da conexão com o backend
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Credenciais do Supabase - Sistema principal TRVALE
const SUPABASE_URL = 'https://erczvpnhgumzkzvudlcv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyY3p2cG5oZ3Vtemt6dnVkbGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDUyMTAsImV4cCI6MjA4MzI4MTIxMH0.GHQ48BNSNRIl3tDbm1-iiZ9HJmJcacoOb7_HRC_Cn48';

// Cliente Supabase com persistência local
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// =============================================================================
// Funções auxiliares para autenticação
// =============================================================================

/**
 * Buscar motorista por CPF
 * Usado para validar o login
 */
export async function buscarMotoristaPorCPF(cpf: string) {
    // Remover formatação do CPF (pontos e traço)
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Formatar CPF no padrão brasileiro (XXX.XXX.XXX-XX)
    const cpfFormatado = cpfLimpo.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
    );

    // Buscar por CPF formatado OU limpo (compatibilidade com diferentes formatos no banco)
    const { data, error } = await supabase
        .from('motoristas')
        .select('*')
        .or(`cpf.eq.${cpfLimpo},cpf.eq.${cpfFormatado}`)
        .eq('ativo', true)
        .single();

    if (error) {
        console.error('Erro ao buscar motorista:', error.message);
        return null;
    }

    return data;
}

/**
 * Fazer login do motorista usando email no formato cpf@trvale.local
 * Isso permite usar o Supabase Auth padrão
 */
export async function loginMotorista(cpf: string, senha: string) {
    // Formatar CPF como email para usar o Supabase Auth
    const cpfLimpo = cpf.replace(/\D/g, '');
    const email = `${cpfLimpo}@trvale.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Registrar novo motorista
 * Registro simplificado: insere diretamente na tabela motoristas
 * Sem dependência do Supabase Auth (evita erro de email inválido)
 */
export async function registrarMotorista(nome: string, cpf: string, senha: string) {
    // Limpar e formatar CPF
    const cpfLimpo = cpf.replace(/\D/g, '');
    const cpfFormatado = cpfLimpo.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
    );

    console.log('[Registro] Tentando registrar motorista:', { nome, cpfFormatado });

    // 1. Verificar se CPF já existe (buscar em ambos os formatos)
    const { data: existente } = await supabase
        .from('motoristas')
        .select('id')
        .or(`cpf.eq.${cpfLimpo},cpf.eq.${cpfFormatado}`)
        .maybeSingle();

    if (existente) {
        throw new Error('CPF já cadastrado no sistema');
    }

    // 2. Criar hash simples da senha (em produção, use bcrypt no backend)
    // Por enquanto, armazenamos a senha como está (simplificado para MVP)
    const senhaHash = senha; // TODO: Implementar hash seguro

    // 3. Inserir motorista na tabela
    console.log('[Registro] Inserindo motorista na tabela...');
    const { data: motorista, error: dbError } = await supabase
        .from('motoristas')
        .insert({
            nome: nome.trim(),
            cpf: cpfFormatado,
            senha: senhaHash,
            ativo: true,
        })
        .select()
        .single();

    if (dbError) {
        console.error('[Registro] Erro ao inserir motorista:', dbError.message);
        throw new Error('Erro ao salvar dados do motorista: ' + dbError.message);
    }

    console.log('[Registro] Motorista registrado com sucesso:', motorista);
    return motorista;
}

/**
 * Fazer logout do motorista
 */
export async function logoutMotorista() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw new Error(error.message);
    }
}

/**
 * Obter sessão atual
 */
export async function obterSessaoAtual() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Erro ao obter sessão:', error.message);
        return null;
    }

    return data.session;
}

// =============================================================================
// Funções para viagens
// =============================================================================

/**
 * Sincronizar viagem com o Supabase
 */
export async function sincronizarViagem(viagem: any) {
    const { data, error } = await supabase
        .from('viagens')
        .upsert({
            id: viagem.id,
            motorista_id: viagem.motorista_id,
            veiculo: viagem.veiculo,
            origem: viagem.origem,
            destino: viagem.destino,
            qtd_gado: viagem.qtd_gado,
            km_total: viagem.km_total,
            inicio_em: viagem.inicio_em,
            fim_em: viagem.fim_em,
            sync: true,
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Sincronizar pontos GPS com o Supabase
 */
export async function sincronizarPontosGPS(viagemId: string, pontos: any[]) {
    const pontosFormatados = pontos.map(p => ({
        viagem_id: viagemId,
        latitude: p.latitude,
        longitude: p.longitude,
        timestamp: p.timestamp,
    }));

    const { error } = await supabase
        .from('pontos_gps')
        .insert(pontosFormatados);

    if (error) {
        throw new Error(error.message);
    }
}
