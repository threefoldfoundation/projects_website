<script>
  export let miniProject;
</script>

<!-- Mini Post -->
<article class="mini-post">
  <header>
    <h3>
      <a href>{miniProject.name}</a>
    </h3>
  </header>
  {#if miniProject.links.logo_path != ''}
    <a href="#/projects/{miniProject.name}" class="image">
      <img src={miniProject.links.logo_path} alt="" />
    </a>
  {:else}
    <a href="#/projects/{miniProject.name}" class="image ">
      <img src="images/pic01.jpg" alt="" />
    </a>
  {/if}
</article>
