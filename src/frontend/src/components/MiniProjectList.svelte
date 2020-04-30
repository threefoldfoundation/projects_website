<script>
  import MiniProject from "./MiniProject.svelte";

  export let miniProjects = [];
</script>

<section>
  <div class="mini-posts">
    {#each miniProjects as miniProject}
      <MiniProject {miniProject} />
    {/each}
  </div>
</section>
