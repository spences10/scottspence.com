<script lang="ts">
  const themes = [
    'acid',
    'aqua',
    'autumn',
    'black',
    'bumblebee',
    'business',
    'cmyk',
    'coffee',
    'corporate',
    'cupcake',
    'cyberpunk',
    'dark',
    'dracula',
    'emerald',
    'fantasy',
    'forest',
    'garden',
    'halloween',
    'lemonade',
    'light',
    'lofi',
    'luxury',
    'night',
    'pastel',
    'retro',
    'synthwave',
    'valentine',
    'winter',
    'wireframe',
  ]
</script>

<div>
  <select
    data-choose-theme
    class="font-sans pr-9 select select-bordered select-primary select-xs capitalize"
  >
    <option disabled selected>Theme</option>
    {#each themes as theme}
      <option value={theme} class="capitalize">{theme}</option>
    {/each}
  </select>
</div>
