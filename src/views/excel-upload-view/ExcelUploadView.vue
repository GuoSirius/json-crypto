<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElDialog } from 'element-plus'
import { Upload, ArrowRight, Table2, ListX, Trash2 } from 'lucide-vue-next'
import { useExcelStore } from '@/stores/excelStore'
import { calculateMD5 } from '@/utils/crypto'

const router = useRouter()
const store = useExcelStore()
const fileList = ref<File[]>([])
const storeReady = ref(false)
const showFileListDialog = ref(false)
const showConfirmDialog = ref(false)
const confirmDialogConfig = ref<{
  title: string
  message: string
  buttons: { text: string; action: string; type: string }[]
}>({
  title: '',
  message: '',
  buttons: [],
})
const confirmDialogCallback = ref<((action: string) => void) | null>(null)

// 检查 store 是否有现有数据
const hasExistingData = computed(() => {
  return store.state.files.length > 0
})

// 显示重复文件信息的辅助函数
function showDuplicateMessage(duplicateNames: string[], context: string = '系统中') {
  const count = duplicateNames.length
  if (count === 1) {
    ElMessage.warning(`文件 "${duplicateNames[0]}" 已在${context}存在，跳过重复上传`)
  } else if (count <= 3) {
    ElMessage.warning(`已过滤 ${count} 个重复文件：${duplicateNames.join('、')}`)
  } else {
    ElMessage.warning(`已过滤 ${count} 个重复文件`)
  }
}

// 显示自定义确认对话框
function showConfirm(config: {
  title: string
  message: string
  buttons: { text: string; action: string; type: 'primary' | 'default' | 'danger' }[]
}): Promise<string> {
  return new Promise((resolve) => {
    confirmDialogConfig.value = config
    showConfirmDialog.value = true
    confirmDialogCallback.value = resolve
  })
}

// 处理确认框按钮点击
function handleConfirmButtonClick(action: string) {
  showConfirmDialog.value = false
  if (confirmDialogCallback.value) {
    confirmDialogCallback.value(action)
    confirmDialogCallback.value = null
  }
}

// 计算文件的唯一标识（文件名 + MD5）
async function getFileIdentity(file: File): Promise<string> {
  const md5 = await calculateMD5(await file.text())
  return `${file.name}-${md5}`
}

onMounted(async () => {
  await store.init()
  storeReady.value = true
})

async function handleFileChange(uploadFile: { raw?: File }) {
  if (!storeReady.value) {
    await store.init()
    storeReady.value = true
  }

  const file = uploadFile.raw
  if (!file) return

  const name = file.name.toLowerCase()
  if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
    ElMessage.warning('仅支持 .xlsx 和 .xls 格式文件')
    return
  }

  // 只检查本地列表中是否重复，不检查 store 中是否重复
  // 去重逻辑在带入到处理页面时再做检测、处理、提示
  const currentIdentities = new Set<string>()
  for (const f of fileList.value) {
    const identity = await getFileIdentity(f)
    currentIdentities.add(identity)
  }

  // 计算当前文件的标识
  const identity = await getFileIdentity(file)

  // 检查是否已在本地列表中存在
  if (currentIdentities.has(identity)) {
    showDuplicateMessage([file.name], '本地上传列表中')
    return
  }

  fileList.value.push(file)
  ElMessage.success(`文件 "${file.name}" 已添加到上传列表`)
}

function handleDeleteFile(index: number) {
  fileList.value.splice(index, 1)
}

async function handleNext() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传 Excel 文件')
    return
  }

  // 如果有现有数据，询问用户是继续上传、增量带入还是全量覆盖
  if (hasExistingData.value) {
    const action = await showConfirm({
      title: '数据处理方式',
      message: `处理页面已有 ${store.state.files.length} 个文件的数据。\n\n选择「继续上传」：返回上传页面\n选择「增量带入」：将新文件追加到现有数据后面\n选择「全量覆盖」：清空现有数据，使用新文件`,
      buttons: [
        { text: '继续上传', action: 'continue', type: 'primary' },
        { text: '增量带入', action: 'add', type: 'default' },
        { text: '全量覆盖', action: 'overwrite', type: 'default' },
      ],
    })

    if (action === 'continue') {
      // 用户点击了"继续上传"，直接返回
      return
    } else if (action === 'add') {
      // 用户点击了"增量带入"，直接添加文件（不重置），继续往下执行
    } else if (action === 'overwrite') {
      // 用户点击了"全量覆盖"，先清空现有数据
      await store.reset()
      await store.init()
    } else {
      // 用户点击了叉叉，不做任何操作，停留在当前页面
      return
    }
  }

  const { addedCount, duplicateCount, errorFiles } = await store.addFiles(fileList.value)

  if (errorFiles.length > 0) {
    errorFiles.forEach(err => ElMessage.error(err))
  }

  // 增量带入时，显示提示用户成功添加、过滤了多少个文件
  if (addedCount > 0) {
    ElMessage.success(`成功添加 ${addedCount} 个文件`)
  }
  if (duplicateCount > 0) {
    ElMessage.warning(`过滤 ${duplicateCount} 个重复文件`)
  }
  if (addedCount === 0 && duplicateCount > 0) {
    ElMessage.warning(`所有文件均已存在，过滤 ${duplicateCount} 个重复文件`)
  }

  // 无论是否添加成功文件，都跳转到处理页面
  router.push('/excel/process')
}

async function handleDialogNext() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传 Excel 文件')
    return
  }

  // 如果有现有数据，询问用户是继续上传、增量带入还是全量覆盖
  if (hasExistingData.value) {
    const action = await showConfirm({
      title: '数据处理方式',
      message: `处理页面已有 ${store.state.files.length} 个文件的数据。\n\n选择「继续上传」：返回上传页面\n选择「增量带入」：将新文件追加到现有数据后面\n选择「全量覆盖」：清空现有数据，使用新文件`,
      buttons: [
        { text: '继续上传', action: 'continue', type: 'primary' },
        { text: '增量带入', action: 'add', type: 'default' },
        { text: '全量覆盖', action: 'overwrite', type: 'default' },
      ],
    })

    if (action === 'continue') {
      // 用户点击了"继续上传"，关闭对话框返回
      showFileListDialog.value = false
      return
    } else if (action === 'add') {
      // 用户点击了"增量带入"，直接添加文件（不重置），继续往下执行
    } else if (action === 'overwrite') {
      // 用户点击了"全量覆盖"，先清空现有数据
      await store.reset()
      await store.init()
    } else {
      // 用户点击了叉叉，不做任何操作，停留在当前页面
      return
    }
  }

  const { addedCount, duplicateCount, errorFiles } = await store.addFiles(fileList.value)

  if (errorFiles.length > 0) {
    errorFiles.forEach(err => ElMessage.error(err))
  }

  // 增量带入时，显示提示用户成功添加、过滤了多少个文件
  if (addedCount > 0) {
    ElMessage.success(`成功添加 ${addedCount} 个文件`)
  }
  if (duplicateCount > 0) {
    ElMessage.warning(`过滤 ${duplicateCount} 个重复文件`)
  }
  if (addedCount === 0 && duplicateCount > 0) {
    ElMessage.warning(`所有文件均已存在，过滤 ${duplicateCount} 个重复文件`)
  }

  showFileListDialog.value = false
  // 无论是否添加成功文件，都跳转到处理页面
  router.push('/excel/process')
}

async function handleDialogFileChange(uploadFile: { raw?: File }) {
  const file = uploadFile.raw
  if (!file) return

  const name = file.name.toLowerCase()
  if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
    ElMessage.warning('仅支持 .xlsx 和 .xls 格式文件')
    return
  }

  // 只检查本地列表中是否重复，不检查 store 中是否重复
  // 去重逻辑在带入到处理页面时再做检测、处理、提示
  const currentIdentities = new Set<string>()
  for (const f of fileList.value) {
    const identity = await getFileIdentity(f)
    currentIdentities.add(identity)
  }

  // 计算当前文件的标识
  const identity = await getFileIdentity(file)

  // 检查是否已在本地列表中存在
  if (currentIdentities.has(identity)) {
    showDuplicateMessage([file.name], '本地上传列表中')
    return
  }

  fileList.value.push(file)
  ElMessage.success(`文件 "${file.name}" 已添加到上传列表`)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-app-bg px-4">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold text-app-text-primary tracking-tight" style="font-family: 'JetBrains Mono', monospace">
          Excel 上传
        </h1>
        <p class="text-app-text-regular text-sm mt-2">上传 Excel 文件，解析工作表数据并导出为 JSON 或 CSV</p>
      </div>

      <!-- Main Card -->
      <div class="rounded-2xl border border-app-border bg-app-card p-6 shadow-2xl">
        <!-- Upload Area -->
        <div class="h-[320px]">
          <el-upload
            drag
            multiple
            accept=".xlsx,.xls"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            class="w-full h-full upload-area"
          >
            <div class="flex flex-col items-center justify-center h-full">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/20">
                <Upload :size="28" class="text-emerald-400" />
              </div>
              <p class="text-app-text-primary text-sm font-medium mb-1">拖拽 Excel 文件到此处，或点击上传</p>
              <p class="text-app-text-placeholder text-xs">支持 .xlsx / .xls 格式</p>
            </div>
          </el-upload>
        </div>

        <!-- File Count & View List Button -->
        <div v-if="fileList.length" class="mt-4 flex items-center justify-between p-3 bg-app-fill rounded-xl border border-app-border">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 shadow-md shadow-emerald-500/20">
              <Table2 :size="16" class="text-emerald-400" />
            </div>
            <span class="text-sm text-app-text-primary">已上传 <span class="font-bold text-emerald-400">{{ fileList.length }}</span> 个文件</span>
          </div>
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            @click="showFileListDialog = true"
          >
            <ListX :size="14" />
            查看文件列表
          </button>
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

    <!-- File List Dialog -->
    <el-dialog
      v-model="showFileListDialog"
      title="已上传的文件列表"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="min-h-[300px] max-h-[400px] overflow-y-auto">
        <div v-if="fileList.length === 0" class="text-center py-10">
          <p class="text-app-text-placeholder text-sm">暂无文件</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(file, index) in fileList"
            :key="index"
            class="flex items-center justify-between py-0.5 px-2 rounded-lg border border-app-border transition-all group bg-app-fill hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-500/50"
          >
            <div class="flex items-center gap-1.5 flex-1 min-w-0">
              <div class="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/40 flex-shrink-0 shadow-md shadow-blue-500/20">
                <Table2 :size="10" class="text-blue-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-app-text-primary font-medium truncate group-hover:text-blue-300 transition-colors">{{ file.name }}</p>
                <p class="text-xs text-app-text-regular group-hover:text-app-text-primary transition-colors">{{ (file.size / 1024).toFixed(2) }} KB</p>
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
          <button
            class="w-24 flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-app-border hover:border-app-text-regular bg-app-fill hover:bg-app-fill-strong text-app-text-primary text-xs font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
            @click="showFileListDialog = false"
          >
            取消
          </button>
          <div class="flex-1 shrink-0">
            <el-upload
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleDialogFileChange"
              multiple
              accept=".xlsx,.xls"
              class="upload-btn-wrapper"
            >
              <button class="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-cyan-500 hover:border-cyan-400 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                <Upload :size="14" />
                继续上传
              </button>
            </el-upload>
          </div>
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

    <!-- 自定义确认对话框 -->
    <el-dialog
      v-model="showConfirmDialog"
      :title="confirmDialogConfig.title"
      width="480px"
      :close-on-click-modal="false"
      :show-close="true"
      class="confirm-dialog"
    >
      <div class="py-2">
        <p class="text-app-text-primary whitespace-pre-line">{{ confirmDialogConfig.message }}</p>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <button
            v-for="(btn, index) in confirmDialogConfig.buttons"
            :key="index"
            class="px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer"
            :class="btn.type === 'primary'
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'border border-app-border hover:border-app-text-regular bg-app-fill hover:bg-app-fill-strong text-app-text-primary'"
            @click="handleConfirmButtonClick(btn.action)"
          >
            {{ btn.text }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.upload-area :deep(.el-upload-dragger) {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(20, 184, 166, 0.05), rgba(6, 182, 212, 0.05)) !important;
  border-color: rgba(16, 185, 129, 0.3) !important;
  border-radius: 1rem !important;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area :deep(.el-upload-dragger:hover) {
  border-color: rgba(16, 185, 129, 0.6) !important;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1), rgba(6, 182, 212, 0.1)) !important;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
}

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
