<script lang="ts">
	import { scale_and_fade } from '$lib/utils'

	interface Props {
		message_type?: 'error' | 'email_already_exists'
	}

	let { message_type = 'error' }: Props = $props()

	const message_data = {
		error: [`Oops! Something went wrong.`, `Please try again later.`],
		email_already_exists: [
			`Looks like you might already be signed up!`,
			`Thanks for showing interest in my content though!`,
			`If you haven't signed up already <a class="link" href="mailto:derpemailsignup@scottspence.com">reach out</a> and let me know. 🙏`,
		],
	}

	let response_message = $derived(message_data[message_type])
</script>

<div
	in:scale_and_fade|global={{ delay: 400, duration: 400 }}
	class="mx-auto max-w-7xl text-center lg:px-8"
>
	<div
		class="rounded-box bg-primary py-10 lg:flex lg:items-center lg:p-14"
	>
		<div class="text-primary-content lg:w-0 lg:flex-1">
			<h3
				class="text-primary-content text-4xl font-extrabold tracking-tight"
			>
				{response_message[0]}
			</h3>
			<p class="mt-4 text-xl">
				{response_message[1]}
			</p>
			{#if response_message[2]}
				<p class="mt-4 text-xl">
					{@html response_message[2]}
				</p>
			{/if}
		</div>
	</div>
</div>
