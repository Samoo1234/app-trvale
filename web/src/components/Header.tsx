'use client';

// =============================================================================
// TRVALE DO BOI - Componente Header do Painel
// =============================================================================

import { useRouter } from 'next/navigation';
import { logoutAdmin } from '@/lib/supabase';

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
    const router = useRouter();

    async function handleLogout() {
        try {
            await logoutAdmin();
            router.push('/login');
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    }

    return (
        <header className="bg-primary shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo e título */}
                    <div className="flex items-center gap-6">
                        <div className="text-white">
                            <span className="text-2xl font-bold tracking-wide">TRVALE</span>
                            <span className="text-lg font-semibold ml-1">DO BOI</span>
                        </div>
                        <div className="h-8 w-px bg-white/30"></div>
                        <h1 className="text-white text-lg font-medium">{title}</h1>
                    </div>

                    {/* Navegação */}
                    <nav className="flex items-center gap-4">
                        <a
                            href="/dashboard"
                            className="text-white/80 hover:text-white transition-colors px-3 py-2"
                        >
                            Dashboard
                        </a>
                        <a
                            href="/dashboard/viagens"
                            className="text-white/80 hover:text-white transition-colors px-3 py-2"
                        >
                            Viagens
                        </a>
                        <div className="h-6 w-px bg-white/30 mx-2"></div>
                        <button
                            onClick={handleLogout}
                            className="text-white/80 hover:text-white transition-colors px-3 py-2"
                        >
                            Sair
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
}
