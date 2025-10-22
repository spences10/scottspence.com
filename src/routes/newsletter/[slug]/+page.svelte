<script lang="ts">
	import { format } from 'date-fns'
	import { Head } from 'svead'
	import { website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'

	let { data } = $props()

	let { Content, meta } = data
	const { title, date, slug } = meta

	const url = `${website}/newsletter/${slug}`
	const seo_config = create_seo_config({
		title,
		description: `Newsletter: ${title}`,
		slug: `newsletter/${slug}`,
	})
</script>

<Head {seo_config} />

<article>
	<h1 class="mb-1 text-5xl font-black">{title}</h1>
	<div class="mt-4 mb-8 uppercase">
		<time datetime={new Date(date).toISOString()}>
			{format(new Date(date), 'MMMM d, yyyy')}
		</time>
	</div>

	<div class="all-prose mb-10">
		<Content />
	</div>

	<div class="mt-10 mb-5 flex w-full flex-col">
		<div class="divider divider-secondary"></div>
	</div>

	<div class="mb-10 text-center">
		<a href="/newsletter" class="btn btn-primary">
			← Back to all newsletters
		</a>
	</div>
</article>
