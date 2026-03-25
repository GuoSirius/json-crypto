import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { JsonFile } from '../types'

export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  saveAs(blob, filename)
}

export async function downloadAsZip(files: JsonFile[], suffix = '_processed') {
  const zip = new JSZip()
  for (const file of files) {
    // 使用传入的 suffix（加解密类型）作为文件名后缀
    const name = file.name.replace(/\.json$/i, '') + suffix + '.json'
    zip.file(name, file.processed)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'json-crypto-output.zip')
}
