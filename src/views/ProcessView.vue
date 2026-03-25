<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, FileJson } from 'lucide-vue-next'
import { useJsonStore } from '../stores/jsonStore'
import { formatJson, compressJson, isValidJson } from '../utils/json'
import { processCrypto, detectEncrypted, removeOuterQuotes, calculateMD5 } from '../utils/crypto'
import { downloadFile, downloadAsZip } from '../utils/download'
import type { CryptoMode, CryptoAlgorithm } from '../types'
import { cleanData } from '../utils/crypto'

import FileList from '../components/FileList.vue'
import JsonEditor from '../components/JsonEditor.vue'
import ToolBar from '../components/ToolBar.vue'
import CryptoConfig from '../components/CryptoConfig.vue'
import BatchAction from '../components/BatchAction.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()
const store = useJsonStore()

const sourceText = ref('')
const processedText = ref('')
const batchLoading = ref(false)
const batchProgress = ref(0)

const hasSource = computed(() => !!sourceText.value.trim())
const hasProcessed = computed(() => !!processedText.value.trim())
// 基础验证：直接检查是否是有效 JSON
const hasSourceValidJson = computed(() => isValidJson(sourceText.value))
const hasProcessedValidJson = computed(() => isValidJson(processedText.value))
// 增强验证：去除引号后检查是否是有效 JSON（用于格式化和压缩按钮的禁用判断）
const hasSourceValidJsonOrWithQuotes = computed(() => {
  const cleanText = removeOuterQuotes(sourceText.value)
  return isValidJson(cleanText)
})
const hasProcessedValidJsonOrWithQuotes = computed(() => {
  const cleanText = removeOuterQuotes(processedText.value)
  return isValidJson(cleanText)
})

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

function handleSearchKeywordChange(keyword: string) {
  store.setSearchKeyword(keyword)
  // 搜索后选中第一个匹配的文件
  const filteredFiles = store.getFilteredFiles()
  if (filteredFiles.length > 0) {
    const actualIndex = store.state.files.findIndex(f => f.md5 === filteredFiles[0].md5)
    if (actualIndex >= 0) {
      store.setActiveIndex(actualIndex)
      loadCurrentFile()
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
  // 使用支持引号的判断逻辑
  const useSource = hasSourceValidJsonOrWithQuotes.value || hasProcessedValidJsonOrWithQuotes.value === false
  const inputText = useSource ? sourceText.value : processedText.value
  if (!inputText) {
    ElMessage.error('没有可格式化的 JSON 数据')
    return
  }
  // 先去除可能存在的外层引号
  const cleanText = removeOuterQuotes(inputText)
  if (!isValidJson(cleanText)) {
    ElMessage.error('当前数据不是有效的 JSON')
    return
  }
  let result = formatJson(cleanText)
  // 如果原本有引号（去除引号前后不同）或者是加密后的数据（根据 wrapWithQuotes），则加上引号
  const hadQuotes = cleanText !== inputText
  // 如果 wrapWithQuotes 为 true，也需要加引号
  const needQuotes = hadQuotes || store.state.cryptoConfig.wrapWithQuotes
  if (needQuotes) {
    result = `"${result}"`
  }
  // 如果输入来自原数据，结果放到处理后；反之放回处理后
  if (hasSourceValidJsonOrWithQuotes.value) {
    processedText.value = result
    saveResult(result)
  } else {
    processedText.value = result
  }
}

function handleCompress() {
  // 优先使用原始数据，如果没有则使用处理后数据
  // 使用支持引号的判断逻辑
  const useSource = hasSourceValidJsonOrWithQuotes.value || hasProcessedValidJsonOrWithQuotes.value === false
  const inputText = useSource ? sourceText.value : processedText.value
  if (!inputText) {
    ElMessage.error('没有可压缩的 JSON 数据')
    return
  }
  // 先去除可能存在的外层引号
  const cleanText = removeOuterQuotes(inputText)
  if (!isValidJson(cleanText)) {
    ElMessage.error('当前数据不是有效的 JSON')
    return
  }
  let result = compressJson(cleanText)
  // 如果原本有引号（去除引号前后不同）或者是加密后的数据（根据 wrapWithQuotes），则加上引号
  const hadQuotes = cleanText !== inputText
  // 如果 wrapWithQuotes 为 true，也需要加引号
  const needQuotes = hadQuotes || store.state.cryptoConfig.wrapWithQuotes
  if (needQuotes) {
    result = `"${result}"`
  }
  // 如果输入来自原数据，结果放到处理后；反之放回处理后
  if (hasSourceValidJsonOrWithQuotes.value) {
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
  const { algorithm, key, wrapWithQuotes } = store.state.cryptoConfig
  if (algorithm !== 'Base64' && !key.trim()) {
    ElMessage.warning('请输入密钥')
    return
  }
  const data = mode === 'encrypt' ? sourceText.value : sourceText.value
  try {
    const result = processCrypto(data, mode, algorithm, key)
    // 根据复选框决定是否添加引号
    const finalResult = wrapWithQuotes ? `"${result}"` : result
    processedText.value = finalResult
    saveResult(finalResult)
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
  const { algorithm, key, wrapWithQuotes } = store.state.cryptoConfig
  console.log('handleBatchProcess - wrapWithQuotes:', wrapWithQuotes)
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
      // 根据复选框决定是否添加引号
      const finalResult = wrapWithQuotes ? `"${result}"` : result
      console.log(`File ${file.name} - wrapWithQuotes: ${wrapWithQuotes}, result length: ${result.length}, finalResult: ${finalResult.substring(0, 50)}...`)
      store.updateProcessed(actualIndex, finalResult, 'done')
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
      
      // 获取已有文件的唯一标识（文件名 + MD5）进行去重
      const existingIdentities = new Set<string>()
      for (const f of store.state.files) {
        existingIdentities.add(`${f.name}-${f.md5}`)
      }
      
      const fileArray = Array.from(files)
      const fileResults: Array<{
        file: File;
        name: string;
        identity: string;
        isStoreDuplicate: boolean;
        isSelectionDuplicate: boolean;
      }> = []
      
      // 第一步：计算所有文件的标识并检查与store的重复
      for (const file of fileArray) {
        let content = await file.text()
        // 清理引号包裹的内容（与store.addFiles保持一致）
        const { cleaned: sanitizedContent } = cleanData(content)
        content = sanitizedContent.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '').trim()
        const md5 = calculateMD5(content)
        const identity = `${file.name}-${md5}`
        const isStoreDuplicate = existingIdentities.has(identity)
        
        fileResults.push({
          file,
          name: file.name,
          identity,
          isStoreDuplicate,
          isSelectionDuplicate: false // 将在下一步确定
        })
      }
      
      // 第二步：检查本次选择中的重复（只检查非store重复的文件）
      const selectedIdentities = new Map<string, number>() // 记录每个identity出现的次数
      for (const result of fileResults) {
        if (result.isStoreDuplicate) {
          continue // 已经是store重复，跳过
        }

        const count = selectedIdentities.get(result.identity) || 0
        if (count > 0) {
          // 第2次及以后出现的都标记为重复
          result.isSelectionDuplicate = true
        }
        selectedIdentities.set(result.identity, count + 1)
      }
      
      // 统计结果
      const newFiles = fileResults.filter(r => !r.isStoreDuplicate && !r.isSelectionDuplicate).map(r => r.file)
      const storeDuplicates = fileResults.filter(r => r.isStoreDuplicate).map(r => r.name)

      // 选择重复的文件:所有非store重复且重复次数>1的文件都要计入
      const selectionDuplicates: string[] = []
      for (const result of fileResults) {
        if (!result.isStoreDuplicate) {
          const count = selectedIdentities.get(result.identity) || 0
          if (count > 1) {
            // 这个文件被选择了多次,所有选择都计入重复
            selectionDuplicates.push(result.name)
          }
        }
      }
      
      // 显示重复信息
      if (storeDuplicates.length > 0 || selectionDuplicates.length > 0) {
        const messages: string[] = []
        
        // 对store重复进行去重统计（相同文件可能多次选择）
        const uniqueStoreDuplicates = [...new Set(storeDuplicates)]
        if (uniqueStoreDuplicates.length > 0) {
          const totalStoreDupCount = storeDuplicates.length
          const uniqueStoreDupCount = uniqueStoreDuplicates.length

          if (uniqueStoreDupCount === 1) {
            if (totalStoreDupCount === 1) {
              messages.push(`文件 "${uniqueStoreDuplicates[0]}" 已在系统中存在`)
            } else {
              messages.push(`文件 "${uniqueStoreDuplicates[0]}" 已在系统中存在（选择了 ${totalStoreDupCount} 次）`)
            }
          } else if (uniqueStoreDupCount <= 5) {
            // 显示所有重复文件名
            messages.push(`${totalStoreDupCount} 个文件已在系统中存在：${uniqueStoreDuplicates.join('、')}`)
          } else {
            // 超过5个时显示前5个和总数
            const previewNames = uniqueStoreDuplicates.slice(0, 5)
            messages.push(`${totalStoreDupCount} 个文件已在系统中存在：${previewNames.join('、')}等`)
          }
        }

        // 对选择重复进行去重统计
        const uniqueSelectionDuplicates = [...new Set(selectionDuplicates)]
        if (uniqueSelectionDuplicates.length > 0) {
          const totalSelectionDupCount = selectionDuplicates.length
          const uniqueSelectionDupCount = uniqueSelectionDuplicates.length

          if (uniqueSelectionDupCount === 1) {
            if (totalSelectionDupCount === 1) {
              messages.push(`文件 "${uniqueSelectionDuplicates[0]}" 在本次选择中重复`)
            } else {
              messages.push(`文件 "${uniqueSelectionDuplicates[0]}" 在本次选择中重复（选择了 ${totalSelectionDupCount} 次）`)
            }
          } else if (uniqueSelectionDupCount <= 5) {
            // 显示所有重复文件名
            messages.push(`${totalSelectionDupCount} 个文件在本次选择中重复：${uniqueSelectionDuplicates.join('、')}`)
          } else {
            // 超过5个时显示前5个和总数
            const previewNames = uniqueSelectionDuplicates.slice(0, 5)
            messages.push(`${totalSelectionDupCount} 个文件在本次选择中重复：${previewNames.join('、')}等`)
          }
        }
        
        if (messages.length > 0) {
          ElMessage.warning(`已过滤重复文件：${messages.join('；')}`)
        }
      }
      
      if (newFiles.length > 0) {
        const {addedCount, duplicateCount: storeDuplicateCount} = await store.addFiles(newFiles)
        if (addedCount > 0) {
          const successMsg = `已成功添加 ${addedCount} 个文件`
          if (newFiles.length === 1) {
            ElMessage.success(`文件 "${newFiles[0].name}" 已成功添加`)
          } else {
            ElMessage.success(successMsg)
          }
          loadCurrentFile()
        } else {
          if (storeDuplicateCount > 0) {
            ElMessage.info('所有文件已存在，无需重复添加')
          } else {
            ElMessage.info('没有文件被成功添加')
          }
        }
      } else if (fileArray.length > 0 && newFiles.length === 0) {
        // 所有文件都是重复的
        if (storeDuplicates.length === 0 && selectionDuplicates.length === 0) {
          ElMessage.info('没有文件被添加')
        }
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
  <div class="min-h-screen bg-app-bg flex flex-col">
    <!-- Top Bar -->
    <header class="fixed top-0 left-0 right-0 z-50 h-18 bg-gradient-to-r from-app-card to-app-bg border-b border-app-border flex items-center justify-between px-6">
      <div class="flex items-center gap-4">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-300 bg-gradient-to-br from-blue-400 to-purple-600 text-white hover:from-blue-500 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer dark:border-blue-400 dark:from-blue-500 dark:to-purple-500"
          @click="handleBack"
        >
          <ArrowLeft :size="18" />
          返回
        </button>
        <div class="h-6 w-px bg-app-border"></div>
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FileJson :size="18" class="text-white" />
          </div>
          <span class="text-lg font-bold text-app-text-primary" style="font-family: 'JetBrains Mono', monospace">JSON Crypto</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <CryptoConfig
          :algorithm="store.state.cryptoConfig.algorithm"
          :secret-key="store.state.cryptoConfig.key"
          :mode="store.state.cryptoConfig.mode"
          @update:algorithm="store.state.cryptoConfig.algorithm = $event"
          @update:secret-key="store.state.cryptoConfig.key = $event"
          @update:mode="store.state.cryptoConfig.mode = $event"
        />
        <ThemeToggle />
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 pt-18 flex">
      <!-- Sidebar -->
      <aside v-if="store.isFileMode()" class="w-60 shrink-0 border-r border-app-border bg-app-card overflow-hidden">
        <FileList
          :files="store.state.files"
          :active-index="store.state.activeIndex"
          :filter="store.state.filter"
          :search-keyword="store.state.searchKeyword"
          @select="handleFileSelect"
          @add="handleAddFiles"
          @update:filter="handleFilterChange"
          @update:search-keyword="handleSearchKeywordChange"
        />
      </aside>

      <!-- Editor Area -->
      <div class="flex-1 flex flex-col p-4 gap-3 min-w-0">
        <!-- Toolbar -->
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <ToolBar
            :has-source="hasSource"
            :has-processed="hasProcessed"
            :has-source-valid-json="hasSourceValidJsonOrWithQuotes"
            :has-processed-valid-json="hasProcessedValidJsonOrWithQuotes"
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
            :wrap-with-quotes="store.state.cryptoConfig.wrapWithQuotes"
            @batch-process="handleBatchProcess"
            @download-zip="handleDownloadZip"
            @update:wrap-with-quotes="store.state.cryptoConfig.wrapWithQuotes = $event"
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
