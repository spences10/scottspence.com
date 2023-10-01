<script lang="ts">
  import { enhance } from '$app/forms'
  import * as Fathom from 'fathom-client'
  import { button_disabled } from './index'

  export let email: string
  export let handle_result: Function
</script>

<div
  class="mx-auto text-primary-content max-w-7xl py-12 lg:py-16 lg:px-8"
>
  <div
    class="bg-primary rounded-box py-10 px-4 lg:flex lg:p-20 lg:items-center"
  >
    <div class="lg:flex-1 lg:w-0">
      <h3
        class="font-extrabold tracking-tight text-3xl text-primary-content"
      >
        Sign up for the newsletter
      </h3>
      <p class="mt-4 text-lg max-w-3xl">
        Want to keep up to date with what I'm working on?
      </p>
    </div>
    <div class="max-w-md mt-12 w-full lg:flex-1 lg:mt-0 lg:ml-8">
      <div class="form-control">
        <form
          method="POST"
          action="/submit-email"
          use:enhance={() => {
            $button_disabled = true
            return ({ update, result }) => {
              handle_result(result)
              update({ reset: true })
            }
          }}
        >
          <label for="email" class="label">
            <span class="sr-only label-text">Your Email</span>
          </label>
          <div
            class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2"
          >
            <input
              class="text-primary w-full input input-primary input-bordered"
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
              on:click={() => {
                Fathom.trackGoal('ZWGL5VLX', 0)
              }}
              value="sign me up!"
              disabled={$button_disabled}
            />
          </div>
        </form>
      </div>
      <p class="mt-3 text-sm">
        I care about the protection of your data. Read the
        <a href="/privacy-policy" class="link text-primary-content">
          Privacy Policy
        </a>
        for more info.
      </p>
    </div>
  </div>
</div>
