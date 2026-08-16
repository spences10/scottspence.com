<script lang="ts">
	import type { ActionResult } from '$app/forms';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$app/env/public';
	import { Turnstile } from 'svelte-turnstile';
	import { submit_contact } from '../../../routes/contact/contact.remote';

	interface Props {
		handle_result: Function;
	}

	let { handle_result }: Props = $props();

	let is_submitting = $state(false);
	let error_message = $state<string | null>(null);
	let turnstile_token = $state<string>('');

	async function handle_submit(e: SubmitEvent) {
		e.preventDefault();
		is_submitting = true;
		error_message = null;

		try {
			if (!turnstile_token) {
				error_message = 'Please complete the verification';
				return;
			}

			const form_data = new FormData(e.target as HTMLFormElement);
			const data = {
				name: form_data.get('name') as string,
				email: form_data.get('email') as string,
				reason: form_data.get('reason') as string,
				message: form_data.get('message') as string,
				subject: form_data.get('subject') as string,
				turnstile_token,
			};

			console.log('Submitting contact form with data:', data);
			await submit_contact(data);
			console.log('Remote function succeeded');

			const result: ActionResult = {
				type: 'success',
				status: 200,
				data: { message: 'Email sent successfully' },
			};
			handle_result(result);
			(e.target as HTMLFormElement).reset();
		} catch (error: unknown) {
			const error_msg =
				error instanceof Error ? error.message : 'An error occurred';
			error_message = error_msg;
			const result: ActionResult = {
				type: 'failure',
				status: 400,
				data: { error: error_msg },
			};
			handle_result(result);
		} finally {
			is_submitting = false;
		}
	}
</script>

<div
	class="not-prose my-5 items-center justify-center rounded-box bg-primary p-10 shadow-lg"
>
	<form
		onsubmit={handle_submit}
		class="mx-auto w-full max-w-md space-y-4 px-5"
	>
		<fieldset class="w-full">
			<label
				class="label-text text-sm text-primary-content"
				for="name">Name</label
			>
			<div class="validator-required validator">
				<input
					type="text"
					id="name"
					name="name"
					aria-label="name"
					placeholder="Name"
					required
					class="input-bordered input w-full text-lg focus:input-secondary"
				/>
			</div>
		</fieldset>
		<fieldset class="w-full">
			<label
				class="label-text text-sm text-primary-content"
				for="email">Email</label
			>

			<div class="validator-email validator-required validator">
				<input
					type="email"
					id="email"
					name="email"
					aria-label="email"
					placeholder="Email"
					required
					class="input-bordered input w-full text-lg focus:input-secondary"
				/>
			</div>
		</fieldset>
		<!-- honeypot -->
		<input type="text" name="subject" id="subject" class="hidden" />
		<fieldset class="w-full">
			<label
				class="label-text text-sm text-primary-content"
				for="reason">Reason</label
			>
			<div class="validator-required validator">
				<select
					id="reason"
					name="reason"
					aria-label="reason"
					required
					class="select-bordered select w-full text-lg focus:select-secondary"
				>
					<option disabled selected value="">Contact reason</option>
					<option value="hi">Say hi!</option>
					<option value="collaboration">Collaboration request</option>
					<option value="speak">Speaking opportunity</option>
				</select>
			</div>
		</fieldset>
		<fieldset class="w-full">
			<label
				class="label-text text-sm text-primary-content"
				for="message">Message</label
			>
			<div class="validator-required validator">
				<textarea
					id="message"
					name="message"
					aria-label="message"
					placeholder="Hey! I'd love to talk about..."
					required
					class="textarea-bordered textarea mb-6 w-full text-lg focus:textarea-secondary"
				></textarea>
			</div>
		</fieldset>
		<div class="flex justify-center">
			<Turnstile
				size="flexible"
				theme="auto"
				siteKey={PUBLIC_TURNSTILE_SITE_KEY}
				on:turnstile-callback={(e) => {
					turnstile_token = e.detail.token;
				}}
			/>
		</div>
		{#if error_message}
			<div class="alert alert-error">
				<span>{error_message}</span>
			</div>
		{/if}
		<div class="flex justify-center">
			<button
				type="submit"
				disabled={is_submitting || !turnstile_token}
				class="btn w-full max-w-lg p-6 btn-secondary"
			>
				{#if is_submitting}
					<span class="loading loading-spinner"></span>
					Sending...
				{:else}
					Submit
				{/if}
			</button>
		</div>
	</form>
</div>
