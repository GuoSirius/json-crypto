<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, FileJson } from 'lucide-vue-next'
import { useJsonStore } from '../stores/jsonStore'
import { formatJson, compressJson, isValidJson } from '../utils/json'
import { processCrypto, detectEncrypted } from '../utils/crypto'
import { downloadFile, downloadAsZip } from '../utils/download'
import type { CryptoMode, CryptoAlgorithm } from '../types'

import FileList from '../components/FileList.vue'
import JsonEditor from '../components/JsonEditor.vue'
import ToolBar from '../components/ToolBar.vue'
import CryptoConfig from '../components/CryptoConfig.vue'
import BatchAction from '../components/BatchAction.vue'

const router = useRouter()
const route = useRoute()
const store = useJsonStore()

const sourceText = ref('')
const processedText = ref('')
const batchLoading = ref(false)
const batchProgress = ref(0)

const hasSource = computed(() => !!sourceText.value.trim())
const hasProcessed = computed(() => !!processedText.value.trim())
const hasSourceValidJson = computed(() => isValidJson(sourceText.value))
const hasProcessedValidJson = computed(() => isValidJson(processedText.value))

onMounted(async () => {
  try {
    // 等待 store 初始化完成，确保数据已从 IndexedDB 恢复
    await store.init()
    if (!store.hasData()) {
      router.replace('/upload')
      return
    }
    loadCurrentFile()
    detectCryptoMode()
    handleUrlParam()
  } catch (error) {
    console.error('ProcessView mounted error:', error)
    router.replace('/upload')
  }
})

function loadCurrentFile() {
  if (store.isFileMode()) {
    const file = store.state.files[store.state.activeIndex]
    if (file) {
      sourceText.value = file.content
      processedText.value = file.processed
    }
  } else {
    sourceText.value = store.state.pasteText
    processedText.value = ''
  }
}

function handleUrlParam() {
  const param = route.query.file
  if (!param || !store.isFileMode()) return
  const str = String(param)
  const byName = store.state.files.findIndex(f => f.name === str)
  if (byName >= 0) {
    store.setActiveIndex(byName)
    loadCurrentFile()
    detectCryptoMode()
    return
  }
  const num = parseInt(str, 10)
  if (!isNaN(num) && num >= 0 && num < store.state.files.length) {
    store.setActiveIndex(num)
    loadCurrentFile()
    detectCryptoMode()
  }
}

function handleFileSelect(md5: string) {
  // 根据 md5 找到原始数组中的索引
  const actualIndex = store.state.files.findIndex(f => f.md5 === md5)
  if (actualIndex >= 0) {
    store.setActiveIndex(actualIndex)
    loadCurrentFile()
    detectCryptoMode()
  }
}

function handleFilterChange(filter: import('../stores/jsonStore').FileFilter) {
  store.setFilter(filter)
  // 切换筛选后选中第一个文件
  const filteredFiles = store.getFilteredFiles()
  if (filteredFiles.length > 0) {
    const actualIndex = store.state.files.findIndex(f => f.md5 === filteredFiles[0].md5)
    if (actualIndex >= 0) {
      store.setActiveIndex(actualIndex)
      loadCurrentFile()
      // 同步切换加密/解密模式
      detectCryptoMode()
    }
  } else {
    processedText.value = ''
    sourceText.value = ''
  }
}

function handleRefresh() {
  if (store.isFileMode()) {
    const file = store.state.files[store.state.activeIndex]
    if (file) {
      sourceText.value = file.content
      ElMessage.success('已还原为原始文件数据')
    }
  } else {
    sourceText.value = store.state.pasteText
    ElMessage.success('已还原为原始粘贴数据')
  }
}

function handleFormat() {
  // 优先使用原始数据，如果没有则使用处理后数据
  const inputText = hasSourceValidJson.value ? sourceText.value : processedText.value
  if (!inputText) {
    ElMessage.error('没有可格式化的 JSON 数据')
    return
  }
  if (!isValidJson(inputText)) {
    ElMessage.error('当前数据不是有效的 JSON')
    return
  }
  const result = formatJson(inputText)
  // 如果输入来自原数据，结果放到处理后；反之放回处理后
  if (hasSourceValidJson.value) {
    processedText.value = result
    saveResult(result)
  } else {
    processedText.value = result
  }
}

function handleCompress() {
  // 优先使用原始数据，如果没有则使用处理后数据
  const inputText = hasSourceValidJson.value ? sourceText.value : processedText.value
  if (!inputText) {
    ElMessage.error('没有可压缩的 JSON 数据')
    return
  }
  if (!isValidJson(inputText)) {
    ElMessage.error('当前数据不是有效的 JSON')
    return
  }
  const result = compressJson(inputText)
  // 如果输入来自原数据，结果放到处理后；反之放回处理后
  if (hasSourceValidJson.value) {
    processedText.value = result
    saveResult(result)
  } else {
    processedText.value = result
  }
}

function handleEncrypt() {
  doCrypto('encrypt')
}

function handleDecrypt() {
  doCrypto('decrypt')
}

function doCrypto(mode: CryptoMode) {
  const { algorithm, key } = store.state.cryptoConfig
  if (algorithm !== 'Base64' && !key.trim()) {
    ElMessage.warning('请输入密钥')
    return
  }
  const data = mode === 'encrypt' ? sourceText.value : sourceText.value
  try {
    const result = processCrypto(data, mode, algorithm, key)
    processedText.value = result
    saveResult(result)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败，请检查数据格式')
    processedText.value = '操作失败'
    if (store.isFileMode()) {
      store.updateProcessed(store.state.activeIndex, '操作失败', 'error')
    }
  }
}

function saveResult(result: string) {
  if (store.isFileMode()) {
    store.updateProcessed(store.state.activeIndex, result, 'done')
  }
}

function handleBatchProcess() {
  if (!store.isFileMode()) {
    ElMessage.warning('批量处理仅支持文件模式')
    return
  }
  const { algorithm, key } = store.state.cryptoConfig
  if (algorithm !== 'Base64' && !key.trim()) {
    ElMessage.warning('请输入密钥')
    return
  }

  // 使用过滤后的文件
  const filteredFiles = store.getFilteredFiles()
  const filteredIndexes = store.getFilteredIndexes()

  if (filteredFiles.length === 0) {
    ElMessage.warning('当前筛选条件下没有可处理的文件')
    return
  }

  batchLoading.value = true
  batchProgress.value = 0

  let completed = 0
  let successCount = 0
  for (let i = 0; i < filteredFiles.length; i++) {
    const file = filteredFiles[i]
    const actualIndex = filteredIndexes[i]
    const content = file.content
    try {
      // 自动检测每个文件是否已加密，选择对应的处理模式
      const isEncrypted = detectEncrypted(content)
      const mode: CryptoMode = isEncrypted ? 'decrypt' : 'encrypt'
      const result = processCrypto(content, mode, algorithm, key)
      store.updateProcessed(actualIndex, result, 'done')
      successCount++
    } catch (error) {
      store.updateProcessed(actualIndex, `处理失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error')
    }
    completed++
    batchProgress.value = Math.round((completed / filteredFiles.length) * 100)
  }

  setTimeout(() => {
    batchLoading.value = false
    loadCurrentFile()
    const total = filteredFiles.length
    if (successCount === total) {
      ElMessage.success(`批量处理完成，共 ${total} 个文件`)
    } else if (successCount > 0) {
      ElMessage.warning(`批量处理部分完成，成功 ${successCount} / ${total} 个文件`)
    } else {
      ElMessage.error('批量处理全部失败，请检查文件和密钥')
    }
  }, 100)
}

function handleDownloadSource() {
  if (!sourceText.value) {
    ElMessage.warning('没有可下载的原始数据')
    return
  }
  if (store.isFileMode()) {
    const file = store.state.files[store.state.activeIndex]
    downloadFile(sourceText.value, file?.name || 'source.json')
  } else {
    downloadFile(sourceText.value, 'source.json')
  }
}

function handleDownloadProcessed() {
  if (!processedText.value) {
    ElMessage.warning('没有可下载的处理后数据')
    return
  }
  // 获取加解密类型
  const cryptoType = store.state.cryptoConfig.mode === 'encrypt' ? 'encrypt' : 'decrypt'
  if (store.isFileMode()) {
    const file = store.state.files[store.state.activeIndex]
    downloadFile(processedText.value, file?.name.replace(/\.json$/i, `_${cryptoType}.json`) || `processed_${cryptoType}.json`)
  } else {
    downloadFile(processedText.value, `text_${cryptoType}.json`)
  }
}

function handleDownloadZip() {
  // 使用过滤后的文件
  const filteredFiles = store.getFilteredFiles()
  if (filteredFiles.length === 0) {
    ElMessage.warning('当前筛选条件下没有可下载的文件')
    return
  }
  const cryptoType = store.state.cryptoConfig.mode === 'encrypt' ? '_encrypt' : '_decrypt'
  downloadAsZip(filteredFiles, cryptoType)
}

function handleClearProcessed() {
  processedText.value = ''
  if (store.isFileMode()) {
    store.updateProcessed(store.state.activeIndex, '', 'pending')
  }
}

function handleAddFiles() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.multiple = true
  input.onchange = async (e) => {
    const files = (e.target as HTMLInputElement).files
    if (!files || files.length === 0) return
    
    try {
      // 确保 store 已初始化以获取已有文件列表
      await store.init()
      const addedCount = await store.addFiles(Array.from(files))
      if (addedCount > 0) {
        ElMessage.success(`已添加 ${addedCount} 个文件`)
        loadCurrentFile()
      } else {
        ElMessage.info('所有文件已存在，无需重复添加')
      }
    } catch (error) {
      ElMessage.error('文件上传失败')
    }
  }
  input.click()
}

async function detectCryptoMode() {
  const content = sourceText.value
  if (content) {
    store.detectAndSetCryptoMode(content)
  }
}

async function handleBack() {
  try {
    await ElMessageBox.confirm(
      '离开将清除所有数据，是否确认？',
      '确认离开',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    )
    await store.reset()
    router.replace('/upload')
  } catch {
    // User cancelled
  }
}
</script>

<template>
  <div class="min-h-screen bg-dark-bg flex flex-col">
    <!-- Top Bar -->
    <header class="fixed top-0 left-0 right-0 z-50 h-18 bg-gradient-to-r from-dark-card to-dark-bg border-b border-dark-border flex items-center justify-between px-6">
      <div class="flex items-center gap-4">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-rose-400 bg-gradient-to-br from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 hover:shadow-lg hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          @click="handleBack"
        >
          <ArrowLeft :size="18" />
          返回
        </button>
        <div class="h-6 w-px bg-dark-border"></div>
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FileJson :size="18" class="text-white" />
          </div>
          <span class="text-lg font-bold text-white" style="font-family: 'JetBrains Mono', monospace">JSON Crypto</span>
        </div>
      </div>
      
      <CryptoConfig
        :algorithm="store.state.cryptoConfig.algorithm"
        :secret-key="store.state.cryptoConfig.key"
        :mode="store.state.cryptoConfig.mode"
        @update:algorithm="store.state.cryptoConfig.algorithm = $event"
        @update:secret-key="store.state.cryptoConfig.key = $event"
        @update:mode="store.state.cryptoConfig.mode = $event"
      />
    </header>

    <!-- Main Content -->
    <div class="flex-1 pt-18 flex">
      <!-- Sidebar -->
      <aside v-if="store.isFileMode()" class="w-60 shrink-0 border-r border-dark-border bg-dark-card overflow-hidden">
        <FileList
          :files="store.state.files"
          :active-index="store.state.activeIndex"
          :filter="store.state.filter"
          @select="handleFileSelect"
          @add="handleAddFiles"
          @update:filter="handleFilterChange"
        />
      </aside>

      <!-- Editor Area -->
      <div class="flex-1 flex flex-col p-4 gap-3 min-w-0">
        <!-- Toolbar -->
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <ToolBar
            :has-source="hasSource"
            :has-processed="hasProcessed"
            :has-source-valid-json="hasSourceValidJson"
            :has-processed-valid-json="hasProcessedValidJson"
            :mode="store.state.cryptoConfig.mode"
            @format="handleFormat"
            @compress="handleCompress"
            @encrypt="handleEncrypt"
            @decrypt="handleDecrypt"
          />
          <BatchAction
            :file-count="store.state.files.length"
            :filtered-count="store.getFilteredFiles().length"
            :has-processed="hasProcessed"
            :batch-loading="batchLoading"
            @batch-process="handleBatchProcess"
            @download-zip="handleDownloadZip"
          />
        </div>

        <!-- Batch Progress -->
        <div v-if="batchLoading" class="w-full">
          <el-progress :percentage="batchProgress" :stroke-width="4" status="success" />
        </div>

        <!-- Editors -->
        <div class="flex-1 flex flex-col gap-3 min-h-0">
          <JsonEditor
            label="原数据"
            v-model="sourceText"
            :mode="store.state.cryptoConfig.mode"
            :has-source="hasSource"
            :style="{ flex: '1', minHeight: '200px' }"
            @download="handleDownloadSource"
            @refresh="handleRefresh"
            @encrypt="handleEncrypt"
            @decrypt="handleDecrypt"
          />
          <JsonEditor
            label="处理后数据"
            :model-value="processedText"
            :readonly="true"
            :style="{ flex: '1', minHeight: '200px' }"
            @download="handleDownloadProcessed"
            @clear="handleClearProcessed"
          />
        </div>
      </div>
    </div>
  </div>
</template>
