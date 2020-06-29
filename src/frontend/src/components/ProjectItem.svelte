<script>
  export let item;
</script>

<style>
  h3 {
    text-transform: none;
  }
  .project-item p {
    color: #646464;
    font-size: 0.9em !important;
    margin-top: 0;
  }
  a:hover {
    text-decoration: none;
  }
  img {
    height: auto;
    min-height: 105px;
  }
</style>

<div class="col-sm-12">
  <a class="proimage featured mb-0" href="#/projects/{item.name}">
    <article class="post search_result row p-3 mb-4">
      <div class="col-sm-3">
        <img src={item.links.image_path} alt="" class="img-thumbnail" />
      </div>
      <div class="col-sm-9">
        <header>
          <div class="title">
            <h3>{item.name}</h3>

            <div class="project-item">
              <p>
                {item.info.mission
                  .split(' ')
                  .slice(0, 20)
                  .join(' ')}
              </p>
            </div>
          </div>
        </header>
        <footer class="ml-auto">
          <ul class="stats">
            {#each item.ecosystem.categories as category}
              <li>
                <a class="text-uppercase" href="#/projects/tags/{category}">
                  {category}
                </a>
              </li>
            {/each}
          </ul>
        </footer>
      </div>
    </article>
  </a>

</div>
