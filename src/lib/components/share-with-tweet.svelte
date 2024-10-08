<script lang="ts">
  interface Props {
    buttonText?: string
    tweetText?: string
  }

  let { buttonText = '', tweetText = '' }: Props = $props()
</script>

<a
  class="btn btn-lg"
  rel="noreferrer noopener"
  target="_blank"
  href={`https://twitter.com/intent/tweet?text=${encodeURI(
    tweetText,
  )}`}
  aria-label={`Tweet: ${tweetText}`}
>
  <div class="flex items-center" role="presentation">
    <span class="mr-3">{buttonText}</span>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="block h-5 w-5 fill-current text-primary transition hover:text-secondary"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"
      />
    </svg>
  </div>
</a>
