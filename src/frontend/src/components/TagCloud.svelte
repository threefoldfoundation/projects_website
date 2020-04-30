<script>
export let tags;
</script>

<ul class="stats">
  <h1>Tags</h1>
  {#each tags as tag}
    <li class="my-1">
      <a href="#/projects/tags/{tag}">{tag}</a>
    </li>
  {/each}
</ul>
