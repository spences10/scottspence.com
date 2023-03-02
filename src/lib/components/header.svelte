<script lang="ts">
  import { name } from '$lib/info'
  import ThemeSelect from './theme-select.svelte'
</script>


<div class="container max-w-3xl mx-auto px-4">
  <div class="flex h-16 mb-4 py-2 justify-between items-center">
    <p
      class="bg-clip-text bg-gradient-to-b from-primary to-secondary font-extrabold text-transparent text-3xl lg:text-4xl"
    >
      <a href="/">{name}</a>
    </p>
    <div>
      <ThemeSelect />
    </div>
  </div>
</div>
