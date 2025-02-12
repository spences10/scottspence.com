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
    <!-- Content section -->
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
    <!-- Form section - fixed margin -->
    <div class="mt-4 w-full lg:ml-8 lg:mt-0 lg:max-w-md lg:flex-1">
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
				<fieldset>
					<label class="label-text sr-only" for="email">
						Your Email
					</label>
					<div
						class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2"
					>
						<div class="form-control flex-1">
							<!-- Added form-control and flex-1 -->
							<div class="validator validator-email w-full">
								<!-- Added w-full -->
								<input
									class="input input-bordered input-primary text-primary w-full"
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
							</div>
						</div>
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
				</fieldset>
			</form>
			<p class="mt-3 text-sm">
				I care about the protection of your data. Read the
				<a href="/privacy-policy" class="link">Privacy Policy</a>
				for more info.
			</p>
		</div>
	</div>
</div>
