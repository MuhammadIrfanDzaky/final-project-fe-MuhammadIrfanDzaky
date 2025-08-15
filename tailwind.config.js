/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        './src/app/**/*.{ts,tsx,js,jsx}',
        './src/components/**/*.{ts,tsx,js,jsx}',
        './src/pages/**/*.{ts,tsx,js,jsx}',
        './src/**/*.{ts,tsx,js,jsx}',
        './app/**/*.{ts,tsx,js,jsx}'
    ],
    theme: {
        extend: {
            colors: {
                background: ({ opacityVariable, opacityValue }) => {
                    if (opacityValue !== undefined) {
                        return `hsl(var(--background) / ${opacityValue})`;
                    }
                    if (opacityVariable !== undefined) {
                        return `hsl(var(--background) / var(${opacityVariable}, 1))`;
                    }
                    return 'hsl(var(--background))';
                },
                foreground: ({ opacityVariable, opacityValue }) => {
                    if (opacityValue !== undefined) {
                        return `hsl(var(--foreground) / ${opacityValue})`;
                    }
                    if (opacityVariable !== undefined) {
                        return `hsl(var(--foreground) / var(${opacityVariable}, 1))`;
                    }
                    return 'hsl(var(--foreground))';
                },
                primary: ({ opacityVariable, opacityValue }) => {
                    if (opacityValue !== undefined) {
                        return `hsl(var(--primary) / ${opacityValue})`;
                    }
                    if (opacityVariable !== undefined) {
                        return `hsl(var(--primary) / var(${opacityVariable}, 1))`;
                    }
                    return 'hsl(var(--primary))';
                },
                accent: ({ opacityVariable, opacityValue }) => {
                    if (opacityValue !== undefined) {
                        return `hsl(var(--accent) / ${opacityValue})`;
                    }
                    if (opacityVariable !== undefined) {
                        return `hsl(var(--accent) / var(${opacityVariable}, 1))`;
                    }
                    return 'hsl(var(--accent))';
                },
                // Add other custom colors as needed, following the same pattern
            },
        },
    },
    plugins: []
    }

export default config