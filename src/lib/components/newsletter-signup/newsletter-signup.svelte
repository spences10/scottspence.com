<script lang="ts">
  import { scale_and_fade } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import FailureMessage from './failure-message.svelte'
  import { button_disabled } from './index'
  import SignupForm from './signup-form.svelte'
  import SuccessMessage from './success-message.svelte'

  let email = ''
  let success = false
  let message_type: 'error' | 'email_already_exists' = 'error'
  let action_result: ActionResult

  const handle_result = (result: ActionResult) => {
    action_result = result
    $button_disabled = true
    if (result.type === 'success') {
      success = true
    } else if (result.type === 'failure') {
      $button_disabled = true
      if (result?.data?.body?.code === 'email_already_exists') {
        message_type = result?.data?.body?.code
      } else {
        message_type = 'error'
      }
      setTimeout(() => {
        $button_disabled = false
      }, result?.data?.time_remaining * 1000)
    }
  }
</script>

<div
  class="m-0 -mx-30 mb-56 xs:mb-36 sm:mb-0 max-h-96 lg:-mx-40 not-prose"
>
  {#if success}
    <div in:scale_and_fade|global={{ delay: 400, duration: 400 }}>
      <SuccessMessage />
    </div>
  {:else if action_result?.type === 'failure'}
    <div in:scale_and_fade|global={{ delay: 400, duration: 400 }}>
      <FailureMessage {message_type} />
    </div>
  {:else}
    <div out:scale_and_fade|global={{ delay: 200, duration: 400 }}>
      <SignupForm {email} {handle_result} />
    </div>
  {/if}
</div>
