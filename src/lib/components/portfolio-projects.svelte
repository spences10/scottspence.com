<script>
  import { PORTFOLIO_PROJECTS } from '../info'
</script>

<div class="mb-24 relative lg:-mx-52 xl:-mx-64 2xl:-mx-96">
  <div class="">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        class="space-y-4 mt-12 sm:grid lg:mx-auto xl:max-w-none sm:mt-16 sm:space-y-0 sm:grid-cols-2 sm:gap-6 lg:max-w-4xl xl:mx-0 xl:grid-cols-4"
      >
        {#each PORTFOLIO_PROJECTS as project}
          <div
            class="divide-y rounded-lg divide-gray-900 bg-gray-800 shadow-sm"
          >
            <div class="p-6">
              <h3 class="font-bold text-2xl leading-6">
                {project.title}
              </h3>
              <p
                class="mt-4 text-sm opacity-70 sm:min-h-[2rem] md:min-h-[3rem] xl:min-h-[5rem]"
              >
                {project.copy}
              </p>
              <div class="flex gap-x-2">
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener"
                  class="btn w-1/2"
                >
                  Demo
                </a>
                {#if project.repo}
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener"
                    class="btn w-1/2"
                  >
                    Repo
                  </a>
                {:else}
                  <a href="noop" class="btn w-1/2"> Repo </a>
                {/if}
              </div>
            </div>
            <div class="px-6 pt-6 pb-8">
              <h3
                class="font-medium text-sm tracking-wide text-primary-200 uppercase"
              >
                Built with
              </h3>
              <ul class="space-y-4 mt-6 list-none">
                {#each project.tags as tag}
                  <li class="flex space-x-3">
                    <svg
                      class="flex-shrink-0 h-5 text-green-500 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-sm opacity-70">
                      {tag}
                    </span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
