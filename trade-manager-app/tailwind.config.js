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
                accent: 'var(--accent)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                border: 'var(--border)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
