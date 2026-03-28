import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/json/upload',
    },
    {
      path: '/json/upload',
      name: 'JsonUpload',
      component: () => import('../views/upload-view/UploadView.vue'),
    },
    {
      path: '/json/process',
      name: 'JsonProcess',
      component: () => import('../views/process-view/ProcessView.vue'),
    },
    {
      path: '/excel/upload',
      name: 'ExcelUpload',
      component: () => import('../views/excel-upload-view/ExcelUploadView.vue'),
    },
    {
      path: '/excel/process',
      name: 'ExcelProcess',
      component: () => import('../views/excel-process-view/ExcelProcessView.vue'),
    },
  ],
})

export default router
