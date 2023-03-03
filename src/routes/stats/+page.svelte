<script lang="ts">
  // @ts-nocheck
  import Chart from 'svelte-frappe-charts'

  export let data
  let { analytics } = data

  const chart_data = {
    labels: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'],
    datasets: [
      {
        values: [10, 12, 3, 9, 8, 15, 9],
      },
    ],
  }
</script>

<pre>{JSON.stringify(analytics, null, 2)}</pre>

<Chart data={chart_data} type="line" />
