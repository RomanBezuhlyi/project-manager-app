export function formatDate(dateStr: string): string {
	if (!dateStr) return ''
	const d = new Date(dateStr)
	const pad = (n: number) => n.toString().padStart(2, '0')
	return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}
