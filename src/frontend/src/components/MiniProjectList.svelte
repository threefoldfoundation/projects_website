<script>
  import MiniProject from "./MiniProject.svelte";

    export let miniProjects = [];

</script>

<div class="miniProjectList">
  <ul>
    {#each miniProjects as miniProject}
        <MiniProject {miniProject} />
    {/each}
  </ul>
</div>