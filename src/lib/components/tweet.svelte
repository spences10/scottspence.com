<script>
  export let tweetLink = ''
</script>

<svelte:head>
  <script
    async
    src="https://platform.twitter.com/widgets.js"
    charset="utf-8"></script>
</svelte:head>

<div class="flex justify-center mb-12">
  <blockquote class="twitter-tweet">
    <a class="twitter-tweet" href={`https://twitter.com/${tweetLink}`}
      >Loading Tweet...</a
    >
  </blockquote>
</div>
