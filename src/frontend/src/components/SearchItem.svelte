<script>
  import marked from "marked";
  export let item;
</script>

<article class="post">
  <header>
    <div class="title">
    {#if item.isUser}
    <h1>User</h1>
      {:else}
      <h1>Company</h1>
      {/if}
      <h2>
        <a href="#/projects/{item.name}">{item.name}</a>
      </h2>
      
    </div>
  </header>
</article>
