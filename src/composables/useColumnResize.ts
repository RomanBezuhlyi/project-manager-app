export function useColumnResize() {
	function enableResize(th: HTMLElement) {
		const handle = document.createElement('span')
		handle.className = 'col-resize-handle'
		handle.setAttribute('aria-hidden', 'true')

		Object.assign(th.style, { position: 'relative' })
		Object.assign(handle.style, {
			position: 'absolute',
			right: '0',
			top: '0',
			width: '6px',
			height: '100%',
			cursor: 'col-resize',
			userSelect: 'none',
		})

		th.appendChild(handle)

		let startX = 0
		let startW = 0

		const onMouseDown = (e: MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()
			startX = e.clientX
			startW = th.offsetWidth

			const onMove = (ev: MouseEvent) => {
				const delta = ev.clientX - startX
				th.style.width = Math.max(80, startW + delta) + 'px'
			}

			const onUp = () => {
				window.removeEventListener('mousemove', onMove)
				window.removeEventListener('mouseup', onUp)
			}

			window.addEventListener('mousemove', onMove)
			window.addEventListener('mouseup', onUp)
		}

		handle.addEventListener('mousedown', onMouseDown)
	}

	function init(tableEl: HTMLTableElement | null) {
		if (!tableEl) return
		tableEl
			.querySelectorAll<HTMLTableCellElement>('thead th')
			.forEach(enableResize)
	}

	return { init }
}
