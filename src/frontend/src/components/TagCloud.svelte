<script>
export let tags;

  let tags_category = "projects"
  if(window.location.href.includes("users")){
      tags_category = "users"
  }

</script>

<ul class="stats">
  <h1>Tags</h1>
  {#each tags as tag}
      {#if tag.href.includes("users") && tags_category == "users"}
      <li class="my-1"><a href="{tag.href}">{tag.name}</a></li>
      {:else if tag.href.includes("projects") && tags_category == "projects"}
        <li class="my-1"><a href="{tag.href}">{tag.name}</a></li>
      {/if}
  {/each}

  {#if tags_category == "users"}
     <li class="my-1"><a href="#/users"><b>ALL</b></a></li>
  {:else}
  <li class="my-1"><a href="#/projects"><b>ALL</b></a></li>
  {/if}

</ul>
