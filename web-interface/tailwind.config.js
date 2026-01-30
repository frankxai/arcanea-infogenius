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
        
        // Oracle Brand Colors
        'oracle-red': '#C74634',
        'oracle-black': '#312D2A',
        'oracle-gray': '#F5F5F5',
        'oracle-medium': '#747775',
        'oracle-blue': '#1A73E8',
        
        // Arcanea Transcendent Gradients
        'transcendent': {
          'fire': 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFD23F 100%)',
          'water': 'linear-gradient(135deg, #2E86AB 0%, #5DADE2 50%, #98D8C8 100%)',
          'earth': 'linear-gradient(135deg, #4A5759 0%, #8B7355 50%, #A67C52 100%)',
          'wind': 'linear-gradient(135deg, #98D8C8 0%, #B4E7CE 50%, #D4F1F4 100%)',
          'void': 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)'
        }
      },
      fontFamily: {
        'arcania': ['"Oracle Sans"', "Poppins", "system-ui", "sans-serif"],
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