<script context="module">
  export const load = async () => {
    try {
      const Copy = await import(`../../copy/about.md`)
      return {
        props: {
          Copy: Copy.default,
        },
      }
    } catch (e) {
      return {
        status: 404,
        error: 'Uh oh!',
      }
    }
  }
</script>

<script>
  import Head from '@components/head.svelte'
  import ContactForm from '@lib/components/contact-form.svelte'
  import { name, website } from '@lib/info'
  import { ogImageUrl } from '@lib/og-image-url-build'

  export let Copy
</script>

<Head
  title={`Contact · ${name}`}
  description={`Get in touch, say hi!`}
  image={ogImageUrl(name, `scottspence.com`, `contact`)}
  url={`${website}/about`}
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
      href="mailto:yo@scottspence.com">my email address</a
    >.
  </p>
  <ContactForm />
</div>

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>
