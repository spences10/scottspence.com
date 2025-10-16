<script lang="ts">
	import type { PageData } from './$types'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()
</script>

<svelte:head>
	<title>Newsletter Confirmation - Scott Spence</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-16">
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body items-center text-center">
			{#if data.status === 'success'}
				<div class="text-success mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-16 w-16"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h1 class="card-title text-3xl">Subscription Confirmed!</h1>
				<p class="py-4">{data.message}</p>
				<div class="card-actions">
					<a href="/" class="btn btn-primary">Go to Homepage</a>
				</div>
			{:else}
				<div class="text-error mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-16 w-16"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h1 class="card-title text-3xl">Confirmation Failed</h1>
				<p class="py-4">{data.message}</p>
				<div class="card-actions">
					<a href="/" class="btn btn-primary">Go to Homepage</a>
				</div>
			{/if}
		</div>
	</div>
</div>
