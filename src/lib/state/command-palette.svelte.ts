class CommandPaletteState {
	is_open = $state(false)
	query = $state('')
	recent = $state<string[]>([])

	open() {
		this.is_open = true
		this.query = ''
	}

	close() {
		this.is_open = false
		this.query = ''
	}

	toggle() {
		if (this.is_open) {
			this.close()
		} else {
			this.open()
		}
	}

	add_recent(href: string) {
		// Remove if already exists, add to front, keep max 5
		this.recent = [
			href,
			...this.recent.filter((r) => r !== href),
		].slice(0, 5)
	}
}

export const command_palette_state = new CommandPaletteState()
