<script>
export let tags;
</script>

<ul class="stats">
  <h1>Tags</h1>
  {#each tags as tag}
    <li class="my-1">
      <a href="{tag.href}">{tag.name}</a>
    </li>
  {/each}
</ul>
