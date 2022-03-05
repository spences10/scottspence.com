<script>
  import * as SC from 'svelte-cubed'
  import * as THREE from 'three'

  export let contributions

  let rows = 7

  let rotation = {
    x: 0,
    y: 0,
    z: 0,
  }
  let position = {
    x: -20,
    y: -20,
    z: 30,
  }
</script>

<div class="flex justify-center space-x-10 ">
  <div class="flex flex-col max-w-lg">
    <p>Rotation Controls</p>
    X: {rotation.x}
    <input
      class="range range-xs range-primary"
      type="range"
      bind:value={rotation.x}
      min={0}
      max={6.28}
      step={0.01}
    />

    Y: {rotation.y}
    <input
      class="range range-xs range-primary"
      type="range"
      bind:value={rotation.y}
      min={0}
      max={6.28}
      step={0.01}
    />
    Z: {rotation.z}
    <input
      class="range range-xs range-primary"
      type="range"
      bind:value={rotation.z}
      min={0}
      max={6.28}
      step={0.01}
    />
  </div>
  <div class="flex flex-col max-w-lg">
    <p>Position Controls</p>
    X: {position.x}
    <input
      class="range range-xs range-primary"
      type="range"
      bind:value={position.x}
      min={-40}
      max={10}
      step={1}
    />
    Y: {position.y}
    <input
      class="range range-xs range-primary"
      type="range"
      bind:value={position.y}
      min={-40}
      max={10}
      step={1}
    />
    Z: {position.z}
    <input
      class="range range-xs range-primary"
      type="range"
      bind:value={position.z}
      min={-100}
      max={80}
      step={1}
    />
  </div>
</div>
<br />

<article class="relative h-[28rem] w-[48rem]">
  <SC.Canvas antialias alpha>
    <SC.Group
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
    >
      {#each contributions as contribution, index}
        {@const value = contribution.value / 2}
        <SC.Mesh
          scale={[1, value, 1]}
          geometry={new THREE.BoxGeometry(1, 1, 1)}
          material={new THREE.MeshStandardMaterial({
            color: `hsl(133, 63%, ${value * 2}%)`,
          })}
          position={[
            Math.floor(index / rows),
            value / 2,
            index % rows,
          ]}
        />
      {/each}
    </SC.Group>
    <SC.PerspectiveCamera position={[15, 15, 100]} />
    <SC.OrbitControls />
    <SC.AmbientLight intensity={0.5} />
    <SC.DirectionalLight intensity={0.5} position={[3, 5, -4]} />
  </SC.Canvas>
</article>
