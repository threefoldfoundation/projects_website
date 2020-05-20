<script>
  import MiniProject from "./MiniProject.svelte";

  export let miniProjects = [];
</script>

<section>
  <div class="mini-posts">
    <h1>Projects</h1>

    <div class="row">
      {#each miniProjects as miniProject}
        <MiniProject {miniProject} />
      {/each}

    </div>
  </div>
</section>
