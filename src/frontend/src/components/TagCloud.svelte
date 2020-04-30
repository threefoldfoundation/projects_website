<script>
  export let tags;
  console.log(tags);
  console.log("hey");
</script>

<ul class="stats">
  <h1>Tags</h1>
  {#each tags as tag}
    <li class="my-1">
      <a href="#/projects/tags/{tag}">{tag}</a>
    </li>
  {/each}
</ul>
