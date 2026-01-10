// =============================================================================
// TRVALE DO BOI - Página Inicial (Redirect)
// =============================================================================

import { redirect } from 'next/navigation';

export default function Home() {
    // Redirecionar para a página de login
    redirect('/login');
}
