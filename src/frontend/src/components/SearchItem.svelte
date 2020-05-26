<script>
  import marked from "marked";
  export let item;
</script>

<article class="post search_result">
  <header>
    <div class="title">
      {#if item.isUser}
        <h3>Person:</h3>
        <a class="author text-uppercase" href="#/people/{item.name}">
        <img src={item.links.image_path} alt="" />
        {item.name}
      </a>
      {:else}
        <h3>Company:</h3>
        <a class="author text-uppercase" href="#/projects/{item.name}">
        <img src={item.links.image_path} alt="" />
        {item.name}
      </a>
      {/if}
      

    </div>
  </header>
</article>
