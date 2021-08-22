<script>
  import { PEOPLE } from '$lib/info'
  import PeopleToMeetCheck from './people-to-meet-check.svelte'

  // const peopleSorted = PEOPLE.sort((a, b) => {
  //   return a.met - b.met
  // })
</script>

<article class="m-0 mb-20 sm:-mx-30 lg:-mx-40 ">
  <p class="font-bold text-xl mb-2">
    People I'd like to meet in real life (aka the meatspace).
  </p>

  <p class="text-sx text-secondary mb-5">
    Totally stolen from
    <a
      class="transition link hover:text-primary"
      href="https://rafa.design/">Rafael Conde</a
    >
  </p>

  <ul
    class="grid gap-7 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  >
    {#each PEOPLE as { name, link, met }}
      <li class="">
        <div class="flex text-left items-center">
          <PeopleToMeetCheck {met} />
          <span class="hover:text-primary">
            <a class="text-xl" href={link}>{name}</a>
          </span>
        </div>
      </li>
    {/each}
  </ul>
</article>
