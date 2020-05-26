<script>
  export let user;
</script>

<article>
  <header>
    <h3>
      <a href="#/people/{user.name}">{user.info.name}</a>
    </h3>
  </header>
  {#if user.links.image_path != ''}
    <a href="#/people/{user.name}" class="image">
      <img src={user.links.image_path} alt="" />
    </a>
  {:else}
    <a href="#/people/{user.name}" class="image">
      <img src="images/pic01.jpg" alt="" />
    </a>
  {/if}
</article>
