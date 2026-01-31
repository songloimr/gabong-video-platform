import type { Config } from 'tailwindcss';
import { skeleton } from '@skeletonlabs/skeleton/plugin';
import * as themes from '@skeletonlabs/skeleton/themes';

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/@skeletonlabs/skeleton/**/*.{html,js,svelte,ts}'
	],
	theme: {
		extend: {
			screens: {
				'mobile': '320px',
				'tablet': '768px',
				'desktop': '1024px',
			},
			fontFamily: {
				sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
				heading: ['Outfit Variable', 'Outfit', 'Inter Variable', 'sans-serif'],
			},
			gridTemplateColumns: {
				'mobile': 'repeat(1, minmax(0, 1fr))',
				'tablet': 'repeat(3, minmax(0, 1fr))',
				'desktop': 'repeat(5, minmax(0, 1fr))',
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-out forwards',
				'slide-up': 'slideUp 0.4s ease-out forwards',
				'scale-in': 'scaleIn 0.3s ease-out forwards',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				}
			}
		}
	},
	plugins: [
		skeleton({
			themes: [themes.cerberus]
		})
	],
	darkMode: 'class'
} satisfies Config;
