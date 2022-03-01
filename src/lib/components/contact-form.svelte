<script>
  // acknowledgement: https://www.youtube.com/watch?v=mBXEnakkUIM
  let submitStatus = ''
  const submitForm = async data => {
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

{#if submitStatus === 'submitting'}
  <p>Submitting</p>
{:else if submitStatus === 'failed'}
  <p>failed</p>
{:else if submitStatus === 'success'}
  <p>Success</p>
{:else}
  <div class="flex justify-around">
    <form class="form-control" on:submit|preventDefault={submitForm}>
      <div>
        <label class="label" for="name">
          <span class="label-text">Your name</span>
        </label>
        <input
          class="input input-bordered w-full max-w-xs"
          type="text"
          name="name"
          aria-label="name"
          placeholder="Ada Lovelace"
          required
        />
      </div>
      <div>
        <label class="label" for="email">
          <span class="label-text">Your email address</span>
        </label>
        <input
          class="input input-bordered w-full max-w-xs"
          type="email"
          name="email"
          aria-label="email"
          autocomplete="email"
          placeholder="ada@lovelace.com"
          required
        />
      </div>
      <div>
        <label class="label" for="reason">
          <span class="label-text"
            >What are you reaching out for?</span
          >
        </label>
        <select
          class="input input-bordered w-full max-w-xs"
          type="text"
          name="reason"
          aria-label="reason"
          placeholder="I'd love to have a chat!"
          required
        >
          <option disabled="disabled" selected="selected">
            Select a reason for reaching out
          </option>
          <option value="hi">Say hi!</option>
          <option value="colab">Collaboration request</option>
          <option value="speak">Speaking opportunity</option>
        </select>
      </div>
      <div>
        <label class="label" for="message">
          <span class="label-text">Add a short message</span>
        </label>
        <textarea 
          class="textarea input-bordered w-full max-w-xs mb-5"
          type="text"
          name="message"
          aria-label="name"
          placeholder="Hey! I'd love to talk about..."
          required
          rows="3"
        />
      </div>
      <div>
        <input
          class="btn btn-primary w-full max-w-xs"
          type="submit"
        />
      </div>
    </form>
  </div>
{/if}
