<script>
  export let miniProject;
  console.log(miniProject);
</script>

<article class="miniProject">
  <header>
    <h3>
      <a href>{miniProject.name}</a>
    </h3>
  </header>
  {#if miniProject.links.video != ''}
    <iframe
      width="351"
      height="176"
      src={miniProject.links.video}
      title=""
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope;
      picture-in-picture"
      allowfullscreen />
  {:else if miniProject.links.image_path != ''}
    <a href="#/projects/{miniProject.name}" class="image">
      <img width="351" height="176" src={miniProject.links.image_path} alt="" />
    </a>
  {:else}
    <a href="#/projects/{miniProject.name}" class="image ">
      <img width="351" height="176" src="images/pic01.jpg" alt="" />
    </a>
  {/if}
  <!-- <a href="" class="image"><img src="images/pic04.jpg" alt="" /></a> -->
</article>
