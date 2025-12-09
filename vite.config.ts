import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler']],
			},
		}),
		tailwindcss(),
			VitePWA({
				registerType: 'prompt',
				includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'maskable-icon-512x512.png', 'pwa-64x64.png', 'pwa-192x192.png', 'pwa-512x512.png', 'logo.webp'],
				manifest: {
					name: 'NotepadXX',
					short_name: 'NotepadXX',
					description: 'A web-based notepad with syntax highlighting and offline support',
					start_url: '/',
					scope: '/',
					theme_color: '#0f172a',
					background_color: '#ffffff',
					display: 'standalone',
					icons: [
						{ src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
						{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
						{ src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
						{ src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
					]
				},
				workbox: {
					globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,webp}'],
					dontCacheBustURLsMatching: /-[a-f0-9]{8}\./,
					manifestTransforms: [async (entries) => {
						const filtered = entries.filter(({ url }) => {
							const clean = url?.replace(/^\//, '')
							return clean !== 'manifest.webmanifest' && clean !== 'sw.js' && clean !== 'registerSW.js' && !clean.startsWith('workbox-')
						})
						.map((e) => {
							if (e.url && e.url.endsWith('.html')) {
								let url = e.url
								if (url.startsWith('/')) url = url.slice(1)
								if (url === 'index.html') e.url = '/'
								else if (url.endsWith('index.html')) e.url = `/${url.substring(0, url.lastIndexOf('/'))}`
								else if (url.endsWith('.html')) e.url = `/${url.substring(0, url.length - '.html'.length)}`
							}
							return e
						})
						return { manifest: filtered }
					}],
					runtimeCaching: [
						{
							urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
							handler: 'CacheFirst',
							options: {
								cacheName: 'google-fonts-cache',
								expiration: {
									maxEntries: 10,
									maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
								}
							}
						}
					]
				},
				devOptions: {
					enabled: true,
					type: 'module'
				}
			})
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
})
