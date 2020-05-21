<script>
  import Project from "./Project.svelte";

  export let projects = [];
</script>

<div>
  <a class="button large float-right text-uppercase" href="#/allprojects">
    view all
  </a>
  <div class="clear-both" />
  {#each projects as project}
    <Project {project} />
  {/each}
</div>
