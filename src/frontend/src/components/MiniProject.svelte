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
  {#if miniProject.links.image_path != ''}
    <a href="#/projects/{miniProject.name}" class="image">
      <img src={miniProject.links.image_path} alt="" />
    </a>
  {:else if miniProject.links.video != ''}
    <iframe
      width="409"
      height="225"
      src="{miniProject.links.video}?title=0&byline=0&portrait=0"
      title=""
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope;
      picture-in-picture"
      allowfullscreen />
  {:else}
    <a href="#/projects/{miniProject.name}" class="image ">
      <img src="images/pic01.jpg" alt="" />
    </a>
  {/if}
</article>
