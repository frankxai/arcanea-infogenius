/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Arcanea Elemental Colors
        'dragon-fire': '#FF6B35',
        'ocean-depth': '#2E86AB',
        'earth-foundation': '#4A5759',
        'wind-clarity': '#98D8C8',
        'void-mystery': '#1A1A2E',
        
        // Brand Colors
        'accent-red': '#C74634',
        'accent-black': '#312D2A',
        'accent-gray': '#F5F5F5',
        'accent-medium': '#747775',
        'accent-blue': '#1A73E8',
        
        // Arcanea Transcendent Colors - supporting gradients via backgroundImage
        'transcendent-fire': {
          from: '#FF6B35',
          via: '#FF8C42',
          to: '#FFD23F'
        },
        'transcendent-water': {
          from: '#2E86AB',
          via: '#5DADE2',
          to: '#98D8C8'
        },
        'transcendent-earth': {
          from: '#4A5759',
          via: '#8B7355',
          to: '#A67C52'
        },
        'transcendent-wind': {
          from: '#98D8C8',
          via: '#B4E7CE',
          to: '#D4F1F4'
        },
        'transcendent-void': {
          from: '#1A1A2E',
          via: '#16213E',
          to: '#0F3460'
        }
      },
      fontFamily: {
        'arcanea': ['"Inter"', "Poppins", "system-ui", "sans-serif"],
        'mythic': ['"Georgia"', "Times New Roman", "serif"],
        'runic': ['"JetBrains Mono"', "Consolas", "monospace"]
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'elemental-flow': 'elemental-flow 4s ease-in-out infinite'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(199, 70, 52, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(199, 70, 52, 0.8)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' }
        },
        'elemental-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }
    },
  },
  plugins: [],
}