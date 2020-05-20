<script>
  import Project from "./Project.svelte";

  export let projects = [];
</script>

<div>
  <a class="mb-2" href="#/allprojects">ALL projects</a>
  {#each projects as project}
    <Project {project} />
  {/each}
</div>
