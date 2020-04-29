<script>
  import marked from 'marked'
  export let project;
</script>

<article class="project post">
  <header>
    <div class="title">
      <h2><a href="#/projects/{project.name}">{project.name}</a></h2>
    </div>
  </header>
   {#if project.links.image_path != ""}
      <a href="#/projects/{project.name}" class="image featured"><img height="250" src={project.links.image_path} alt="" /></a>
    {:else if project.links.video != ""}
      <iframe width="800" height="415" src={project.links.video} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    {:else}
      <a href="#/projects/{project.name}" class="image featured"><img height="250" src="images/pic01.jpg" alt="" /></a>
    {/if}
  
  <p>{project.info.mission}</p>
  <footer>
    <ul class="actions">
      <li><a href="#/projects/{project.name}" class="button large">Continue Reading</a></li>
    </ul>
    <ul class="stats">
    {#each project.ecosystem.categories as category}
      <li><a href="#search?q={category}">{category}</a></li>
      {/each}
    </ul>
  </footer>
</article>
