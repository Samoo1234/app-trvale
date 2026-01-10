// =============================================================================
// TRVALE DO BOI - Layout Principal
// =============================================================================

import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
    title: 'TRVALE DO BOI - Painel Administrativo',
    description: 'Sistema de gerenciamento de transporte de gado',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-trvale-gray min-h-screen">
                {children}
            </body>
        </html>
    );
}
