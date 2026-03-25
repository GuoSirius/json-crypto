import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:uno.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { useTheme } from './composables/useTheme'

const app = createApp(App)

// 在挂载前初始化主题（同步，防止闪烁）
useTheme().init()

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

// 等待路由守卫完成后挂载
router.isReady().then(() => {
  app.mount('#app')
})
