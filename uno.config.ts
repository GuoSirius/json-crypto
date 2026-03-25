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
      primary: {
        DEFAULT: 'var(--el-color-primary)',
      },
      'app-bg': 'var(--app-bg)',
      'app-bg-solid': 'var(--app-bg-solid)',
      'app-card': 'var(--app-card)',
      'app-border': 'var(--app-border)',
      'app-text-primary': 'var(--app-text-primary)',
      'app-text-regular': 'var(--app-text-regular)',
      'app-text-placeholder': 'var(--app-text-placeholder)',
      'app-fill': 'var(--app-fill)',
      'app-fill-strong': 'var(--app-fill-strong)',
      'app-shadow': 'var(--app-shadow)',
      'app-shadow-lg': 'var(--app-shadow-lg)',
    },
  },
})
