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
      <a href="#/projects/{project.name}" class="image featured"><img src={project.links.image_path} alt="" /></a>
    {:else if project.links.video != ""}
      <iframe width="800" height="315" src="{project.links.video}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    {:else}
      <a href="#/projects/{project.name}" class="image featured"><img src="images/pic01.jpg" alt="" /></a>
    {/if}
  
  <p>{@html marked(project.pages[0].content.slice(0, 300) + " ...")}</p>
  <footer>
    <ul class="actions">
      <li><a href="#/projects/{project.name}" class="button large">Continue Reading</a></li>
    </ul>
    <ul class="stats">
      <li><a href="#">General</a></li>
    </ul>
  </footer>
</article>
