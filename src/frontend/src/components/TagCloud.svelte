<script>
export let tags;

  let tags_category = "projects"
  if(window.location.href.includes("users")){
      tags_category = "users"
  }

  $: selected = "all"
  
  function tagSelected(evt){
    selected = evt.target.innerText.toLowerCase()
    
  }

</script>

<ul class="stats">
  <h1>Tags</h1>
  {#each tags as tag}
      {#if tag.href.includes("users") && tags_category == "users"}
      {#if tag.name == selected}
      <li class="my-1"><a class= "active" on:click={tagSelected} href="{tag.href}">{tag.name}</a></li>
      {:else}
      <li class="my-1"><a  on:click={tagSelected} href="{tag.href}">{tag.name}</a></li>
      {/if}
      
      {:else if tag.href.includes("projects") && tags_category == "projects"}
        {#if tag.name == selected}
      <li class="my-1"><a  on:click={tagSelected} class= "active" href="{tag.href}">{tag.name}</a></li>
        {:else}
        <li class="my-1"><a  on:click={tagSelected} href="{tag.href}">{tag.name}</a></li>
        {/if}
      {/if}
  {/each}

  {#if tags_category == "users"}
    {#if selected == "all"}
     <li class="my-1"><a  on:click={tagSelected} class= "active" href="#/users">ALL</a></li>
     {:else}
     <li class="my-1"><a  on:click={tagSelected} href="#/users">ALL</li>
     {/if}
  {:else}
  {#if selected == "all"}
     <li class="my-1"><a  on:click={tagSelected} class= "active" href="#/projects">ALL</a></li>
     {:else}
     <li class="my-1"><a  on:click={tagSelected} href="#/projects">ALL</a></li>
     {/if}
  {/if}

</ul>
