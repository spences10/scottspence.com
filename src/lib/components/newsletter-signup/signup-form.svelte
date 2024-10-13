<script lang="ts">
	import { enhance } from '$app/forms'
	import { newsletter_subscriber_count_store } from '$lib/stores'
	import * as Fathom from 'fathom-client'
	import { button_disabled } from './index'

	interface Props {
		email: string
		handle_result: Function
	}

	let { email = $bindable(), handle_result }: Props = $props()
</script>

<div class="mx-auto max-w-7xl text-primary-content lg:px-8">
	<div
		class="rounded-box bg-primary px-4 py-10 lg:flex lg:items-center lg:p-14"
	>
		<div class="text-lg lg:w-0 lg:flex-1">
			<h3 class="text-3xl font-extrabold tracking-tight">
				Sign up for the newsletter
			</h3>
			<p class="mt-4 max-w-3xl">
				Want to keep up to date with what I'm working on?
			</p>
			<p class="mt-1 max-w-3xl">
				Join {$newsletter_subscriber_count_store} other developers and
				sign up for the newsletter.
			</p>
		</div>
		<div class="mt-4 w-full max-w-md lg:ml-8 lg:mt-0 lg:flex-1">
			<div class="form-control">
				<form
					method="POST"
					action="/api/submit-email"
					use:enhance={() => {
						$button_disabled = true
						return ({ update, result }) => {
							handle_result(result)
							update({ reset: true })
						}
					}}
				>
					<label for="email" class="label">
						<span class="label-text sr-only">Your Email</span>
					</label>
					<div
						class="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0"
					>
						<input
							class="input input-bordered input-primary w-full text-primary"
							id="email"
							aria-label="email"
							type="email"
							name="email"
							autocomplete="email"
							placeholder="ada@lovelace.com"
							required
							bind:value={email}
							disabled={$button_disabled}
						/>
						<input
							type="submit"
							class={$button_disabled
								? 'loading loading-spinner text-secondary'
								: 'btn btn-secondary'}
							onclick={() => {
								Fathom.trackEvent('newsletter signup click')
							}}
							value="sign me up!"
							disabled={$button_disabled}
						/>
					</div>
				</form>
			</div>
			<p class="mt-3 text-sm">
				I care about the protection of your data. Read the
				<a href="/privacy-policy" class="link">Privacy Policy</a>
				for more info.
			</p>
		</div>
	</div>
</div>
