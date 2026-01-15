// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  srcDir: 'src/',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
    devServer: {
    host: '0.0.0.0',
    port: 3001 // default: 3000
  },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
    imports: {
    // Auto-import pinia stores defined in `~/stores`
    dirs: ['stores']
  },
  css: ['highlight.js/styles/github.css', '~/assets/css/markdown.css'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      ignore: ['**/configs/**', '**/i18n/**']
    }
  ],
})
