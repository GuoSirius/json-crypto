import { createRouter, createWebHistory } from 'vue-router'
import { useJsonStore } from '../stores/jsonStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/upload',
    },
    {
      path: '/upload',
      name: 'Upload',
      component: () => import('../views/UploadView.vue'),
    },
    {
      path: '/process',
      name: 'Process',
      component: () => import('../views/ProcessView.vue'),
    },
  ],
})

// 全局前置守卫，确保 store 初始化完成后再导航
router.beforeEach(async (to, from, next) => {
  // 如果目标页面需要数据，先确保 store 初始化完成
  if (to.path === '/process') {
    const store = useJsonStore()
    await store.init()
  }
  next()
})

export default router
