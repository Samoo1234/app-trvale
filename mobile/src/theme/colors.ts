// =============================================================================
// TRVALE DO BOI - Cores do Tema
// Paleta de cores oficial da identidade visual
// =============================================================================

export const colors = {
    // Cores principais
    primary: '#B71C1C',      // Vermelho sangue principal
    primaryDark: '#7F0000',  // Vermelho escuro para contraste
    secondary: '#D32F2F',    // Vermelho secundário (hover/accent)

    // Neutros
    white: '#FFFFFF',
    background: '#F2F2F2',   // Cinza claro para fundos
    black: '#1C1C1C',        // Preto para textos

    // Cinzas
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',

    // Estados
    success: '#4CAF50',      // Verde para sucesso
    warning: '#FF9800',      // Laranja para avisos
    error: '#F44336',        // Vermelho para erros
    info: '#2196F3',         // Azul para informações

    // Transparências
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
};

// Estilos de sombra padrão
export const shadows = {
    small: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    large: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
};

// Espaçamentos padrão
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Tamanhos de fonte
export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Raios de borda
export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};
