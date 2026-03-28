# Changelog

## [0.2.0] - 2026-03-28

### Added

- **全局侧边栏导航**：新增左侧可折叠侧边栏，默认纯图标，悬停展开文字，统一管理所有功能模块
- **Excel 上传页面**：支持拖拽上传 .xlsx/.xls 文件，文件名+内容哈希去重，搜索过滤
- **Excel 处理页面**：三栏布局（文件列表+工作表列表+数据编辑区）
  - 工作表名称可编辑，支持一键还原原始名称或使用 Excel 文件名
  - 每个工作表支持 JSON/CSV 两种解析格式切换
  - 解析数据可在线编辑
  - 解析失败时显示错误原因及原始数据
- **工作表下载**：支持单独下载和跨 Excel 批量 ZIP 下载
  - 按目录模式：按 Excel 文件名划分目录
  - 平铺模式：直接平铺，重名自动加前缀
- **批量选择**：支持逐个选择、全选、反选工作表
- **新增依赖**：SheetJS (xlsx) 用于 Excel 解析
- **新增测试**：excel 工具函数测试（9 个用例）、excelStore 测试（7 个用例）
- **IndexedDB 升级**：新增 excelStore objectStore，DB 版本升级到 2

### Changed

- **路由重构**：`/upload` → `/json/upload`，`/process` → `/json/process`，新增 `/excel/*` 路由
- **App.vue**：改为侧边栏 + 内容区的全局布局
- **UploadView**：简化标题区域，移除品牌 header 和 ThemeToggle（已移至侧边栏）
- **ProcessView**：简化顶部 header，移除品牌标识和 ThemeToggle，适配侧边栏布局
- **移除自动跳转**：App.vue 不再根据 hasData 自动跳转，统一通过菜单导航

### Fixed

- 旧测试用例适配新路由和页面结构变更
