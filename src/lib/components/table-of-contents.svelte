<script>
  export let headings
</script>

{#if headings.length}
  <aside
    class="bg-base-100 rounded-md shadow w-64 table-of-contents lg:block hidden"
  >
    <div class="">
      <h3
        class="!font-extrabold !text-lg !mt-2 !mb-0"
        id="table-of-contents"
      >
        Table of Contents
      </h3>
      <ul class="max-h-72 overflow-auto !mb-0">
        {#each headings as heading}
          <li class="mr-4 mb-2" key={`heading-${heading.href}`}>
            <a href={heading.href}>{heading.label}</a>
          </li>
        {/each}
      </ul>
    </div>
  </aside>
{/if}
