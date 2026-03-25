import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:uno.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { default as ElConfigProvider } from 'element-plus'

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
}

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue warning:', msg, trace)
}

app.use(ElementPlus)
app.use(router)

// 全局配置 Element Plus
app.provide('elConfig', {
  zIndex: 3000,
})

// 等待路由守卫完成后挂载
router.isReady().then(() => {
  app.mount('#app')
})
