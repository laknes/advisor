import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fbf7ff',
          100: '#f4e8ff',
          200: '#ead5ff',
          300: '#d8b4fe',
          400: '#b56cff',
          500: '#8b2be2',
          600: '#6712b7',
          700: '#4c0a87',
          800: '#33045f',
          900: '#1b012f',
        },
        secondary: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716f',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f97316',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'scroll-3d': 'scroll3d 1s ease-out forwards',
        'parallax-scroll': 'parallaxScroll 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'shimmer': 'shimmer 2s infinite',
        'rotate-3d': 'rotate3d 20s linear infinite',
        'card-tilt': 'cardTilt 0.6s cubic-bezier(0.23, 1, 0.320, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
        scroll3d: {
          '0%': { 
            opacity: '0',
            transform: 'translateZ(-100px) rotateX(10deg) rotateY(-10deg)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateZ(0) rotateX(0) rotateY(0)',
          },
        },
        parallaxScroll: {
          '0%': { transform: 'translateY(40px) scale(0.95)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1200px 0' },
          '100%': { backgroundPosition: '1200px 0' },
        },
        rotate3d: {
          '0%': { transform: 'rotateX(360deg) rotateY(0deg)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg)' },
        },
        cardTilt: {
          '0%': { 
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(0.9)',
            opacity: '0',
          },
          '100%': { 
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
            opacity: '1',
          },
        },
      },
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.25)',
        'glass-dark': 'rgba(0, 0, 0, 0.1)',
        'glass-purple': 'rgba(184, 82, 255, 0.1)',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.2)',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [
    function ({ addComponents, addUtilities, theme }: any) {
      const glassComponents = {
        '.glass-effect': {
          'background': 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        '.glass-effect-dark': {
          'background': 'rgba(0, 0, 0, 0.2)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        },
        '.glass-card': {
          'background': 'rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(10px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(10px) saturate(180%)',
          'border': '1px solid rgba(255, 255, 255, 0.25)',
          'border-radius': '1rem',
          'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        '.glass-sm': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(4px)',
          'border': '1px solid rgba(255, 255, 255, 0.15)',
        },
        '.glass-lg': {
          'background': 'rgba(255, 255, 255, 0.3)',
          'backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
          'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
        },
        '.perspective-1000': {
          'perspective': '1000px',
        },
        '.perspective-1200': {
          'perspective': '1200px',
        },
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
      };

      const glassUtilities = {
        '.glass-hover:hover': {
          'background': 'rgba(255, 255, 255, 0.35)',
          'transition': 'all 0.3s ease',
        },
        '.glass-blur-xs': {
          'backdrop-filter': 'blur(2px)',
        },
        '.glass-blur-sm': {
          'backdrop-filter': 'blur(4px)',
        },
        '.glass-blur-md': {
          'backdrop-filter': 'blur(12px)',
        },
        '.glass-blur-lg': {
          'backdrop-filter': 'blur(16px)',
        },
        '.glass-blur-xl': {
          'backdrop-filter': 'blur(24px)',
        },
      };

      addComponents(glassComponents);
      addUtilities(glassUtilities);
    },
  ],
}
export default config
