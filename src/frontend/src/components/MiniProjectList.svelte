<script>
  import MiniProject from "./MiniProject.svelte";

  export let miniProjects = [];
</script>

<!-- <div class="miniProjectList">
  <ul>
    {#each miniProjects as miniProject}
        <MiniProject {miniProject} />
    {/each}
  </ul>
</div> -->

<section>
  <div class="mini-posts">
    {#each miniProjects as miniProject}
      <MiniProject {miniProject} />
    {/each}
  </div>
</section>
