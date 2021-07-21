<script>
  import { formatDistance } from 'date-fns'

  export let date
  const distance = formatDistance(
    new Date(Date.now()),
    new Date(date)
  )
</script>

<span>{distance}</span>
