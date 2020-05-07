<script>
  import marked from "marked";
  export let item;
  console.log(item);
</script>

<article class="post search_result">
  <header>
    <div class="title">
      {#if item.isUser}
        <h3>User:</h3>
      {:else}
        <h3>Company:</h3>
      {/if}
      <a class="text-uppercase" href="#/projects/{item.name}">{item.name}</a>

    </div>
  </header>
</article>
