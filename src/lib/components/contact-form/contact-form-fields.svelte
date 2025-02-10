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
		<div class="form-control w-full">
			<label class="label" for="name">
				<span class="label-text text-sm text-primary-content">Name</span>
			</label>
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
		<div class="form-control w-full">
			<label class="label" for="email">
				<span class="label-text text-sm text-primary-content">Email</span>
			</label>
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
		<!-- honeypot -->
		<input type="text" name="subject" id="subject" class="hidden" />
		<div class="form-control w-full">
			<label class="label" for="reason">
				<span class="label-text text-sm text-primary-content">Reason</span>
			</label>
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
		<div class="form-control w-full">
			<label class="label" for="message">
				<span class="label-text text-sm text-primary-content">Message</span>
			</label>
			<textarea
				id="message"
				name="message"
				aria-label="message"
				placeholder="Hey! I'd love to talk about..."
				required
				class="textarea textarea-bordered focus:textarea-secondary mb-6 w-full text-lg"
			></textarea>
		</div>
		<div class="flex justify-center">
			<button type="submit" class="btn btn-secondary w-full max-w-lg p-6">
				Submit
			</button>
		</div>
	</form>
</div>
