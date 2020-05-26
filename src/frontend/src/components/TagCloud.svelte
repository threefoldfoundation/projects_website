<script>
export let tags;

  let tags_category = "projects"
  if(window.location.href.includes("people")){
      tags_category = "people"
  }
  tags = tags.filter(t =>
      t.href.includes(tags_category)
  );

  function getSelected(t){
    var projectsIdx = t.indexOf("#/projects/tags")
    var peopleIdx = t.indexOf("#/people/tags")
    if (projectsIdx != -1)
      return t.substring(projectsIdx+16)
    else if (peopleIdx != -1)
      return t.substring(peopleIdx+13)
    else 
      return "all"
  }

  $: selected = getSelected(location.href)

  function tagSelected(evt){
    selected = evt.target.innerText.toLowerCase()
  }
  

</script>

<ul class="stats">
  <h1>Tags</h1>
  {#each tags as tag}
      {#if tag.name == selected}
      <li class="my-1"><a  on:click={tagSelected} class= "active" href="{tag.href}">{tag.name}</a></li>
      {:else}
      <li class="my-1"><a  on:click={tagSelected} href="{tag.href}">{tag.name}</a></li>
      {/if}
  {/each}

  {#if selected == "all" && tags_category == "projects"}
     <li class="my-1"><a  on:click={tagSelected} class= "active" href="#/projects">ALL</a></li>
  {:else if tags_category == "projects"}
     <li class="my-1"><a   on:click={tagSelected} href="#/projects">ALL</a></li>
  {:else if selected == "all" && tags_category == "people"}
  <li class="my-1"><a  on:click={tagSelected}  class= "active" href="#/people">ALL</a></li>
  {:else if tags_category == "people"}
  <li class="my-1"><a  on:click={tagSelected} href="#/people">ALL</a></li>
  {/if}
</ul>
