<script>
  import MiniProject from "./MiniProject.svelte";

  export let miniProjects = [];
</script>

<section>
  <div class="mini-posts">
  <h1>Projects</h1>
    {#each miniProjects as miniProject}
      <MiniProject {miniProject} />
    {/each}
  </div>
</section>
