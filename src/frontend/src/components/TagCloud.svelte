<script>
export let tags;
console.log(tags)
console.log("hey")
</script>
<ul>
{#each tags as tag}
    <li><a href="#/projects/tags/{tag}">{tag}</a></li>
    {/each}
</ul>