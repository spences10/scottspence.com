<script context="module">
  import Head from '@components/head.svelte'
  import { name, website } from '@lib/info'
  import { ogImageUrl } from '@lib/og-image-url-build'

  export const load = async () => {
    try {
      const [copy2019, copy2020, copy2021, copy2022] =
        await Promise.all([
          import(`../../copy/speaking-2019.md`),
          import(`../../copy/speaking-2020.md`),
          import(`../../copy/speaking-2021.md`),
          import(`../../copy/speaking.md`),
        ])
      return {
        props: {
          copy: {
            copy2019: copy2019.default,
            copy2020: copy2020.default,
            copy2021: copy2021.default,
            copy2022: copy2022.default,
          },
        },
      }
    } catch (e) {
      return {
        status: 404,
        error: `Uh oh! There's an error! ${e.message}`,
      }
    }
  }
</script>

<script>
  export let copy

  let selected

  function setContent() {
    if (selected === '2019') {
      return copy.copy2019
    } else if (selected === '2020') {
      return copy.copy2020
    } else if (selected === '2021') {
      return copy.copy2021
    } else if (selected === '2022') {
      return copy.copy2022
    } else {
      return copy.copy2022
    }
  }
</script>

<Head
  title={`Speaking · ${name}`}
  description={`A list of events where ${name} has held a workshop, a talk or spoken publically.`}
  image={ogImageUrl(name, `scottspence.com`, `Scott Speaks!`)}
  url={`${website}/speaking`}
/>

<div class="text-right">
  Previous years:
  <select
    class="pr-9 select select-bordered select-primary select-xs"
    bind:value={selected}
    on:change={() => {
      setContent(selected)
    }}
  >
    <option value="2022">2022</option>
    <option value="2021">2021</option>
    <option value="2020">2020</option>
    <option value="2019">2019</option>
  </select>
</div>

<div class="all-prose">
  <svelte:component this={setContent()} />
</div>

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>
