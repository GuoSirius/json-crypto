import { defineConfig, presetUno, presetAttributify } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  presets: [
    presetUno({ dark: 'class' }),
    presetAttributify(),
  ],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      primary: '#409EFF',
      dark: {
        bg: '#1A1A24',
        card: '#252535',
        border: '#3A3A4A',
      },
    },
  },
})
