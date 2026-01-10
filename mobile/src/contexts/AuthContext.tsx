// =============================================================================
// TRVALE DO BOI - Contexto de Autenticação
// Gerenciamento de estado global de autenticação do motorista
// =============================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Motorista, AuthContextData } from '../types';
import { loginMotorista, logoutMotorista, obterSessaoAtual, buscarMotoristaPorCPF } from '../services/supabaseClient';
import { inicializarBanco } from '../services/databaseService';
import { iniciarSincronizacaoAutomatica, pararSincronizacaoAutomatica } from '../services/syncService';

// Chave para armazenar dados do motorista localmente
const STORAGE_KEY_MOTORISTA = '@trvale:motorista';

// Contexto de autenticação
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Props do provider
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Provider de autenticação
 * Envolve a aplicação e fornece estado de autenticação global
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [motorista, setMotorista] = useState<Motorista | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar sessão ao iniciar
    useEffect(() => {
        carregarSessao();
    }, []);

    // Iniciar sincronização quando logado
    useEffect(() => {
        if (motorista) {
            iniciarSincronizacaoAutomatica();
        } else {
            pararSincronizacaoAutomatica();
        }
    }, [motorista]);

    /**
     * Carregar sessão salva localmente
     */
    async function carregarSessao() {
        try {
            setIsLoading(true);

            // Inicializar banco de dados
            await inicializarBanco();

            // Verificar sessão no Supabase
            const sessao = await obterSessaoAtual();

            if (sessao) {
                // Tentar carregar dados do motorista do storage local
                const dadosSalvos = await AsyncStorage.getItem(STORAGE_KEY_MOTORISTA);

                if (dadosSalvos) {
                    const motoristaSalvo = JSON.parse(dadosSalvos) as Motorista;
                    setMotorista(motoristaSalvo);
                    console.log('[Auth] Sessão restaurada para:', motoristaSalvo.nome);
                }
            }
        } catch (error) {
            console.error('[Auth] Erro ao carregar sessão:', error);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Fazer login do motorista
     * Login simplificado: verifica CPF e senha na tabela motoristas
     */
    async function signIn(cpf: string, senha: string): Promise<void> {
        try {
            // Buscar motorista pelo CPF
            const dadosMotorista = await buscarMotoristaPorCPF(cpf);

            if (!dadosMotorista) {
                throw new Error('CPF não encontrado ou motorista inativo');
            }

            // Verificar senha
            if (!senha || senha.length < 4) {
                throw new Error('Digite uma senha válida');
            }

            // Verificar se a senha está correta (se o motorista tem senha cadastrada)
            if (dadosMotorista.senha && dadosMotorista.senha !== senha) {
                throw new Error('Senha incorreta');
            }

            // Salvar dados do motorista localmente (sem a senha)
            const { senha: _, ...motoristaSemSenha } = dadosMotorista;
            await AsyncStorage.setItem(STORAGE_KEY_MOTORISTA, JSON.stringify(motoristaSemSenha));

            setMotorista(motoristaSemSenha as Motorista);
            console.log('[Auth] Login realizado para:', dadosMotorista.nome);
        } catch (error) {
            console.error('[Auth] Erro no login:', error);
            throw error;
        }
    }

    /**
     * Fazer logout do motorista
     */
    async function signOut(): Promise<void> {
        try {
            // Logout no Supabase
            await logoutMotorista();

            // Limpar dados locais
            await AsyncStorage.removeItem(STORAGE_KEY_MOTORISTA);

            setMotorista(null);
            console.log('[Auth] Logout realizado');
        } catch (error) {
            console.error('[Auth] Erro no logout:', error);
            throw error;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                motorista,
                isLoading,
                isAuthenticated: !!motorista,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth(): AuthContextData {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }

    return context;
}
