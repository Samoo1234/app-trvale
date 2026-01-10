'use client';

// =============================================================================
// TRVALE DO BOI - Página de Login Administrativo
// =============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            await loginAdmin(email, senha);
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Erro no login:', error);
            setErro('Email ou senha incorretos');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-primary py-12 px-4">
                <div className="max-w-md mx-auto text-center">
                    <h1 className="text-5xl font-bold text-white tracking-wider">TRVALE</h1>
                    <p className="text-3xl font-bold text-white mt-1">DO BOI</p>
                    <p className="text-white/70 text-sm tracking-widest mt-2">TRANSPORTADORA</p>
                </div>
            </header>

            {/* Formulário */}
            <main className="flex-1 flex items-start justify-center px-4 -mt-8">
                <div className="card w-full max-w-md animate-fadeIn">
                    <h2 className="text-2xl font-bold text-trvale-black mb-2">
                        Painel Administrativo
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Acesse com suas credenciais de administrador
                    </p>

                    {/* Mensagem de erro */}
                    {erro && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="mb-4">
                            <label htmlFor="email" className="label">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="admin@trvale.com.br"
                                required
                            />
                        </div>

                        {/* Senha */}
                        <div className="mb-6">
                            <label htmlFor="senha" className="label">
                                Senha
                            </label>
                            <input
                                type="password"
                                id="senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner w-5 h-5 border-2"></span>
                                    Entrando...
                                </>
                            ) : (
                                'ENTRAR'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-8">
                        TRVALE DO BOI © {new Date().getFullYear()}
                    </p>
                </div>
            </main>
        </div>
    );
}
