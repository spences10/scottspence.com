import { writable } from 'svelte/store'

export const mouse_position = writable({ x: 0, y: 0 })

export const handle_mouse_move = (event: {
	clientX: number
	clientY: number
}) => {
	mouse_position.update(_ => ({
		x: event.clientX + 10,
		y: event.clientY + 10,
	}))
}
