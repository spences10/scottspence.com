<script lang="ts">
  import { Head, TableOfContents } from '$lib/components'
  import { name, website } from '$lib/info'
  import {
    get_headings,
    og_image_url,
    update_toc_visibility,
  } from '$lib/utils'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { SchemaOrg, type SchemaOrgProps } from 'svead'

  export let data
  let { Copy } = data

  let end_of_copy: HTMLElement | null
  let show_table_of_contents = true
  let headings_promise: Promise<{ label: string; href: string }[]>

  onMount(() => {
    headings_promise = get_headings()
  })

  const handle_scroll = () => {
    show_table_of_contents = update_toc_visibility(end_of_copy)
  }

  // Schema.org data for FAQPage
  const schema_org: SchemaOrgProps['schema'] = {
    '@type': 'FAQPage',
    '@id': `${$page.url.href}#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        '@id': `${$page.url.href}#q1`,
        name: 'Are you eligible to work in the UK',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes.'
        }
      },
      {
        '@type': 'Question',
        '@id': `${$page.url.href}#q2`,
        name: 'What\'s your current situation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I am currently employed. I\'m not actively looking, but I\'ll always be open to the right position.'
        }
      },
      {
        '@type': 'Question',
        '@id': `${$page.url.href}#q3`,
        name: 'What\'s my ideal role?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Creating educational content, working in a team of developers with an emphasis on technical development, pair programming, and collaboration. Working with Svelte and SvelteKit, Netlify, Vercel, and GitHub.'
        }
      },
      {
        '@type': 'Question',
        '@id': `${$page.url.href}#q4`,
        name: 'What sort of company do you want to work with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A company that wants their employees to win, supporting learning and encouraging growth. I prefer companies that focus on the actual work rather than marketing buzzwords. Ethically, I don\'t agree with gambling companies.'
        }
      },
      {
        '@type': 'Question',
        '@id': `${$page.url.href}#q5`,
        name: 'What\'s your preferred stack?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I\'m really enjoying working with Svelte and SvelteKit. I also have experience with React, GraphQL, and various headless CMS. For back-end, I prefer Node.js.'
        }
      },
      {
        '@type': 'Question',
        '@id': `${$page.url.href}#q6`,
        name: 'How many years experience do you have?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I have several years of experience in various technologies. Please check my about page for detailed information.'
        }
      },
      {
        '@type': 'Question',
        '@id': `${$page.url.href}#q7`,
        name: 'Are you willing to relocate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, I\'m happy in Swanley.'
        }
      },
      {
        '@type': 'Question',
        '@id': `${$page.url.href}#q8`,
        name: 'Are you willing to work remotely?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, I prefer fully remote roles.'
        }
      }
    ],
    isPartOf: {
      '@type': 'WebSite',
      '@id': website,
      name: name,
      url: website
    },
    name: `Recruiter FAQs - ${name}`,
    description: `Frequently Asked Questions for recruiters.`,
    url: $page.url.href,
    inLanguage: 'en',
    datePublished: '2023-06-30',
    dateModified: '2023-06-30'
  }

  // Additional questions can be added dynamically if needed
  $: if (headings_promise) {
    headings_promise.then(headings => {
      const additional_questions = headings
        .filter(heading => !schema_org.mainEntity.some((q: { name: string }) => q.name === heading.label))
        .map((heading, index) => ({
          '@type': 'Question',
          '@id': `${$page.url.href}#q${schema_org.mainEntity.length + index + 1}`,
          name: heading.label,
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Please refer to the full FAQ page for detailed information.'
          }
        }))
      schema_org.mainEntity = [...schema_org.mainEntity, ...additional_questions]
    })
  }
</script>

<svelte:window on:scroll={handle_scroll} />

<Head
  title={`Recruiter FAQs - ${name}`}
  description={`Frequently Asked Questions for recruiters.`}
  image={og_image_url(name, `scottspence.com`, `FAQs`)}
  url={`${website}/faq`}
/>

<SchemaOrg schema={schema_org} />

{#if headings_promise}
  {#await headings_promise}
    <p>Loading table of contents...</p>
  {:then headings}
    {#if show_table_of_contents && headings.length > 0}
      <TableOfContents {headings} />
    {:else if headings.length === 0}
      <p>No headings found</p>
    {/if}
  {:catch error}
    <p>Error loading table of contents: {error.message}</p>
  {/await}
{/if}

<div class="all-prose mb-10">
  <Copy />
</div>

<div class="mb-5 mt-10 flex w-full flex-col" bind:this={end_of_copy}>
  <div class="divider divider-secondary"></div>
</div>
