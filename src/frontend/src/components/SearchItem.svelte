<script>
  import marked from "marked";
  export let item;
</script>

<article class="post search_result">
  <header>
    <div class="title">
      {#if item.isUser}
        <h3>Person:</h3>
      {:else}
        <h3>Company:</h3>
      {/if}
      <a class="author text-uppercase" href="#/projects/{item.name}">
        <img src={item.links.image_path} alt="" />
        {item.name}
      </a>

    </div>
  </header>
</article>
