export const validateUrl = (
  value: unknown,
  options?: { allowInternal?: boolean; allowModal?: boolean },
) => {
  if (!value) return true
  if (typeof value !== 'string') return 'Please enter a valid URL or path'

  if (options?.allowInternal && value.startsWith('/')) return true
  if (options?.allowModal && value.startsWith('#')) return true

  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      new URL(value)
      return true
    } catch {
      return 'Invalid URL format. Example: https://example.com'
    }
  }

  const parts = []
  if (options?.allowInternal) parts.push('/ (internal)')
  if (options?.allowModal) parts.push('# (modal)')
  parts.push('https:// (external)')

  return `Links must start with ${parts.join(', ')}`
}
