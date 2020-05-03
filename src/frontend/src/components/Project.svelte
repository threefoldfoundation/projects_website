<script>
  import marked from "marked";
  export let project;
</script>

<article class="post">
  <header>
    <div class="title">
      <h2>
        <a href="#/projects/{project.name}">{project.name}</a>
      </h2>
    </div>
  </header>
  {#if project.links.video != ''}
    <div class="embed-container my-3">
      <iframe
        width="950"
        height="550"
        src="{project.links.video}?title=0&byline=0&portrait=0"
        title=""
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope;
        picture-in-picture"
        allowfullscreen />
    </div>
  {:else if project.links.image_path != ''}
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
