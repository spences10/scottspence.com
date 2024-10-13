<script lang="ts">
	import { scale_and_fade } from '$lib/utils'
	import type { ActionResult } from '@sveltejs/kit'
	import ContactFormFailure from './contact-form-failure.svelte'
	import ContactFormFields from './contact-form-fields.svelte'
	import ContactFormSuccess from './contact-form-success.svelte'
	import { button_disabled } from './index'

	let success = $state(false)
	let action_result: ActionResult | undefined = $state()
	let message_type: 'error' | 'success' = 'error'

	const handle_result = (result: ActionResult) => {
		action_result = result
		$button_disabled = true
		if (result.type === 'success') {
			success = true
		} else if (result.type === 'failure') {
			$button_disabled = true
			message_type = 'error'
			setTimeout(() => {
				$button_disabled = false
			}, result?.data?.time_remaining * 1000)
		}
	}
</script>

{#if success}
	<div in:scale_and_fade|global={{ delay: 400, duration: 400 }}>
		<ContactFormSuccess />
	</div>
{:else if action_result?.type === 'failure'}
	<div in:scale_and_fade|global={{ delay: 400, duration: 400 }}>
		<ContactFormFailure />
	</div>
{:else}
	<div out:scale_and_fade|global={{ delay: 200, duration: 400 }}>
		<ContactFormFields {handle_result} />
	</div>
{/if}
