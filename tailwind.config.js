/** @type {import('tailwindcss').Config} */
export default {
    // Varre TODOS os arquivos com JSX/TSX para purgar apenas o CSS usado
    content: [
        './index.html',
        './index.tsx',
        './**/*.{tsx,ts}',
        '!./node_modules/**',
    ],
    theme: {
        extend: {
            fontFamily: {
                // Mantém as fontes já declaradas no index.html
                brand: ['Fredoka', 'sans-serif'],
                sans: ['Nunito', 'sans-serif'],
            },
            colors: {
                primary: '#007ACC',
                secondary: '#FBBF24',
            },
            borderRadius: {
                brand: '3rem',
            },
        },
    },
    plugins: [],
};
