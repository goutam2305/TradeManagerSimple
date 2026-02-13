/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                panel: 'var(--panel)',
                surface: 'var(--surface)',
                accent: 'var(--accent)',
                'accent-hover': 'var(--accent-hover)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                border: 'var(--border)',
                success: 'var(--success)',
                danger: 'var(--danger)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
