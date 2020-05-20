<script>
  import ProjectItem from "./ProjectItem.svelte";

  export let projects = [];
</script>

<div class="row">
  {#each projects as item}
    <ProjectItem {item} />
  {/each}
</div>
