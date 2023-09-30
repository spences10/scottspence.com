<script lang="ts">
  import { enhance } from '$app/forms'
  import { scale_and_fade } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import * as Fathom from 'fathom-client'
  import { writable } from 'svelte/store'

  let email = ''
  let success = false
  let responseMessage: string[] = []

  let button_disabled = writable(false)
  let action_result: ActionResult

  const handle_result = (result: ActionResult) => {
    action_result = result
    if (result.type === 'success') {
      success = true
      responseMessage = [
        `Awesome! 🥳`,
        `Thanks for showing interest in my content.`,
        `Please check your email to confirm your subscription. 📨`,
      ]
    } else if (result.type === 'failure') {
      $button_disabled = true
      if (result?.data?.body?.code === 'email_already_exists') {
        responseMessage = [
          `Looks like you might already be signed up!`,
          `Thanks for showing interest in my content though!`,
          `If you haven't signed up already <a class="link" href="mailto:derpemailsignup@scottspence.com">reach out</a> and let me know. 🙏`,
        ]
      } else {
        responseMessage = [
          `Oops! Something went wrong.`,
          `Please try again later.`,
        ]
      }
      setTimeout(() => {
        $button_disabled = false
      }, result?.data?.time_remaining * 1000)
    }
  }
</script>

<div class="m-0 -mx-30 mb-10 max-h-96 lg:-mx-40">
  {#if success}
    <div
      in:scale_and_fade|global={{ delay: 400, duration: 400 }}
      class="mx-auto text-center max-w-7xl py-12 lg:py-16 lg:px-8"
    >
      <div
        class="bg-primary rounded-box py-10 lg:flex lg:p-20 lg:items-center"
      >
        <div class="text-primary-content lg:flex-1 lg:w-0">
          <h3 class=" font-extrabold tracking-tight text-3xl">
            {responseMessage[0]}
          </h3>
          <p class="mt-4 text-lg">
            {responseMessage[1]}
          </p>
          <p class="mt-4 text-lg">
            {@html responseMessage[2]}
          </p>
        </div>
      </div>
    </div>
  {:else if action_result?.type === 'failure'}
    <div class="mx-auto text-center max-w-7xl py-12 lg:py-16 lg:px-8">
      <div
        class="bg-primary rounded-box py-10 lg:flex lg:p-20 lg:items-center"
      >
        <div class="text-primary-content lg:flex-1 lg:w-0">
          <h3 class=" font-extrabold tracking-tight text-3xl">
            {responseMessage[0]}
          </h3>
          <p class="mt-4 text-lg">
            {responseMessage[1]}
          </p>
          {#if responseMessage[2]}
            <p class="mt-4 text-lg">
              {@html responseMessage[2]}
            </p>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div
      out:scale_and_fade|global={{ delay: 200, duration: 400 }}
      class="mx-auto text-primary-content max-w-7xl py-12 lg:py-16 lg:px-8"
    >
      <div
        class="bg-primary rounded-box py-10 px-4 lg:flex lg:p-20 lg:items-center"
      >
        <div class="lg:flex-1 lg:w-0">
          <h3 class="font-extrabold tracking-tight text-3xl">
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
              class=""
              action="/submit-email"
              use:enhance={() => {
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
                />
                <input
                  type="submit"
                  class="btn btn-secondary"
                  on:click={() => {
                    Fathom.trackGoal(`ZWGL5VLX`, 0)
                  }}
                  value="sign me up!"
                  disabled={$button_disabled}
                />
              </div>
            </form>
          </div>
          <p class="mt-3 text-sm">
            I care about the protection of your data. Read the
            <a
              href="/privacy-policy"
              class="link text-primary-content"
            >
              Privacy Policy
            </a>
            for more info.
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>

<br />
