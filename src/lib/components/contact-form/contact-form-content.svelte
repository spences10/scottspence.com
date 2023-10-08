<script lang="ts">
  import { enhance } from '$app/forms'

  export let name = ''
  export let email = ''
  export let reason = ''
  export let message = ''

  export let handle_result: Function
</script>

<div
  class="not-prose justify-center items-center py-14 my-5 bg-primary shadow-xl rounded-box"
>
  <form
    method="POST"
    action="/contact"
    enctype="multipart/form-data"
    use:enhance={() => {
      return ({ update, result }) => {
        handle_result(result)
        update({ reset: true })
      }
    }}
    class="w-full max-w-md mx-auto space-y-2 px-5"
  >
    <div class="space-y-2">
      <label class="label pb-0" for="name">
        <span class="label-text text-primary-content">Name</span>
      </label>
      <input
        type="text"
        id="name"
        name="name"
        bind:value={name}
        aria-label="name"
        placeholder="Name"
        required
        class="input w-full shadow-xl text-lg active:input-secondary focus:input-secondary"
      />
    </div>
    <div class="space-y-2">
      <label class="label pb-0" for="email">
        <span class="label-text text-primary-content">Email</span>
      </label>
      <input
        type="email"
        id="email"
        name="email"
        bind:value={email}
        aria-label="email"
        placeholder="Email"
        required
        class="input w-full shadow-xl text-lg active:input-secondary focus:input-secondary"
      />
    </div>
    <div class="space-y-2">
      <label class="label pb-0" for="reason">
        <span class="label-text text-primary-content">Reason</span>
      </label>
      <select
        id="reason"
        name="reason"
        bind:value={reason}
        aria-label="reason"
        required
        class="input w-full shadow-xl text-lg active:input-secondary focus:input-secondary"
      >
        <option disabled value="">Contact reason</option>
        <option value="hi">Say hi!</option>
        <option value="collaboration">Collaboration request</option>
        <option value="speak">Speaking opportunity</option>
      </select>
    </div>
    <div class="space-y-2 pb-5">
      <label class="label pb-0" for="message">
        <span class="label-text text-primary-content">Message</span>
      </label>
      <textarea
        id="message"
        name="message"
        bind:value={message}
        aria-label="message"
        placeholder="Hey! I'd love to talk about..."
        required
        class="textarea w-full shadow-xl text-lg active:input-secondary focus:input-secondary"
      />
    </div>
    <div class="flex justify-center">
      <button
        type="submit"
        class="btn btn-secondary w-full max-w-lg shadow-xl active:input-secondary focus:input-secondary"
      >
        Submit
      </button>
    </div>
  </form>
</div>
