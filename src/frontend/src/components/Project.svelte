<script>
  import marked from "marked";
  export let project;
</script>

<article class="post" style="top:15px;">
  <header>
    <div class="title">
      <h2 class="title2">
        <a href="#/projects/{project.name}">{project.name}</a>
      </h2>
    </div>
  </header>
  {#if project.links.image_path != ''}
    <a href="#/projects/{project.name}" class="image featured">
      <img src={project.links.image_path} alt="" />
    </a>
  {:else}
    <a href="#/projects/{project.name}" class="image featured">
      <img src="images/pic01.jpg" alt="" />
    </a>
  {/if}

  <p>{project.info.mission}</p>

  <footer>
    <ul class="actions">
      <li>
        <a href="#/projects/{project.name}" class="button large">Learn more</a>
      </li>
    </ul>
    <ul class="stats">
      {#each project.ecosystem.categories as category}
        <li>
          <a href="#/projects/tags/{category}">{category}</a>
        </li>
      {/each}
    </ul>
  </footer>
</article>
