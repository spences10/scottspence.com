<script lang="ts">
  import { scale_and_fade } from '$lib/utils'
</script>

<div
  in:scale_and_fade|global={{ delay: 400, duration: 400 }}
  class="mx-auto text-center max-w-7xl lg:px-8"
>
  <div
    class="bg-primary rounded-box py-10 lg:flex lg:p-14 lg:items-center"
  >
    <div class="text-primary-content lg:flex-1 lg:w-0">
      <h3 class="font-extrabold tracking-tight text-4xl">
        Awesome! 🥳
      </h3>
      <p class="mt-4 text-xl">
        Thanks for showing interest in my content.
      </p>
      <p class="mt-4 text-xl">
        Please check your email to confirm your subscription. 📨
      </p>
    </div>
  </div>
</div>
