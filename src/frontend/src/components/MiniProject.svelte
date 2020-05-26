<script>
  export let miniProject;
</script>

<!-- Mini Post -->
<article class="mini-post mb-1 col-sm-6">
  <!-- <header>
    <h3>
      <a href="#/projects/{miniProject.name}">{miniProject.name}</a>
    </h3>
  </header> -->

  {#if miniProject.links.logo_path != ''}
    <a href="#/projects/{miniProject.name}" class="image">
      <img
        class="img-thumbnail border-0"
        src={miniProject.links.logo_path}
        alt="" />
    </a>
  {:else}
    <a href="#/projects/{miniProject.name}" class="image ">
      <img class="img-thumbnail border-0" src="images/pic01.jpg" alt="" />
    </a>
  {/if}
</article>
