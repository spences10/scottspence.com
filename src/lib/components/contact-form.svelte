<script lang="ts">
  import { scaleAndFade } from '$lib/custom-transition'

  // acknowledgement: https://www.youtube.com/watch?v=mBXEnakkUIM
  let submitStatus = ''
  const submitForm = async (data: {
    currentTarget: HTMLFormElement | undefined
  }) => {
    submitStatus = 'submitting'
    const formData = new FormData(data.currentTarget)

    const res = await fetch('/contact-form.json', {
      method: 'POST',
      body: formData,
    })

    const { message } = await res.json()
    submitStatus = message
  }
</script>

{#if submitStatus === 'failed'}
  <p>Failed oops!</p>
{:else if submitStatus === 'success'}
  <div
    in:scaleAndFade={{ delay: 400, duration: 400 }}
    class="mx-auto text-center max-w-7xl py-12 lg:py-16 lg:px-8"
  >
    <div
      class="bg-primary rounded-3xl py-10 lg:flex lg:p-20 lg:items-center"
    >
      <div class="text-primary-content lg:flex-1 lg:w-0">
        <h3 class=" font-extrabold tracking-tight text-3xl">
          Awesome!
        </h3>
        <p class="mt-4 text-lg">Thanks for reaching out!</p>
        <p class="mt-4 text-lg">I'll be in touch!</p>
      </div>
    </div>
  </div>
{:else}
  <div
    out:scaleAndFade={{ delay: 200, duration: 200 }}
    class="flex justify-around mb-5"
  >
    <form class="form-control" on:submit|preventDefault={submitForm}>
      <label class="label" for="name">
        <span class="label-text all-prose">Your name</span>
      </label>
      <input
        class="input input-bordered w-full max-w-xs all-prose"
        type="text"
        name="name"
        aria-label="name"
        placeholder="Ada Lovelace"
        required
      />
      <label class="label" for="email">
        <span class="label-text all-prose">Your email address</span>
      </label>
      <input
        class="input input-bordered w-full max-w-xs all-prose"
        type="email"
        name="email"
        aria-label="email"
        autocomplete="email"
        placeholder="ada@lovelace.com"
        required
      />
      <label class="label" for="reason">
        <span class="label-text all-prose">
          What are you reaching out for?
        </span>
      </label>
      <select
        class="input input-bordered w-full max-w-xs all-prose"
        name="reason"
        aria-label="reason"
        placeholder="I'd love to have a chat!"
        required
      >
        <option disabled selected>
          Select a reason for reaching out
        </option>
        <option value="hi">Say hi!</option>
        <option value="colab">Collaboration request</option>
        <option value="speak">Speaking opportunity</option>
      </select>
      <label class="label" for="message">
        <span class="label-text all-prose">Add a short message</span>
      </label>
      <textarea
        class="textarea input-bordered w-full max-w-xs all-prose mb-5"
        name="message"
        aria-label="name"
        placeholder="Hey! I'd love to talk about..."
        required
        rows="3"
      />
      <input
        class="btn btn-primary w-full max-w-xs prose prose-lg lg:prose-xl prose-a:transition prose-a:text-primary hover:prose-a:text-primary-focus"
        type="submit"
        value="Submit"
      />
    </form>
  </div>
{/if}
