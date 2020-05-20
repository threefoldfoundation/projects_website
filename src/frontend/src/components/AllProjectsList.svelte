<script>
  import ProjectItem from "./ProjectItem.svelte";

  export let projects = [];
</script>

<div>
  {#each projects as item}
    <ProjectItem item={item} />
  {/each}
</div>
