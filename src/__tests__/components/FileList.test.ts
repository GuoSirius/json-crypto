import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FileList from '@/components/FileList.vue'
import type { JsonFile } from '@/types'
import type { FileFilter } from '@/stores/jsonStore'

// Mock lucide-vue-next icons as simple spans
vi.mock('lucide-vue-next', () => ({
  FileJson: { name: 'FileJson', template: '<span class="icon-file-json" />' },
  Check: { name: 'Check', template: '<span class="icon-check" />' },
  AlertCircle: { name: 'AlertCircle', template: '<span class="icon-alert" />' },
  Plus: { name: 'Plus', template: '<span class="icon-plus" />' },
  Filter: { name: 'Filter', template: '<span class="icon-filter" />' },
  Search: { name: 'Search', template: '<span class="icon-search" />' },
  X: { name: 'X', template: '<span class="icon-x" />' },
}))

function createFile(overrides: Partial<JsonFile> = {}): JsonFile {
  return {
    id: 'test-id-1',
    name: 'test.json',
    content: '{"key": "value"}',
    md5: 'abc123',
    processed: '',
    status: 'pending' as const,
    ...overrides,
  }
}

function createEncryptedContent(): string {
  // A base64-like string longer than 20 chars
  return 'U2FsdGVkX18+Z5/6H8jK2mN3pQ4rS7tUvWxYz0A1B2C3D4E5F6G7H8I9J0'
}

function createWrapper(props: Partial<{
  files: JsonFile[]
  activeIndex: number
  filter: FileFilter
  searchKeyword: string
}> = {}) {
  return mount(FileList, {
    props: {
      files: [],
      activeIndex: 0,
      filter: 'all' as FileFilter,
      searchKeyword: '',
      ...props,
    },
  })
}

describe('FileList.vue', () => {
  it('renders file list title and add button', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('文件列表')
    expect(wrapper.text()).toContain('添加')
  })

  it('renders filter dropdown with all 5 options', () => {
    const wrapper = createWrapper()
    const select = wrapper.find('select')
    expect(select.exists()).toBe(true)
    const options = select.findAll('option')
    expect(options).toHaveLength(5)
    expect(options[0].text()).toBe('全部')
    expect(options[1].text()).toBe('待加密')
    expect(options[2].text()).toBe('待解密')
    expect(options[3].text()).toBe('未加密')
    expect(options[4].text()).toBe('未解密')
  })

  it('renders search input with placeholder', () => {
    const wrapper = createWrapper()
    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)
    expect(searchInput.attributes('placeholder')).toContain('关键词')
  })

  it('shows 暂无文件 when files array is empty', () => {
    const wrapper = createWrapper({ files: [] })
    expect(wrapper.text()).toContain('暂无文件')
  })

  it('shows all files when filter is all', () => {
    const files = [createFile({ name: 'a.json' }), createFile({ name: 'b.json', id: 'test-id-2', md5: 'def456' })]
    const wrapper = createWrapper({ files, filter: 'all' })
    // Use more specific selector to avoid matching the "添加" button
    const fileItems = wrapper.findAll('.cursor-pointer.transition-all.border-b')
    expect(fileItems).toHaveLength(2)
  })

  it('filters files by name keyword', () => {
    const files = [
      createFile({ name: 'data_alpha.json' }),
      createFile({ name: 'data_beta.json', id: 'test-id-2', md5: 'def456' }),
      createFile({ name: 'config.json', id: 'test-id-3', md5: 'ghi789' }),
    ]
    const wrapper = createWrapper({ files, filter: 'all', searchKeyword: 'data' })
    const fileItems = wrapper.findAll('.cursor-pointer.transition-all.border-b')
    expect(fileItems).toHaveLength(2)
  })

  it('shows 筛选结果为空 when filter matches nothing but files exist', () => {
    // Use content with non-base64 characters (spaces, colons) to ensure detectEncrypted returns false
    const files = [createFile({ content: '{ "normal" : "json" }' })]
    const wrapper = createWrapper({ files, filter: 'pending-decrypt' })
    expect(wrapper.text()).toContain('筛选结果为空')
  })

  it('emits select event with md5 when file item is clicked', async () => {
    const files = [createFile({ md5: 'click-md5' })]
    const wrapper = createWrapper({ files, filter: 'all' })
    const fileItem = wrapper.find('.cursor-pointer.transition-all.border-b')
    await fileItem.trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual(['click-md5'])
  })

  it('emits add event when add button is clicked', async () => {
    const wrapper = createWrapper()
    const addBtn = wrapper.findAll('button').find(b => b.text().includes('添加'))
    await addBtn.trigger('click')
    expect(wrapper.emitted('add')).toHaveLength(1)
  })

  it('emits update:filter when filter select changes', async () => {
    const wrapper = createWrapper()
    const select = wrapper.find('select')
    await select.setValue('pending-encrypt')
    expect(wrapper.emitted('update:filter')).toHaveLength(1)
    expect(wrapper.emitted('update:filter')![0]).toEqual(['pending-encrypt'])
  })

  it('emits update:searchKeyword when search input changes', async () => {
    const wrapper = createWrapper()
    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('test')
    expect(wrapper.emitted('update:searchKeyword')).toHaveLength(1)
    expect(wrapper.emitted('update:searchKeyword')![0]).toEqual(['test'])
  })

  it('renders clear button (X icon) only when searchKeyword is non-empty', () => {
    const wrapperEmpty = createWrapper({ searchKeyword: '' })
    // X icon component should not be rendered when searchKeyword is empty
    expect(wrapperEmpty.findAll('.icon-x')).toHaveLength(0)

    const wrapperWithKeyword = createWrapper({ searchKeyword: 'abc' })
    expect(wrapperWithKeyword.findAll('.icon-x')).toHaveLength(1)
  })

  it('emits update:searchKeyword with empty string when clear button is clicked', async () => {
    const wrapper = createWrapper({ searchKeyword: 'abc' })
    const clearBtn = wrapper.find('.icon-x')
    await clearBtn.trigger('click')
    expect(wrapper.emitted('update:searchKeyword')).toHaveLength(1)
    expect(wrapper.emitted('update:searchKeyword')![0]).toEqual([''])
  })

  it('shows check icon for done status files', () => {
    const files = [createFile({ status: 'done' })]
    const wrapper = createWrapper({ files })
    expect(wrapper.find('.icon-check').exists()).toBe(true)
  })

  it('shows alert icon for error status files', () => {
    const files = [createFile({ status: 'error' })]
    const wrapper = createWrapper({ files })
    expect(wrapper.find('.icon-alert').exists()).toBe(true)
  })

  it('shows no status icon for pending files', () => {
    const files = [createFile({ status: 'pending' })]
    const wrapper = createWrapper({ files })
    expect(wrapper.find('.icon-check').exists()).toBe(false)
    expect(wrapper.find('.icon-alert').exists()).toBe(false)
  })

  it('filters encrypted files correctly with pending-decrypt', () => {
    // FileList uses a simplified detectEncrypted: length > 20 && /^[A-Za-z0-9+/=]+$/.test()
    // Encrypted content is long base64 string; plain content has spaces/colons which fail the regex
    const files = [
      createFile({ name: 'enc.json', content: createEncryptedContent(), id: 'id-1', md5: 'm1' }),
      createFile({ name: 'plain.json', content: '{ "key": "value with spaces" }', id: 'id-2', md5: 'm2' }),
    ]
    const wrapper = createWrapper({ files, filter: 'pending-decrypt' })
    const fileItems = wrapper.findAll('.cursor-pointer.transition-all.border-b')
    expect(fileItems).toHaveLength(1)
    expect(fileItems[0].text()).toContain('enc.json')
  })

  it('filters plain files correctly with pending-encrypt', () => {
    const files = [
      createFile({ name: 'enc.json', content: createEncryptedContent(), id: 'id-1', md5: 'm1' }),
      createFile({ name: 'plain.json', content: '{ "key": "value with spaces" }', id: 'id-2', md5: 'm2' }),
    ]
    const wrapper = createWrapper({ files, filter: 'pending-encrypt' })
    const fileItems = wrapper.findAll('.cursor-pointer.transition-all.border-b')
    expect(fileItems).toHaveLength(1)
    expect(fileItems[0].text()).toContain('plain.json')
  })

  it('highlights active file in the filtered list', () => {
    const files = [
      createFile({ id: 'id-1', md5: 'm1', name: 'first.json' }),
      createFile({ id: 'id-2', md5: 'm2', name: 'second.json' }),
    ]
    const wrapper = createWrapper({ files, activeIndex: 0, filter: 'all' })
    const fileItems = wrapper.findAll('.cursor-pointer.transition-all.border-b')
    // UnoCSS dynamic classes are not processed in test env.
    // Verify by checking the :class binding output - active item has different class than inactive
    const activeClasses = fileItems[0].classes()
    const inactiveClasses = fileItems[1].classes()
    // Both items should have base classes
    expect(activeClasses).toContain('flex')
    expect(inactiveClasses).toContain('flex')
    // The :class binding should produce different class lists for active vs inactive
    // (active gets border-l-3 border-l-primary, inactive gets hover:bg-app-fill)
    const activeClassStr = activeClasses.join(' ')
    const inactiveClassStr = inactiveClasses.join(' ')
    expect(activeClassStr).not.toBe(inactiveClassStr)
  })

  it('displays file name text correctly', () => {
    const files = [createFile({ name: 'my-test-file.json' })]
    const wrapper = createWrapper({ files })
    expect(wrapper.text()).toContain('my-test-file.json')
  })
})
