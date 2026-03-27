import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { JsonFile, DownloadMode } from '../types'

export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  saveAs(blob, filename)
}

export async function downloadAsZip(
  files: JsonFile[],
  sourceContents: string[],
  mode: DownloadMode = 'processed',
  suffix = '_processed'
) {
  const zip = new JSZip()

  if (mode === 'both') {
    const originalFolder = zip.folder('original')
    const processedFolder = zip.folder('processed')
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const originalName = file.name
      const processedName = file.name.replace(/\.json$/i, '') + suffix + '.json'
      originalFolder?.file(originalName, sourceContents[i] || file.content)
      processedFolder?.file(processedName, file.processed)
    }
  } else {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const content = mode === 'original'
        ? (sourceContents[i] || file.content)
        : file.processed
      const name = mode === 'original'
        ? file.name
        : file.name.replace(/\.json$/i, '') + suffix + '.json'
      zip.file(name, content)
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'json-crypto-output.zip')
}
