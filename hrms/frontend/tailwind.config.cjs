module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#1B6FE4',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#F7F8FA',
          foreground: '#5f6b7a',
        },
        border: '#dce2ea',
      },
      boxShadow: {
        card: '0 8px 30px rgba(27, 111, 228, 0.08)',
      },
    },
  },
  plugins: [],
};
