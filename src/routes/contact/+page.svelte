<script lang="ts">
  import { ContactForm, Head } from '$lib/components'
  import { name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'
</script>

<Head
  title={`Contact - ${name}`}
  description={`Get in touch, say hi!`}
  image={og_image_url(name, `scottspence.com`, `contact`)}
  url={`${website}/contact`}
/>

<div class="all-prose">
  <h1>Contact</h1>
  <p>Hey! Want to reach out?</p>
  <p>
    Want to talk about conference invites, private training, podcast
    appearances?
  </p>
  <p>
    You can fill in the contact form here or just send an email to <a
      href="mailto:contact@scottspence.com">my email address</a
    >.
  </p>
  <ContactForm />
</div>

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
