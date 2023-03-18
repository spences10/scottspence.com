<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  // Function to calculate the color based on the value
  function getColor(value: number) {
    // You can customize this function to suit your color scale
    const colors = [
      '#ebedf0',
      '#9be9a8',
      '#40c463',
      '#30a14e',
      '#216e39',
    ]
    return colors[Math.min(value, colors.length - 1)]
  }
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>

<div class="heatmap">
  {#each data as week (week[0].date)}
    <div class="week">
      {#each week as day}
        <div
          class="day"
          style="background-color: {getColor(day.value)}"
          title="{day.date}: {day.value}"
        ></div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .heatmap {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12px, 1fr));
    gap: 2px;
  }

  .week {
    display: grid;
    grid-template-columns: repeat(7, auto);
    gap: 2px;
  }

  .day {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }
</style>
