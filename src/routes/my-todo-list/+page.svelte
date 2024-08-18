<script lang="ts">
  import { Head } from '$lib/components'
  import { name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'

  export let data
  let { Copy } = data
</script>

<Head
  title={`My Todo List - ${name}`}
  description={`My list of todo items. Updated irregularly, check last updated date.`}
  image={og_image_url(name, `scottspence.com`, `My todo list.`)}
  url={`${website}/my-todo-list`}
/>

<div class="all-prose">
  <Copy />
</div>

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
