<script>
    export let user
</script>

<article class="user">
  <header>
    <h3>
      <a href="#/users/{user.name}">{user.info.name}</a>
    </h3>
  </header>
  <a href="#/users/{user.name}" class="image">
{#if user.links.image_path != ""}
      <a href="#/users/{user.name}" class="image featured"><img  width="351" height="176" src={user.links.image_path} alt="" /></a>
    {:else if user.links.video != ""}
      <iframe width="351" height="176" src={user.links.video} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    {:else}
      <a href="#/projects/{user.name}" class="image featured"><img  width="351" height="176" src="images/pic01.jpg" alt="" /></a>
    {/if}
  </a>
</article>
