<script lang="ts">
	import { enhance } from '$app/forms'

	interface Props {
		handle_result: Function
	}

	let { handle_result }: Props = $props()
</script>

<div
	class="not-prose bg-primary my-5 items-center justify-center rounded-lg p-10 shadow-lg"
>
	<form
		method="POST"
		action="/contact"
		use:enhance={() => {
			return ({ update, result }) => {
				handle_result(result)
				update({ reset: true })
			}
		}}
		class="mx-auto w-full max-w-md space-y-4 px-5"
	>
		<fieldset class="w-full">
			<label
				class="label-text text-primary-content text-sm"
				for="name">Name</label
			>
			<div class="validator validator-required">
				<input
					type="text"
					id="name"
					name="name"
					aria-label="name"
					placeholder="Name"
					required
					class="input input-bordered focus:input-secondary w-full text-lg"
				/>
			</div>
		</fieldset>
		<fieldset class="w-full">
			<label
				class="label-text text-primary-content text-sm"
				for="email">Email</label
			>
			<div class="validator validator-email validator-required">
				<input
					type="email"
					id="email"
					name="email"
					aria-label="email"
					placeholder="Email"
					required
					class="input input-bordered focus:input-secondary w-full text-lg"
				/>
			</div>
		</fieldset>
		<!-- honeypot -->
		<input type="text" name="subject" id="subject" class="hidden" />
		<fieldset class="w-full">
			<label
				class="label-text text-primary-content text-sm"
				for="reason">Reason</label
			>
			<div class="validator validator-required">
				<select
					id="reason"
					name="reason"
					aria-label="reason"
					required
					class="select select-bordered focus:select-secondary w-full text-lg"
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
				class="label-text text-primary-content text-sm"
				for="message">Message</label
			>
			<div class="validator validator-required">
				<textarea
					id="message"
					name="message"
					aria-label="message"
					placeholder="Hey! I'd love to talk about..."
					required
					class="textarea textarea-bordered focus:textarea-secondary mb-6 w-full text-lg"
				></textarea>
			</div>
		</fieldset>
		<div class="flex justify-center">
			<button
				type="submit"
				class="btn btn-secondary w-full max-w-lg p-6"
			>
				Submit
			</button>
		</div>
	</form>
</div>
