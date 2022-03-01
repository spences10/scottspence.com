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
  <form on:submit|preventDefault={submitForm}>
    <div>
      <label for="">
        Name
        <input type="text" name="name" />
      </label>
    </div>
    <div>
      <label for="">
        Email
        <input type="email" name="email" />
      </label>
    </div>
    <div>
      <label for="">
        Contact Reason
        <input type="text" name="reason" />
      </label>
    </div>
    <div>
      <input type="submit" />
    </div>
  </form>
{/if}
