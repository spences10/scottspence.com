<script lang="ts">
  import { scale_and_fade } from '$lib/utils'

  export let message_type: 'error' | 'email_already_exists' = 'error'

  const message_data = {
    error: [`Oops! Something went wrong.`, `Please try again later.`],
    email_already_exists: [
      `Looks like you might already be signed up!`,
      `Thanks for showing interest in my content though!`,
      `If you haven't signed up already <a class="link" href="mailto:derpemailsignup@scottspence.com">reach out</a> and let me know. 🙏`,
    ],
  }

  let response_message = message_data[message_type]
</script>

<div
  in:scale_and_fade|global={{ delay: 400, duration: 400 }}
  class="mx-auto text-center max-w-7xl py-12 lg:py-16 lg:px-8"
>
  <div
    class="bg-primary rounded-box py-10 lg:flex lg:p-20 lg:items-center"
  >
    <div class="text-primary-content lg:flex-1 lg:w-0">
      <h3
        class="font-extrabold tracking-tight text-3xl text-primary-content"
      >
        {response_message[0]}
      </h3>
      <p class="mt-4 text-lg">
        {response_message[1]}
      </p>
      {#if response_message[2]}
        <p class="mt-4 text-lg prose-a:link-accent">
          {@html response_message[2]}
        </p>
      {/if}
    </div>
  </div>
</div>
