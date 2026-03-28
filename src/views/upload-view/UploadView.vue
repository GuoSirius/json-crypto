<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElDialog } from 'element-plus'
import { Upload, FileText, ArrowRight, FileJson, ListX, Trash2 } from 'lucide-vue-next'
import { useJsonStore } from '@/stores/jsonStore'
import { isValidJson } from '@/utils/json'
import { calculateMD5 } from '@/utils/crypto'

const router = useRouter()
const store = useJsonStore()
const fileList = ref<File[]>([])
const pasteText = ref('')
const activeTab = ref<'file' | 'paste'>('file')
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
  return store.state.files.length > 0 || store.state.pasteText.trim().length > 0
})

// 检查处理页面是文件列表还是文本数据
const processPageIsFileMode = computed(() => {
  return store.state.files.length > 0 && !store.state.pasteText.trim()
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

// 初始化 store
onMounted(async () => {
  await store.init()
  storeReady.value = true
})

async function handleFileChange(uploadFile: { raw?: File }) {
  // 等待 store 初始化完成
  if (!storeReady.value) {
    await store.init()
    storeReady.value = true
  }

  const file = uploadFile.raw
  if (!file) return

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

  // 添加到本地列表
  fileList.value.push(file)
  ElMessage.success(`文件 "${file.name}" 已添加到上传列表`)
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
      // 如果有现有数据，根据场景显示不同的确认对话框
      if (hasExistingData.value) {
        if (processPageIsFileMode.value) {
          // 上传页是文件列表 + 处理页是文件列表：继续上传、增量带入、全量覆盖
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
            // 用户点击了"增量带入"，直接添加文件（不重置），不做任何处理，继续往下执行
          } else if (action === 'overwrite') {
            // 用户点击了"全量覆盖"，先清空现有数据
            await store.reset()
            await store.init()
          } else {
            // 用户点击了叉叉，不做任何操作，停留在当前页面
            return
          }
        } else {
          // 上传页是文件列表 + 处理页是文本数据：继续上传、全量覆盖
          const action = await showConfirm({
            title: '数据处理方式',
            message: `处理页面已有文本数据。\n\n选择「继续上传」：返回上传页面\n选择「全量覆盖」：清空现有数据，使用新文件`,
            buttons: [
              { text: '继续上传', action: 'continue', type: 'primary' },
              { text: '全量覆盖', action: 'overwrite', type: 'default' },
            ],
          })

          if (action === 'continue') {
            // 用户点击了"继续上传"，直接返回
            return
          } else if (action === 'overwrite') {
            // 用户点击了"全量覆盖"，先清空现有数据
            await store.reset()
            await store.init()
          } else {
            // 用户点击了叉叉，不做任何操作，停留在当前页面
            return
          }
        }
      }
      try {
        const {addedCount, duplicateCount} = await store.addFiles(fileList.value)
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
        router.push('/json/process')
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
      // 上传页是文本输入：继续编辑、全量覆盖
      if (hasExistingData.value) {
        const action = await showConfirm({
          title: '数据处理方式',
          message: `处理页面已有数据。\n\n选择「继续编辑」：返回上传页面\n选择「全量覆盖」：清空现有数据，使用粘贴内容`,
          buttons: [
            { text: '继续编辑', action: 'continue', type: 'primary' },
            { text: '全量覆盖', action: 'overwrite', type: 'default' },
          ],
        })

        if (action === 'continue') {
          // 用户点击了"继续编辑"，直接返回
          return
        } else if (action === 'overwrite') {
          // 用户点击了"全量覆盖"，清空现有数据，使用粘贴内容
          await store.reset()
          await store.init()
          store.setPasteText(pasteText.value)
        }
        // 用户点击了叉叉，不做任何操作，停留在当前页面
      } else {
        store.setPasteText(pasteText.value)
      }
    }
    router.push('/json/process')
  }

async function handleDialogNext() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传 JSON 文件')
    return
  }
  // 检查处理页是否有数据
  const processPageHasData = store.state.files.length > 0 || store.state.pasteText.trim().length > 0
  // 如果处理页没有数据，直接进入，不需要用户确认
  if (!processPageHasData) {
    try {
      const {addedCount, duplicateCount} = await store.addFiles(fileList.value)
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
      router.push('/json/process')
    } catch (error) {
      ElMessage.error('文件上传失败，请重试')
    }
    return
  }
  // 处理页有数据时，根据场景显示不同的确认对话框
  if (hasExistingData.value) {
    if (processPageIsFileMode.value) {
      // 上传页是文件列表 + 处理页是文件列表：继续上传、增量带入、全量覆盖
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
    } else {
      // 上传页是文件列表 + 处理页是文本数据：继续上传、全量覆盖
      const action = await showConfirm({
        title: '数据处理方式',
        message: `处理页面已有文本数据。\n\n选择「继续上传」：返回上传页面\n选择「全量覆盖」：清空现有数据，使用新文件`,
        buttons: [
          { text: '继续上传', action: 'continue', type: 'primary' },
          { text: '全量覆盖', action: 'overwrite', type: 'default' },
        ],
      })

      if (action === 'continue') {
        // 用户点击了"继续上传"，关闭对话框返回
        showFileListDialog.value = false
        return
      } else if (action === 'overwrite') {
        // 用户点击了"全量覆盖"，先清空现有数据
        await store.reset()
        await store.init()
      } else {
        // 用户点击了叉叉，不做任何操作，停留在当前页面
        return
      }
    }
  }
  try {
    const {addedCount, duplicateCount} = await store.addFiles(fileList.value)
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
    router.push('/json/process')
  } catch (error) {
    ElMessage.error('文件上传失败，请重试')
  }
}

function handleOpenFileDialog() {
  showFileListDialog.value = true
}

async function handleDialogFileChange(uploadFile: { raw?: File }) {
  const file = uploadFile.raw
  if (!file) return

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

  // 添加到本地列表
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
          JSON 上传
        </h1>
        <p class="text-app-text-regular text-sm mt-2">上传 JSON 文件或粘贴文本，进入处理页面</p>
      </div>

      <!-- Main Card -->
      <div class="rounded-2xl border border-app-border bg-app-card p-6 shadow-2xl">
        <!-- Tab Switch -->
        <div class="flex gap-2 mb-6 bg-app-fill rounded-2xl p-1.5 border border-app-border">
          <button
            class="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer relative"
            :class="activeTab === 'file' 
              ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02]' 
              : 'bg-transparent text-app-text-regular hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-teal-500/10 hover:text-emerald-500 hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5'"
            @click="activeTab = 'file'"
          >
            <Upload :size="18" />
            文件上传
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer relative"
            :class="activeTab === 'paste' 
              ? 'bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/40 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02]' 
              : 'bg-transparent text-app-text-regular hover:bg-gradient-to-br hover:from-violet-500/10 hover:to-purple-500/10 hover:text-violet-500 hover:shadow-md hover:shadow-violet-500/20 hover:-translate-y-0.5'"
            @click="activeTab = 'paste'"
          >
            <FileText :size="18" />
            文本粘贴
          </button>
        </div>

        <!-- Tab Content -->
        <div class="h-[360px]">
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
                  <p class="text-app-text-primary text-sm font-medium mb-1">拖拽 JSON 文件到此处，或点击上传</p>
                  <p class="text-app-text-placeholder text-xs">支持多个 .json 文件</p>
                </div>
              </el-upload>
              
              <!-- 文件个数和查看列表按钮 -->
              <div v-if="fileList.length" class="mt-4 flex items-center justify-between p-3 bg-app-fill rounded-xl border border-app-border">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 shadow-md shadow-emerald-500/20">
                    <FileJson :size="16" class="text-emerald-400" />
                  </div>
                  <span class="text-sm text-app-text-primary">已上传 <span class="font-bold text-emerald-400">{{ fileList.length }}</span> 个文件</span>
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
            <div v-else-if="activeTab === 'paste'" key="paste" class="h-full">
              <textarea
                v-model="pasteText"
                placeholder='粘贴 JSON 数据，例如：{"key": "value"}'
                class="w-full h-full bg-app-fill border border-app-border rounded-xl p-4 text-sm text-app-text-primary font-mono resize-none focus:outline-none focus:border-primary transition-colors placeholder-app-text-placeholder box-border shadow-inner"
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
      <div class="min-h-[300px] max-h-[400px] overflow-y-auto">
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
            <p class="text-app-text-primary text-sm font-medium mb-1">点击或拖拽上传 JSON 文件</p>
            <p class="text-app-text-placeholder text-xs">支持多个 .json 文件</p>
          </div>
        </el-upload>

        <div v-else class="space-y-2">
          <div
            v-for="(file, index) in fileList"
            :key="index"
            class="flex items-center justify-between py-0.5 px-2 rounded-lg border border-app-border transition-all group"
            :class="[
              'bg-app-fill',
              'hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20',
              'hover:border-blue-500/50'
            ]"
          >
            <div class="flex items-center gap-1.5 flex-1 min-w-0">
              <div class="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/40 flex-shrink-0 shadow-md shadow-blue-500/20">
                <FileJson :size="10" class="text-blue-400" />
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
          <!-- 取消按钮 -->
          <button
            class="w-24 flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-app-border hover:border-app-text-regular bg-app-fill hover:bg-app-fill-strong text-app-text-primary text-xs font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
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
