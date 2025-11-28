import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*. {js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: '#3b82f6',
                    dark: '#60a5fa',
                },
                text: {
                    DEFAULT: '#1f2937',
                    dark: '#f9fafb',
                    secondary: '#6b7280',
                    darkSecondary: '#9ca3af',
                },
                cardBg: {
                    DEFAULT: '#ffffff',
                    dark: '#1f2937',
                },
                border: {
                    DEFAULT: '#e5e7eb',
                    dark: '#374151',
                },
            },
        },
    },
    plugins: [
        // Custom scrollbar plugin
        function({ addUtilities }: any) {
            const newUtilities = {
                '. scrollbar-thin': {
                    'scrollbar-width': 'thin',
                    'scrollbar-color': '#9ca3af #f3f4f6',
                },
                '.dark .scrollbar-thin': {
                    'scrollbar-color': '#4b5563 #1f2937',
                },
                '.scrollbar-thin::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                },
                '.scrollbar-thin::-webkit-scrollbar-track': {
                    background: '#f3f4f6',
                    'border-radius': '10px',
                },
                '. dark .scrollbar-thin::-webkit-scrollbar-track': {
                    background: '#1f2937',
                },
                '.scrollbar-thin::-webkit-scrollbar-thumb': {
                    background: '#9ca3af',
                    'border-radius': '10px',
                },
                '. scrollbar-thin::-webkit-scrollbar-thumb:hover': {
                    background: '#6b7280',
                },
                '.dark .scrollbar-thin::-webkit-scrollbar-thumb': {
                    background: '#4b5563',
                },
                '.dark .scrollbar-thin::-webkit-scrollbar-thumb:hover': {
                    background: '#6b7280',
                },
            }
            addUtilities(newUtilities)
        },
    ],
};
export default config;