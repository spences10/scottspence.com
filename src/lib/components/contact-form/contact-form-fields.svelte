<script lang="ts">
  import { enhance } from '$app/forms'

  export let handle_result: Function
</script>

<div
  class="not-prose my-5 items-center justify-center rounded-box bg-primary py-14 shadow-xl"
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
    class="mx-auto w-full max-w-md space-y-2 px-5"
  >
    <div class="space-y-2">
      <label class="label pb-0" for="name">
        <span class="label-text text-primary-content">Name</span>
      </label>
      <input
        type="text"
        id="name"
        name="name"
        aria-label="name"
        placeholder="Name"
        required
        class="input w-full text-lg shadow-xl focus:input-secondary active:input-secondary"
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
        aria-label="email"
        placeholder="Email"
        required
        class="input w-full text-lg shadow-xl focus:input-secondary active:input-secondary"
      />
    </div>
    <!-- honeypot -->
    <input type="text" name="subject" id="subject" class="hidden" />
    <div class="space-y-2">
      <label class="label pb-0" for="reason">
        <span class="label-text text-primary-content">Reason</span>
      </label>
      <select
        id="reason"
        name="reason"
        aria-label="reason"
        required
        class="input w-full text-lg shadow-xl focus:input-secondary active:input-secondary"
      >
        <option disabled selected value="">Contact reason</option>
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
        aria-label="message"
        placeholder="Hey! I'd love to talk about..."
        required
        class="textarea w-full text-lg shadow-xl focus:input-secondary active:input-secondary"
      ></textarea>
    </div>
    <div class="flex justify-center">
      <button
        type="submit"
        class="btn btn-secondary w-full max-w-lg shadow-xl focus:input-secondary active:input-secondary"
      >
        Submit
      </button>
    </div>
  </form>
</div>
