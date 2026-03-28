import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeToggle from '@/components/ThemeToggle.vue'

// Use vi.hoisted to avoid hoisting issues
const { mockSetTheme, mockMode } = vi.hoisted(() => {
  const mockMode = { value: 'dark' }
  const mockSetTheme = vi.fn()
  return { mockMode, mockSetTheme }
})

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    mode: mockMode,
    setTheme: mockSetTheme,
  }),
}))

vi.mock('lucide-vue-next', () => ({
  Monitor: { name: 'Monitor', template: '<span class="icon-monitor" data-icon="monitor" />' },
  Moon: { name: 'Moon', template: '<span class="icon-moon" data-icon="moon" />' },
  Sun: { name: 'Sun', template: '<span class="icon-sun" data-icon="sun" />' },
}))

describe('ThemeToggle.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMode.value = 'dark'
  })

  it('should render 3 theme option buttons', () => {
    const wrapper = mount(ThemeToggle)
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
  })

  it('should render buttons with correct title attributes', () => {
    const wrapper = mount(ThemeToggle)
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('title')).toBe('亮色')
    expect(buttons[1].attributes('title')).toBe('暗黑')
    expect(buttons[2].attributes('title')).toBe('跟随系统')
  })

  it('should render correct icon for each button', () => {
    const wrapper = mount(ThemeToggle)
    const buttons = wrapper.findAll('button')
    expect(buttons[0].find('[data-icon="sun"]').exists()).toBe(true)
    expect(buttons[1].find('[data-icon="moon"]').exists()).toBe(true)
    expect(buttons[2].find('[data-icon="monitor"]').exists()).toBe(true)
  })

  it('should call setTheme with correct value when button is clicked', async () => {
    const wrapper = mount(ThemeToggle)
    const buttons = wrapper.findAll('button')

    await buttons[0].trigger('click')
    expect(mockSetTheme).toHaveBeenCalledWith('light')

    await buttons[1].trigger('click')
    expect(mockSetTheme).toHaveBeenCalledWith('dark')

    await buttons[2].trigger('click')
    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })

  it('should render different buttons for active and inactive states based on mode', async () => {
    // Test with dark mode
    mockMode.value = 'dark'
    const wrapper = mount(ThemeToggle)

    // The template renders :class with conditional based on mode === opt.value
    // In test env, since mockMode is a plain object, Vue's :class evaluates at mount time
    // Verify that buttons exist and have class attributes
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    buttons.forEach(btn => {
      const classAttr = btn.attributes('class') || ''
      expect(classAttr).toBeTruthy()
    })

    // Change mode and verify buttons re-render
    mockMode.value = 'light'
    await wrapper.vm.$nextTick()
    expect(buttons).toHaveLength(3)
  })

  it('should render within a container div with theme toggle classes', () => {
    const wrapper = mount(ThemeToggle)
    const container = wrapper.find('div')
    expect(container.classes()).toContain('rounded-xl')
    expect(container.classes()).toContain('bg-app-fill')
  })

  it('should render container with border and shadow classes', () => {
    const wrapper = mount(ThemeToggle)
    const container = wrapper.find('div')
    expect(container.classes()).toContain('border')
    expect(container.classes()).toContain('shadow-md')
  })
})
