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
          <div class="card bordered">
            <div class="card-body">
              <h3 class="card-title !-mt-0">
                {project.title}
              </h3>
              <p>
                {project.copy}
              </p>
              <div class="flex gap-x-2">
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener"
                  class="w-1/2 btn btn-secondary"
                >
                  Demo
                </a>
                {#if project.repo.length > 0}
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener"
                    class="w-1/2 btn btn-secondary"
                  >
                    Repo
                  </a>
                {:else}
                  <a href="/" class="w-1/2 btn" disabled="disabled">
                    Repo
                  </a>
                {/if}
              </div>
              <p>Uses</p>
              <div class="flex flex-wrap mt-2 break-words relative">
                {#each project.tags as tag}
                  <div class="flex badge m-2 badge-secondary">
                    {tag}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
