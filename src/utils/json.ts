export function formatJson(data: string): string {
  const parsed = JSON.parse(data)
  return JSON.stringify(parsed, null, 2)
}

export function compressJson(data: string): string {
  const parsed = JSON.parse(data)
  return JSON.stringify(parsed)
}

export function isValidJson(data: string): boolean {
  if (!data.trim()) return false
  try {
    JSON.parse(data)
    return true
  } catch {
    return false
  }
}
