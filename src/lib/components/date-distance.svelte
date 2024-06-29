<script lang="ts">
  import { formatDistance } from 'date-fns'

  interface Props {
    date: number | string | Date
  }

  let { date }: Props = $props()
  const distance = formatDistance(
    new Date(Date.now()),
    new Date(date),
  )
</script>

<span data-testid="date-distance">{distance}</span>
