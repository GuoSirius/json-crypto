<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Table2, Upload, Download, Search,
  CheckSquare, Square, RotateCcw, FileText, Undo2, FolderTree, AlignJustify, FileJson
} from 'lucide-vue-next'
import { useExcelStore } from '@/stores/excelStore'
import { useJsonStore } from '@/stores/jsonStore'
import { downloadSheet, downloadSheetsAsZip } from '@/utils/download'
import { readFileAsArrayBuffer, parseExcelBuffer } from '@/utils/excel'
import type { SheetFormat, BatchDownloadMode } from '@/types'

const router = useRouter()
const store = useExcelStore()
const jsonStore = useJsonStore()

const searchText = ref('')
const batchMode = ref<BatchDownloadMode>('flat')

// 带入JSON处理的对话框状态
const showJsonImportDialog = ref(false)
const pendingJsonFiles = ref<Array<{ file: File; source: 'excel-import' }>>([])
const pendingValidCount = ref(0)
const hasJsonData = ref(false)

const activeFile = computed(() => store.state.files[store.state.activeFileIndex])
const activeSheet = computed(() => activeFile.value?.sheets[activeFile.value.activeSheetIndex])

const selectedCount = computed(() => {
  let count = 0
  for (const f of store.state.files) {
    for (const s of f.sheets) {
      if (s.selected) count++
    }
  }
  return count
})

const isAllSelected = computed(() => {
  for (const f of store.state.files) {
    for (const s of f.sheets) {
      if (!s.selected) return false
    }
  }
  return store.state.files.length > 0
})

onMounted(async () => {
  await store.init()
  if (!store.hasData()) {
    router.replace('/excel/upload')
    return
  }
})

watch(searchText, (val) => {
  store.setSearchKeyword(val)
})

function handleFileSelect(index: number) {
  store.setActiveFileIndex(index)
}

function handleSheetSelect(sheetIndex: number) {
  if (activeFile.value) {
    store.setActiveSheetIndex(store.state.activeFileIndex, sheetIndex)
  }
}

function handleFormatChange(sheetIndex: number, format: SheetFormat) {
  store.updateSheetFormat(store.state.activeFileIndex, sheetIndex, format)
}

function handleDisplayNameInput(sheetIndex: number, name: string) {
  store.updateSheetDisplayName(store.state.activeFileIndex, sheetIndex, name)
}

function handleDisplayNameBlur(sheetIndex: number) {
  // 失焦时检查是否为空，如果为空则还原为原始名称
  store.restoreSheetDisplayNameIfEmpty(store.state.activeFileIndex, sheetIndex)
}

function handleResetName(sheetIndex: number) {
  store.resetSheetDisplayName(store.state.activeFileIndex, sheetIndex)
}

function handleUseFileName(sheetIndex: number) {
  store.setSheetDisplayNameAsFileName(store.state.activeFileIndex, sheetIndex)
}

function handleToggleSelect(sheetIndex: number) {
  store.toggleSheetSelection(store.state.activeFileIndex, sheetIndex)
}

function handleSelectAll(select: boolean) {
  store.selectAllSheets(store.state.activeFileIndex, select)
}

function handleInvertSelection() {
  store.invertSheetSelection(store.state.activeFileIndex)
}

function handleSelectAllGlobal(select: boolean) {
  store.selectAllSheetsGlobal(select)
}

function handleInvertSelectionGlobal() {
  store.invertSheetSelectionGlobal()
}

function handleDownloadSingle() {
  if (!activeSheet.value) return
  downloadSheet(activeSheet.value)
  ElMessage.success(`已下载 "${activeSheet.value.displayName}"`)
}

function handleBatchDownload() {
  const selected = store.getSelectedSheets()
  if (selected.length === 0) {
    ElMessage.warning('请先选择要下载的工作表')
    return
  }
  const items = selected.map(s => ({
    fileName: s.file.name,
    sheet: s.sheet,
  }))
  downloadSheetsAsZip(items, batchMode.value)
  ElMessage.success(`已打包下载 ${selected.length} 个工作表`)
}

async function handleAddFiles() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.multiple = true
  input.onchange = async (e) => {
    const files = (e.target as HTMLInputElement).files
    if (!files || files.length === 0) return
    const { addedCount, duplicateCount, errorFiles } = await store.addFiles(Array.from(files))
    if (errorFiles.length > 0) {
      errorFiles.forEach(err => ElMessage.error(err))
    }
    if (addedCount > 0) {
      ElMessage.success(`成功添加 ${addedCount} 个文件`)
    }
    if (duplicateCount > 0) {
      ElMessage.info(`跳过 ${duplicateCount} 个重复文件`)
    }
  }
  input.click()
}

async function handleBack() {
  try {
    await ElMessageBox.confirm(
      '离开将清除所有 Excel 数据，是否确认？',
      '确认离开',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    )
    await store.reset()
    router.replace('/excel/upload')
  } catch {
    // cancelled
  }
}

function handleDeleteFile(index: number) {
  store.deleteFile(index)
  ElMessage.success('文件已删除')
}

async function handleGoToJsonProcess() {
  // 获取已选中的工作表
  const selectedSheets = store.getSelectedSheets()

  if (selectedSheets.length === 0) {
    ElMessage.warning('请先选择要带入JSON处理的工作表')
    return
  }

  // 过滤出JSON格式、已正常解析且有数据的工作表
  const validSheets = selectedSheets.filter(({ sheet }) => {
    // 必须是JSON格式，已正常解析（无解析错误）且有解析数据
    return sheet.format === 'json' &&
           !sheet.parseError && 
           sheet.parsedData && 
           sheet.parsedData.trim().length > 0
  })

  if (validSheets.length === 0) {
    ElMessage.warning('所选工作表中没有可带入的有效JSON数据（需为JSON格式且可正常解析）')
    return
  }

  // 文件名去重处理：默认用工作表名，重名则添加Excel文件名前缀，还重名则添加序号
  const usedNames = new Map<string, number>() // 记录每个名字出现的次数

  // 第一遍：处理文件名
  const processedSheets = validSheets.map(({ sheet, file }) => {
    let baseName = sheet.displayName.endsWith('.json')
      ? sheet.displayName.slice(0, -5) // 去掉 .json 后缀
      : sheet.displayName

    let finalName = baseName
    let counter = usedNames.get(baseName) || 0

    if (counter > 0) {
      // 已有重名，添加Excel文件名
      const excelName = file.name.replace(/\.xlsx?$/i, '')
      finalName = `${excelName}_${baseName}`

      // 再次检查是否重名
      counter = usedNames.get(finalName) || 0
      if (counter > 0) {
        // 还重名，添加序号
        finalName = `${excelName}_${baseName}_${counter}`
      }
    }

    // 记录使用过的名字
    usedNames.set(baseName, (usedNames.get(baseName) || 0) + 1)
    if (finalName !== baseName) {
      usedNames.set(finalName, 1)
    }

    return {
      sheet,
      file,
      finalName: finalName + '.json',
      content: sheet.parsedData
    }
  })

  // 准备带入的数据（包含来源信息）
  const jsonFiles: Array<{ file: File; source: 'excel-import' }> = []

  for (const { finalName, content } of processedSheets) {
    // 将内容转换为File对象
    const blob = new Blob([content], { type: 'application/json' })
    const fileObj = new File([blob], finalName, { type: 'application/json' })
    jsonFiles.push({ file: fileObj, source: 'excel-import' })
  }

  // 检查JSON处理页面的状态
  await jsonStore.init()
  const isFileMode = jsonStore.isFileMode()
  const hasExistingData = isFileMode && jsonStore.hasData()

  // 设置待处理的数据
  pendingJsonFiles.value = jsonFiles
  pendingValidCount.value = validSheets.length
  hasJsonData.value = hasExistingData

  // 显示对话框
  showJsonImportDialog.value = true
}

async function handleJsonImportConfirm(mode: 'increment' | 'overwrite') {
  const filesWithSource = pendingJsonFiles.value.map(item => item.file)
  
  if (mode === 'increment') {
    // 增量带入
    const result = await jsonStore.addFiles(filesWithSource, 'excel-import')
    // 优化提示信息：区分新增和替换
    if (result.updatedCount > 0) {
      if (result.addedCount > 0) {
        ElMessage.success(`已更新 ${result.updatedCount} 个工作表内容，新增 ${result.addedCount} 个工作表`)
      } else {
        ElMessage.success(`已更新 ${result.updatedCount} 个工作表内容`)
      }
    } else if (result.addedCount > 0) {
      ElMessage.success(`已新增带入 ${result.addedCount} 个工作表`)
    } else if (result.duplicateCount > 0) {
      ElMessage.info(`所有 ${result.duplicateCount} 个工作表已是最新，无需更新`)
    }
  } else {
    // 全量覆盖
    await jsonStore.reset()
    const result = await jsonStore.addFiles(filesWithSource, 'excel-import')
    ElMessage.success(`已带入 ${result.addedCount} 个工作表`)
  }

  showJsonImportDialog.value = false
  
  // 强制确保数据持久化到IndexedDB后再跳转
  await jsonStore.persist()
  
  // 跳转到JSON处理页面
  router.push('/json/process')
}

function handleJsonImportCancel() {
  // 停留在当前位置，不进行跳转
  showJsonImportDialog.value = false
}
</script>

<template>
  <div class="min-h-screen bg-app-bg flex flex-col">
    <!-- Top Bar -->
    <header class="sticky top-0 z-30 h-14 bg-app-card/80 backdrop-blur-xl border-b border-app-border flex items-center justify-between px-4">
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-app-border bg-app-fill hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 hover:border-blue-500/50 hover:text-blue-400 transition-all cursor-pointer text-app-text-regular"
          @click="handleBack"
        >
          <ArrowLeft :size="14" />
          返回
        </button>
        <div class="h-5 w-px bg-app-border"></div>
        <span class="text-sm font-bold text-app-text-primary" style="font-family: 'JetBrains Mono', monospace">Excel 处理</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-app-border bg-app-fill hover:bg-gradient-to-br hover:from-violet-500/10 hover:to-purple-500/10 hover:border-violet-500/50 hover:text-violet-400 transition-all cursor-pointer text-app-text-regular"
          @click="handleGoToJsonProcess"
        >
          <FileJson :size="14" />
          进入JSON处理
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-app-border bg-app-fill hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-teal-500/10 hover:border-emerald-500/50 hover:text-emerald-400 transition-all cursor-pointer text-app-text-regular"
          @click="handleAddFiles"
        >
          <Upload :size="14" />
          添加文件
        </button>
      </div>
    </header>

    <!-- Main Content - Three Column Layout -->
    <div class="flex-1 flex min-h-0">
      <!-- Column 1: Excel File List -->
      <aside class="w-56 shrink-0 border-r border-app-border bg-app-card overflow-hidden flex flex-col">
        <div class="p-3 border-b border-app-border">
          <div class="relative">
            <Search :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-app-text-placeholder" />
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索文件名..."
              class="w-full box-border pl-8 pr-3 py-1.5 rounded-lg bg-app-fill border border-app-border text-xs text-app-text-primary placeholder-app-text-placeholder focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="(file, index) in store.getFilteredFiles()"
            :key="file.id"
            class="flex items-center gap-2 px-3 py-2.5 border-b border-app-border/50 cursor-pointer transition-all group"
            :class="index === store.state.activeFileIndex
              ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-2 border-l-blue-500'
              : 'hover:bg-app-fill border-l-2 border-l-transparent'"
            @click="handleFileSelect(store.state.files.indexOf(file))"
          >
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <Table2 :size="14" class="text-emerald-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-app-text-primary font-medium truncate">{{ file.name }}</p>
              <p class="text-[10px] text-app-text-placeholder">{{ file.sheets.length }} 个工作表</p>
            </div>
            <button
              class="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              title="删除"
              @click.stop="handleDeleteFile(store.state.files.indexOf(file))"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Column 2: Sheet List -->
      <aside v-if="activeFile" class="w-72 shrink-0 border-r border-app-border bg-app-card overflow-hidden flex flex-col">
        <!-- Sheet List Header -->
        <div class="p-3 border-b border-app-border flex items-center justify-between">
          <span class="text-xs font-semibold text-app-text-primary">工作表列表</span>
          <div class="flex items-center gap-1.5">
            <button
              class="p-1.5 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/40 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              title="全选"
              @click="handleSelectAll(true)"
            >
              <CheckSquare :size="14" />
            </button>
            <button
              class="p-1.5 rounded-lg font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/40 hover:shadow-amber-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              title="取消全选"
              @click="handleSelectAll(false)"
            >
              <Square :size="14" />
            </button>
            <button
              class="p-1.5 rounded-lg font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/40 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              title="反选"
              @click="handleInvertSelection"
            >
              <RotateCcw :size="14" />
            </button>
          </div>
        </div>

        <!-- Sheet Items -->
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="(sheet, sIndex) in activeFile.sheets"
            :key="sheet.id"
            class="border-b border-app-border/50 transition-all"
            :class="sIndex === activeFile.activeSheetIndex ? 'bg-app-fill' : 'hover:bg-app-fill/50'"
          >
            <div
              class="flex items-center gap-2 px-3 py-2"
            >
              <input
                type="checkbox"
                class="w-3.5 h-3.5 rounded border-app-border cursor-pointer shrink-0 accent-blue-500"
                :checked="sheet.selected"
                @change="handleToggleSelect(sIndex)"
              />
              <div class="flex-1 min-w-0">
                <input
                  :value="sheet.displayName"
                  class="w-full text-xs bg-transparent border-none text-app-text-primary font-medium focus:outline-none focus:text-blue-400 transition-colors"
                  @click.stop
                  @input="handleDisplayNameInput(sIndex, ($event.target as HTMLInputElement).value)"
                  @blur="handleDisplayNameBlur(sIndex)"
                />
              </div>
            </div>
            <!-- Sheet Actions Row -->
            <div class="flex items-center gap-1 px-3 pb-2">
              <select
                :value="sheet.format"
                class="h-6 px-1.5 rounded bg-app-fill border border-app-border text-[10px] text-app-text-regular cursor-pointer focus:outline-none focus:border-primary"
                @change="handleFormatChange(sIndex, ($event.target as HTMLSelectElement).value as SheetFormat)"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              <button
                class="p-1 rounded-md font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                title="还原原始名称"
                @click="handleResetName(sIndex)"
              >
                <Undo2 :size="12" />
              </button>
              <button
                class="p-1 rounded-md font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                title="使用 Excel 文件名"
                @click="handleUseFileName(sIndex)"
              >
                <FileText :size="12" />
              </button>
              <button
                class="p-1 rounded-md font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                title="下载此工作表"
                @click="handleDownloadSingle()"
              >
                <Download :size="12" />
              </button>
              <!-- 点击行切换工作表 -->
              <button
                class="ml-auto text-[10px] px-1.5 py-0.5 rounded text-white bg-blue-500 hover:bg-blue-400 border border-blue-600 hover:border-blue-400 shadow-sm hover:shadow transition-all cursor-pointer"
                :class="sIndex === activeFile.activeSheetIndex ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-600 hover:border-emerald-400' : ''"
                @click="handleSheetSelect(sIndex)"
              >
                {{ sIndex === activeFile.activeSheetIndex ? '当前' : '查看' }}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Column 3: Data Editor -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Editor Header -->
        <div v-if="activeSheet" class="flex items-center justify-between px-4 py-2 border-b border-app-border bg-app-card shrink-0">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs text-app-text-placeholder">当前工作表:</span>
            <span class="text-xs font-semibold text-app-text-primary truncate">{{ activeSheet.displayName }}</span>
            <span
              v-if="activeSheet.parseError"
              class="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 shrink-0"
            >
              解析失败
            </span>
            <span
              v-else
              class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0"
            >
              {{ activeSheet.format.toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Editor Content -->
        <div v-if="activeSheet" class="flex-1 p-4 min-h-0 overflow-hidden flex flex-col">
          <!-- Parse Error -->
          <div v-if="activeSheet.parseError" class="mb-3 shrink-0">
            <div class="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
              <p class="text-xs font-semibold text-red-400 mb-1">解析失败原因</p>
              <p class="text-xs text-red-400/80">{{ activeSheet.parseError }}</p>
            </div>
          </div>

          <!-- Parsed Data (Editable) -->
          <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div class="flex items-center gap-2 mb-2 shrink-0">
              <span class="text-xs font-semibold text-app-text-primary">
                {{ activeSheet.parseError ? '原始数据' : '解析数据（可编辑）' }}
              </span>
            </div>
            <textarea
              :value="activeSheet.parseError ? activeSheet.rawData : activeSheet.parsedData"
              class="flex-1 w-full box-border bg-app-fill border border-app-border rounded-xl p-3 text-xs text-app-text-primary font-mono resize-none focus:outline-none focus:border-primary transition-colors leading-relaxed"
              :readonly="false"
              @input="store.updateSheetParsedData(store.state.activeFileIndex, activeFile!.activeSheetIndex, ($event.target as HTMLTextAreaElement).value)"
            ></textarea>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <Table2 :size="48" class="text-app-text-placeholder/30 mx-auto mb-3" />
            <p class="text-sm text-app-text-placeholder">选择一个工作表查看数据</p>
          </div>
        </div>

        <!-- Batch Download Footer -->
        <div class="border-t border-app-border bg-app-card/80 backdrop-blur-xl p-3">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-3">
              <span class="text-xs text-app-text-regular">
                已选 <span class="font-bold text-blue-400">{{ selectedCount }}</span> 个工作表
              </span>
              <div class="flex items-center gap-1.5">
                <button
                  class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all cursor-pointer"
                  :class="batchMode === 'grouped'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/40 hover:shadow-violet-500/50 hover:-translate-y-0.5'
                    : 'bg-app-fill text-app-text-regular border border-app-border hover:border-violet-500/40 hover:text-violet-400 hover:bg-violet-500/10'"
                  @click="batchMode = 'grouped'"
                >
                  <FolderTree :size="12" />
                  按目录
                </button>
                <button
                  class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all cursor-pointer"
                  :class="batchMode === 'flat'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/50 hover:-translate-y-0.5'
                    : 'bg-app-fill text-app-text-regular border border-app-border hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/10'"
                  @click="batchMode = 'flat'"
                >
                  <AlignJustify :size="12" />
                  平铺
                </button>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                @click="handleSelectAllGlobal(true)"
              >
                <CheckSquare :size="12" />
                全选
              </button>
              <button
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/40 hover:shadow-amber-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                @click="handleSelectAllGlobal(false)"
              >
                <Square :size="12" />
                取消
              </button>
              <button
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/40 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                @click="handleInvertSelectionGlobal"
              >
                <RotateCcw :size="12" />
                反选
              </button>
              <button
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/50 hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                :disabled="selectedCount === 0"
                @click="handleBatchDownload"
              >
                <Download :size="14" />
                批量下载 ({{ selectedCount }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 带入JSON处理确认对话框 -->
  <Teleport to="body">
    <el-dialog
      v-model="showJsonImportDialog"
      title="带入JSON处理"
      width="420px"
      :close-on-click-modal="false"
      @close="handleJsonImportCancel"
    >
      <div class="text-center py-2">
        <p class="text-base text-app-text-primary mb-2">
          已选择 <span class="font-bold text-blue-400">{{ pendingValidCount }}</span> 个有效工作表
        </p>
        <p class="text-sm text-app-text-secondary">
          请选择带入方式：
        </p>
      </div>
      <template #footer>
        <div class="flex justify-center gap-3">
          <el-button @click="handleJsonImportCancel">
            暂不带入
          </el-button>
          <template v-if="hasJsonData">
            <el-button type="primary" @click="handleJsonImportConfirm('increment')">
              增量带入
            </el-button>
            <el-button type="warning" @click="handleJsonImportConfirm('overwrite')">
              全量覆盖
            </el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="handleJsonImportConfirm('overwrite')">
              全量覆盖
            </el-button>
          </template>
        </div>
      </template>
    </el-dialog>
  </Teleport>
</template>
