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
    <li class="my-1">
      {#if tag.href.includes("users") && tags_category == "users"}
      <a href="{tag.href}">{tag.name}</a>
      {:else if tag.href.includes("projects") && tags_category == "projects"}
        <a href="{tag.href}">{tag.name}</a>
      {/if}
    </li>
  {/each}
</ul>
