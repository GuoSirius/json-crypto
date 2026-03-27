import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { JsonFile } from '@/types'

// Use vi.hoisted to avoid hoisting issues with vi.mock factory
const { mockSaveAs, mockZipFile, mockGenerateAsync, mockFolder, MockJSZip } = vi.hoisted(() => ({
  mockSaveAs: vi.fn(),
  mockZipFile: vi.fn(),
  mockGenerateAsync: vi.fn(),
  mockFolder: vi.fn(() => ({
    file: vi.fn(),
  })),
  MockJSZip: vi.fn(() => ({
    file: mockZipFile,
    generateAsync: mockGenerateAsync,
    folder: mockFolder,
  })),
}))

vi.mock('file-saver', () => ({
  saveAs: mockSaveAs,
}))

vi.mock('jszip', () => ({
  default: MockJSZip,
}))

import { downloadFile, downloadAsZip } from '@/utils/download'

describe('download', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('downloadFile', () => {
    it('should create a Blob with correct content and type', () => {
      downloadFile('{"key":"value"}', 'test.json')
      expect(mockSaveAs).toHaveBeenCalledOnce()
      const blob = mockSaveAs.mock.calls[0][0] as Blob
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/json;charset=utf-8')
    })

    it('should call saveAs with correct filename', () => {
      downloadFile('content', 'output.json')
      expect(mockSaveAs).toHaveBeenCalledOnce()
      expect(mockSaveAs.mock.calls[0][1]).toBe('output.json')
    })

    it('should handle empty content', () => {
      downloadFile('', 'empty.json')
      expect(mockSaveAs).toHaveBeenCalledOnce()
      const blob = mockSaveAs.mock.calls[0][0] as Blob
      expect(blob).toBeInstanceOf(Blob)
    })

    it('should handle Unicode content', () => {
      const content = '{"name":"你好世界","emoji":"🎉"}'
      downloadFile(content, 'unicode.json')
      expect(mockSaveAs).toHaveBeenCalledOnce()
      const blob = mockSaveAs.mock.calls[0][0] as Blob
      expect(blob).toBeInstanceOf(Blob)
    })
  })

  describe('downloadAsZip', () => {
    it('should create JSZip instance for each call', async () => {
      mockGenerateAsync.mockResolvedValue(new Blob())
      const files: JsonFile[] = [
        { id: '1', name: 'a.json', content: '{}', md5: 'm1', processed: '{"a":1}', status: 'done' },
      ]
      const sourceContents = ['{}']
      await downloadAsZip(files, sourceContents)
      expect(MockJSZip).toHaveBeenCalledOnce()
    })

    it('should add each file to zip with correct name suffix in processed mode', async () => {
      mockGenerateAsync.mockResolvedValue(new Blob())
      const files: JsonFile[] = [
        { id: '1', name: 'data.json', content: '{"original":1}', md5: 'm1', processed: '{"a":1}', status: 'done' },
        { id: '2', name: 'config.json', content: '{"original":2}', md5: 'm2', processed: '{"b":2}', status: 'done' },
      ]
      const sourceContents = ['{"original":1}', '{"original":2}']
      await downloadAsZip(files, sourceContents, 'processed', '_encrypt')
      expect(mockZipFile).toHaveBeenCalledTimes(2)
      expect(mockZipFile).toHaveBeenCalledWith('data_encrypt.json', '{"a":1}')
      expect(mockZipFile).toHaveBeenCalledWith('config_encrypt.json', '{"b":2}')
    })

    it('should use sourceContents in original mode', async () => {
      mockGenerateAsync.mockResolvedValue(new Blob())
      const files: JsonFile[] = [
        { id: '1', name: 'data.json', content: '{"original":1}', md5: 'm1', processed: '{"a":1}', status: 'done' },
      ]
      const sourceContents = ['{"modified":1}']
      await downloadAsZip(files, sourceContents, 'original')
      expect(mockZipFile).toHaveBeenCalledTimes(1)
      expect(mockZipFile).toHaveBeenCalledWith('data.json', '{"modified":1}')
    })

    it('should fallback to file.content when sourceContents is empty', async () => {
      mockGenerateAsync.mockResolvedValue(new Blob())
      const files: JsonFile[] = [
        { id: '1', name: 'data.json', content: '{"fallback":1}', md5: 'm1', processed: '{"a":1}', status: 'done' },
      ]
      const sourceContents = ['']
      await downloadAsZip(files, sourceContents, 'original')
      expect(mockZipFile).toHaveBeenCalledTimes(1)
      expect(mockZipFile).toHaveBeenCalledWith('data.json', '{"fallback":1}')
    })

    it('should create folders in both mode', async () => {
      mockGenerateAsync.mockResolvedValue(new Blob())
      const files: JsonFile[] = [
        { id: '1', name: 'data.json', content: '{"original":1}', md5: 'm1', processed: '{"a":1}', status: 'done' },
      ]
      const sourceContents = ['{"modified":1}']
      await downloadAsZip(files, sourceContents, 'both', '_encrypt')
      expect(mockFolder).toHaveBeenCalledTimes(2)
      expect(mockFolder).toHaveBeenCalledWith('original')
      expect(mockFolder).toHaveBeenCalledWith('processed')
    })

    it('should use default suffix "_processed" when not specified in processed mode', async () => {
      mockGenerateAsync.mockResolvedValue(new Blob())
      const files: JsonFile[] = [
        { id: '1', name: 'test.json', content: '{}', md5: 'm1', processed: '{}', status: 'done' },
      ]
      const sourceContents = ['{}']
      await downloadAsZip(files, sourceContents, 'processed')
      expect(mockZipFile).toHaveBeenCalledWith('test_processed.json', '{}')
    })

    it('should generate zip blob and call saveAs with zip filename', async () => {
      const zipBlob = new Blob(['zip-data'], { type: 'application/zip' })
      mockGenerateAsync.mockResolvedValue(zipBlob)
      const files: JsonFile[] = [
        { id: '1', name: 'a.json', content: '{}', md5: 'm1', processed: '{}', status: 'done' },
      ]
      const sourceContents = ['{}']
      await downloadAsZip(files, sourceContents)
      expect(mockGenerateAsync).toHaveBeenCalledWith({ type: 'blob' })
      expect(mockSaveAs).toHaveBeenCalledWith(zipBlob, 'json-crypto-output.zip')
    })

    it('should handle empty files array without error', async () => {
      mockGenerateAsync.mockResolvedValue(new Blob())
      await downloadAsZip([], [])
      expect(MockJSZip).toHaveBeenCalledOnce()
      expect(mockZipFile).not.toHaveBeenCalled()
      expect(mockGenerateAsync).toHaveBeenCalledOnce()
      expect(mockSaveAs).toHaveBeenCalledOnce()
    })

    it('should handle filename without .json extension', async () => {
      mockGenerateAsync.mockResolvedValue(new Blob())
      const files: JsonFile[] = [
        { id: '1', name: 'data', content: '{}', md5: 'm1', processed: '{}', status: 'done' },
      ]
      const sourceContents = ['{}']
      await downloadAsZip(files, sourceContents, 'processed', '_enc')
      expect(mockZipFile).toHaveBeenCalledWith('data_enc.json', '{}')
    })

    it('should default to processed mode when mode is not specified', async () => {
      mockGenerateAsync.mockResolvedValue(new Blob())
      const files: JsonFile[] = [
        { id: '1', name: 'data.json', content: '{"original":1}', md5: 'm1', processed: '{"a":1}', status: 'done' },
      ]
      const sourceContents = ['{"modified":1}']
      await downloadAsZip(files, sourceContents)
      expect(mockZipFile).toHaveBeenCalledTimes(1)
      expect(mockZipFile).toHaveBeenCalledWith('data_processed.json', '{"a":1}')
    })
  })
})
