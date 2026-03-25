<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Upload, FileText, ArrowRight, FileJson, ListX, Trash2 } from 'lucide-vue-next'
import { useJsonStore } from '../stores/jsonStore'
import { isValidJson } from '../utils/json'

const router = useRouter()
const store = useJsonStore()
const fileList = ref<File[]>([])
const pasteText = ref('')
const activeTab = ref<'file' | 'paste'>('file')
const storeReady = ref(false)
const showFileListDialog = ref(false)

// 初始化 store，清空之前的所有数据，确保全新上传
onMounted(async () => {
  await store.reset()
  await store.init()
  storeReady.value = true
})

async function handleFileChange(_uploadFile: { raw?: File }, uploadFiles: { raw?: File }[]) {
  // 等待 store 初始化完成
  if (!storeReady.value) {
    await store.init()
    storeReady.value = true
  }

  // 获取当前 Element Plus 选择的所有文件
  const allRawFiles = uploadFiles.map(f => f.raw).filter((f): f is File => !!f)

  // 获取当前 fileList 中的文件名（已确认要上传的）
  const currentFileNames = new Set(fileList.value.map(f => f.name))

  // 从 store 中获取已存在的文件名
  const storeFileNames = new Set(store.state.files.map(f => f.name))

  // 过滤出真正的新文件（不在 fileList 中，也不在 store 中的）
  const trulyNewFiles = allRawFiles.filter(f =>
    !currentFileNames.has(f.name) && !storeFileNames.has(f.name)
  )

  // 对于那些在 Element Plus 选择中但已存在的文件，给出提示
  const duplicateInUpload = allRawFiles.filter(f =>
    currentFileNames.has(f.name) || storeFileNames.has(f.name)
  )

  if (duplicateInUpload.length > 0) {
    ElMessage.warning(`已跳过 ${duplicateInUpload.length} 个重复文件`)
  }

  // 将真正的新文件添加到列表
  if (trulyNewFiles.length > 0) {
    fileList.value = [...fileList.value, ...trulyNewFiles]
  }
}

function handleDeleteFile(index: number) {
  fileList.value.splice(index, 1)
}

async function handleNext() {
  if (activeTab.value === 'file') {
    if (fileList.value.length === 0) {
      ElMessage.warning('请先上传 JSON 文件')
      return
    }
    try {
      const addedCount = await store.addFiles(fileList.value)
      if (addedCount === 0) {
        ElMessage.warning('所有文件已存在，无需重复添加')
        return
      }
      router.push('/process')
      return
    } catch (error) {
      ElMessage.error('文件上传失败，请重试')
      return
    }
  } else {
    if (!pasteText.value.trim()) {
      ElMessage.warning('请输入 JSON 数据')
      return
    }
    if (!isValidJson(pasteText.value)) {
      ElMessage.error('JSON 格式不正确，请检查输入')
      return
    }
    store.setPasteText(pasteText.value)
  }
  router.push('/process')
}

async function handleDialogNext() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传 JSON 文件')
    return
  }
  try {
    const addedCount = await store.addFiles(fileList.value)
    if (addedCount === 0) {
      ElMessage.warning('所有文件已存在，无需重复添加')
      return
    }
    showFileListDialog.value = false
    router.push('/process')
  } catch (error) {
    ElMessage.error('文件上传失败，请重试')
  }
}

function handleOpenFileDialog() {
  showFileListDialog.value = true
}

async function handleDialogFileChange(_uploadFile: { raw?: File }, uploadFiles: { raw?: File }[]) {
  const allRawFiles = uploadFiles.map(f => f.raw).filter((f): f is File => !!f)
  const currentFileNames = new Set(fileList.value.map(f => f.name))
  const trulyNewFiles = allRawFiles.filter(f => !currentFileNames.has(f.name))

  if (trulyNewFiles.length > 0) {
    fileList.value = [...fileList.value, ...trulyNewFiles]
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-bg px-4">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/50">
            <FileJson :size="24" class="text-white" />
          </div>
          <h1 class="text-3xl font-semibold text-white tracking-tight" style="font-family: 'JetBrains Mono', monospace">
            JSON Crypto
          </h1>
        </div>
        <p class="text-gray-400 text-sm">JSON 数据处理工具 — 格式化 · 压缩 · 加密 · 解密</p>
      </div>

      <!-- Main Card -->
      <div class="rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl">
        <!-- Tab Switch -->
        <div class="flex gap-2 mb-6 bg-dark-bg/60 rounded-2xl p-1.5 border border-dark-border/60">
          <button
            class="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer relative"
            :class="activeTab === 'file' 
              ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl shadow-emerald-500/60 hover:-translate-y-0.5 hover:scale-[1.02]' 
              : 'bg-transparent text-gray-400 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-teal-500/10 hover:text-emerald-400 hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5'"
            @click="activeTab = 'file'"
          >
            <Upload :size="18" />
            文件上传
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer relative"
            :class="activeTab === 'paste' 
              ? 'bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/40 hover:shadow-xl shadow-violet-500/60 hover:-translate-y-0.5 hover:scale-[1.02]' 
              : 'bg-transparent text-gray-400 hover:bg-gradient-to-br hover:from-violet-500/10 hover:to-purple-500/10 hover:text-violet-400 hover:shadow-md hover:shadow-violet-500/20 hover:-translate-y-0.5'"
            @click="activeTab = 'paste'"
          >
            <FileText :size="18" />
            文本粘贴
          </button>
        </div>

        <!-- Tab Content -->
        <div class="min-h-[320px] max-h-[600px]">
          <transition
            name="tab-fade"
            mode="out-in"
          >
            <div v-if="activeTab === 'file'" key="file" class="h-full flex flex-col">
              <el-upload
                drag
                multiple
                accept=".json"
                :auto-upload="false"
                :on-change="handleFileChange"
                :show-file-list="false"
                class="w-full upload-area flex-1"
              >
                <div class="flex flex-col items-center py-4">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/20">
                    <Upload :size="28" class="text-emerald-400" />
                  </div>
                  <p class="text-gray-300 text-sm font-medium mb-1">拖拽 JSON 文件到此处，或点击上传</p>
                  <p class="text-gray-500 text-xs">支持多个 .json 文件</p>
                </div>
              </el-upload>
              
              <!-- 文件个数和查看列表按钮 -->
              <div v-if="fileList.length" class="mt-4 flex items-center justify-between p-3 bg-dark-bg/60 rounded-xl border border-dark-border/60 shadow-lg shadow-black/20">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 shadow-md shadow-emerald-500/20">
                    <FileJson :size="16" class="text-emerald-400" />
                  </div>
                  <span class="text-sm text-gray-300">已上传 <span class="font-bold text-emerald-400">{{ fileList.length }}</span> 个文件</span>
                </div>
                <button
                  class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  @click="handleOpenFileDialog"
                >
                  <ListX :size="14" />
                  查看文件列表
                </button>
              </div>
            </div>

            <!-- Text Paste -->
            <div v-else-if="activeTab === 'paste'" key="paste" class="h-full min-h-[320px]">
              <textarea
                v-model="pasteText"
                placeholder='粘贴 JSON 数据，例如：{"key": "value"}'
                class="w-full h-full min-h-[320px] bg-dark-bg border border-dark-border rounded-xl p-4 text-sm text-gray-200 font-mono resize-none focus:outline-none focus:border-primary transition-colors placeholder-gray-600 box-border shadow-inner"
              ></textarea>
            </div>
          </transition>
        </div>

        <!-- Next Button -->
        <button
          class="w-full mt-6 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm hover:from-blue-600 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          @click="handleNext"
        >
          下一步
          <ArrowRight :size="14" />
        </button>
      </div>
    </div>

    <!-- 文件列表弹框 -->
    <el-dialog
      v-model="showFileListDialog"
      title="已上传的文件列表"
      width="600px"
      :close-on-click-modal="false"
      class="file-list-dialog"
    >
      <div class="min-h-[300px] max-h-[400px] overflow-y-auto custom-scroll">
        <el-upload
          v-if="fileList.length === 0"
          drag
          multiple
          accept=".json"
          :auto-upload="false"
          :on-change="handleDialogFileChange"
          :show-file-list="false"
          class="w-full"
        >
          <div class="flex flex-col items-center py-6">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-3 border border-blue-500/20 shadow-lg shadow-blue-500/20">
              <Upload :size="24" class="text-blue-400" />
            </div>
            <p class="text-gray-300 text-sm font-medium mb-1">点击或拖拽上传 JSON 文件</p>
            <p class="text-gray-500 text-xs">支持多个 .json 文件</p>
          </div>
        </el-upload>

        <div v-else class="space-y-2">
          <div
            v-for="(file, index) in fileList"
            :key="index"
            class="flex items-center justify-between py-0.5 px-2 rounded-lg border border-dark-border/60 transition-all group shadow-lg shadow-black/20"
            :class="[
              'bg-dark-card/80',
              'hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20',
              'hover:border-blue-500/50'
            ]"
          >
            <div class="flex items-center gap-1.5 flex-1 min-w-0">
              <div class="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/40 flex-shrink-0 shadow-md shadow-blue-500/20">
                <FileJson :size="10" class="text-blue-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-white font-medium truncate group-hover:text-blue-300 transition-colors">{{ file.name }}</p>
                <p class="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{{ (file.size / 1024).toFixed(2) }} KB</p>
              </div>
            </div>
            <button
              class="p-0.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md shadow-red-500/30"
              @click="handleDeleteFile(index)"
            >
              <Trash2 :size="10" />
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2.5">
          <!-- 取消按钮 -->
          <button
            class="w-24 flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-gray-500 hover:border-gray-400 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold transition-all shadow-md shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
            @click="showFileListDialog = false"
          >
            取消
          </button>

          <!-- 继续上传按钮 -->
          <div class="flex-1 shrink-0">
            <el-upload
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleDialogFileChange"
              multiple
              accept=".json"
              class="upload-btn-wrapper"
            >
              <button class="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-cyan-500 hover:border-cyan-400 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                <Upload :size="14" />
                继续上传
              </button>
            </el-upload>
          </div>

          <!-- 进入处理页面按钮 -->
          <button
            class="flex-1 min-w-0 flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-emerald-500 hover:border-emerald-400 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shadow-md shadow-emerald-500/30"
            @click="handleDialogNext"
          >
            <ArrowRight :size="14" />
            进入处理页面
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 上传区域样式 */
.upload-area :deep(.el-upload-dragger) {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(20, 184, 166, 0.05), rgba(6, 182, 212, 0.05)) !important;
  border-color: rgba(16, 185, 129, 0.3) !important;
  border-radius: 1rem !important;
  transition: all 0.3s ease;
  max-height: 400px;
  overflow-y: auto;
}

.upload-area :deep(.el-upload-dragger:hover) {
  border-color: rgba(16, 185, 129, 0.6) !important;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1), rgba(6, 182, 212, 0.1)) !important;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
}

/* 文件列表弹框样式 - 深色主题增强 */
.file-list-dialog :deep(.el-dialog) {
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #1e1e35 100%) !important;
  border: 1px solid rgba(100, 100, 150, 0.3) !important;
  border-radius: 16px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(100, 100, 150, 0.1) !important;
}

.file-list-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(100, 100, 150, 0.2) !important;
  padding: 20px 24px !important;
  background: linear-gradient(180deg, rgba(30, 30, 53, 0.8) 0%, transparent 100%) !important;
}

.file-list-dialog :deep(.el-dialog__title) {
  color: #ffffff !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.file-list-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 20px !important;
  transition: all 0.3s ease !important;
}

.file-list-dialog :deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #ef4444 !important;
  transform: rotate(90deg) !important;
}

.file-list-dialog :deep(.el-dialog__body) {
  padding: 20px 24px !important;
}

.file-list-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(100, 100, 150, 0.2) !important;
  padding: 16px 24px !important;
  background: linear-gradient(0deg, rgba(30, 30, 53, 0.8) 0%, transparent 100%) !important;
}

.file-list-dialog :deep(.el-upload-dragger) {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05)) !important;
  border-color: rgba(59, 130, 246, 0.3) !important;
  border-radius: 12px !important;
}

.file-list-dialog :deep(.el-upload-dragger:hover) {
  border-color: rgba(59, 130, 246, 0.6) !important;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)) !important;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
}

/* 自定义滚动条样式 - 更亮眼 */
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: rgba(20, 20, 35, 0.6) !important;
  border-radius: 4px !important;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.6) 0%, rgba(147, 51, 234, 0.6) 100%) !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
}

/* Tab切换动画 */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 修复 el-upload 按钮铺满问题 */
.upload-btn-wrapper {
  width: 100%;
  display: block;
}

.upload-btn-wrapper :deep(.el-upload) {
  display: block;
  width: 100%;
}

.upload-btn-wrapper :deep(.el-upload .el-upload-dragger) {
  display: none;
}

.upload-btn-wrapper :deep(.el-upload > *) {
  width: 100% !important;
}
</style>
