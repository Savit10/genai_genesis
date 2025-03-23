module.exports = {
  theme: {
    extend: {
      scale: {
        '102': '1.02',
        '97': '0.97',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mono': ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
} 