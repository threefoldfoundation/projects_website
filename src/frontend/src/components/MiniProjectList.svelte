<script>
  import MiniProject from "./MiniProject.svelte";

  export let miniProjects = [];
</script>

<div class="miniProjectList">
  <ul>
    {#each miniProjects as miniProject}
      <li>
        <MiniProject {miniProject} />
      </li>
    {/each}
  </ul>
</div>