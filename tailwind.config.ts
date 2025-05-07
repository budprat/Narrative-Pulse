
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Custom NarrativePulse theme colors
				narrativepulse: {
					'50': '#f0f7ff',
					'100': '#e0eefe',
					'200': '#bae0fd',
					'300': '#7fcaf9',
					'400': '#38aff2',
					'500': '#0e95de',
					'600': '#0078bd',
					'700': '#0062a1',
					'800': '#065384',
					'900': '#0a466e',
				},
				storytelling: {
					'50': '#f4f0fe',
					'100': '#ece3fd',
					'200': '#dcc9fb',
					'300': '#c3a1f7',
					'400': '#a672f1',
					'500': '#9350e8',
					'600': '#7e34d6',
					'700': '#6927b9',
					'800': '#572398',
					'900': '#48207c',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'wave-text': {
					'0%, 100%': { transform: 'translateY(0)' },
					'25%': { transform: 'translateY(-4px)' },
					'75%': { transform: 'translateY(4px)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
				'fade-in': 'fade-in 0.5s ease-out',
				'wave-text': 'wave-text 2.5s ease-in-out infinite',
			},
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui'],
				display: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui'],
				mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
