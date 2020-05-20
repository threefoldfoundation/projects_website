<script>
  import SearchItem from "./SearchItem.svelte";

  export let searchResults = [];
</script>

<div>
  {#each searchResults as item}
    <SearchItem {item} />
  {/each}
</div>
