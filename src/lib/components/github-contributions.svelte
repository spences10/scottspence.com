<script>
  import * as SC from 'svelte-cubed'
  import * as THREE from 'three'

  export let contributions

  let rows = 7
</script>

<article class="relative h-[48rem] w-[48rem]">
  <SC.Canvas antialias alpha>
    {#each contributions as contribution, index}
      <SC.Mesh
        scale={[1, contribution.value, 1]}
        geometry={new THREE.BoxGeometry(1, 1, 1)}
        material={new THREE.MeshStandardMaterial({
          color: `hsl(133, 63%, ${contribution.value * 2}%)`,
        })}
        position={[
          Math.floor(index / rows),
          contribution.value / 2,
          index % rows,
        ]}
      />
    {/each}
    <SC.PerspectiveCamera position={[15, 15, 100]} />
    <SC.OrbitControls />
    <SC.AmbientLight intensity={0.5} />
    <SC.DirectionalLight intensity={0.5} position={[3, 5, -4]} />
  </SC.Canvas>
</article>
