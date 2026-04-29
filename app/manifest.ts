import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RK Library - Self Study Centre',
    short_name: 'RK Library',
    description: 'The best self-study centre in Sasaram providing a peaceful environment, high-speed Wi-Fi, fully AC campus, and 24-hour power backup.',
    lang: 'en',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F9F6F0',
    theme_color: '#7B2432',
    categories: ["education", "lifestyle", "productivity"],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}