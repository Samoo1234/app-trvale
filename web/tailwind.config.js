/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Cores TRVALE
                primary: {
                    DEFAULT: '#B71C1C',
                    dark: '#7F0000',
                    light: '#D32F2F',
                },
                trvale: {
                    red: '#B71C1C',
                    redLight: '#D32F2F',
                    white: '#FFFFFF',
                    gray: '#F2F2F2',
                    black: '#1C1C1C',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
