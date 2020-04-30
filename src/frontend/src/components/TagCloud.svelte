<script>
export let tags;
</script>
<ul>
{#each tags as tag}
    <li><a href="#/projects/tags/{tag}">{tag}</a></li>
    {/each}
</ul>