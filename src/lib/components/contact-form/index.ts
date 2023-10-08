import { writable } from 'svelte/store'

export { default as ContactForm } from './contact-form.svelte'

export const button_disabled = writable(false)
