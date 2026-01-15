<script lang="ts">
	const PORTFOLIO_PROJECTS: {
		title: string
		copy: string
		demo: string
		repo: string
		tags: string[]
	}[] = []
</script>

<div class="relative mb-24 lg:-mx-52 xl:-mx-64 2xl:-mx-96">
	<div class="">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div
				class="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-4"
			>
				{#each PORTFOLIO_PROJECTS as project}
					<div class="card bordered">
						<div class="card-body">
							<h3 class="card-title mt-0! text-balance">
								{project.title}
							</h3>
							<p>
								{project.copy}
							</p>
							<div class="flex gap-x-2">
								<a
									href={project.demo}
									target="_blank"
									rel="noopener noreferrer"
									class="btn btn-secondary w-1/2"
								>
									Demo
								</a>
								{#if project.repo.length > 0}
									<a
										href={project.repo}
										target="_blank"
										rel="noopener noreferrer"
										class="btn btn-secondary w-1/2"
									>
										Repo
									</a>
								{:else}
									<a href="/" class="btn w-1/2">Repo</a>
								{/if}
							</div>
							<p>Uses</p>
							<div
								class="relative mt-2 flex flex-wrap wrap-break-word"
							>
								{#each project.tags as tag}
									<div class="badge badge-secondary m-2 flex">
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
