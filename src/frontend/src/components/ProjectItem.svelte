<script>
  export let item;
</script>

<div class="col-sm-12">
  <article class="post search_result row p-3 mb-4">
    <div class="col-sm-3">
      <a class="image featured mb-0" href="#/projects/{item.name}">
        <img src={item.links.image_path} alt="" class="img-thumbnail" />
      </a>
    </div>
    <div class="col-sm-9">
      <header>
        <div class="title">
          <h3>{item.name}</h3>

          <div>
            {item.info.mission
              .split(' ')
              .slice(0, 20)
              .join(' ')} .....

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
</div>
