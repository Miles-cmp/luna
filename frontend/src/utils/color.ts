export function textOnColor(hex: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return '#ffffff'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#1a1a2e' : '#ffffff'
}
