<script>
  export let user;
</script>

<article class="post user">
  <header>
    <div class="title">
      <h2>
        <a href="#/users/{user.name}">{user.info.name}</a>
      </h2>
    </div>
  </header>
  {#if user.links.video !== ''}
    <div class="embed-container my-3">
      <iframe
        src="{user.links.video}?title=0&byline=0&portrait=0"
        title=""
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope;
        picture-in-picture"
        allowfullscreen />
    </div>
  {:else if user.links.image_path !== ''}
    <a href="#/users/{user.name}" class="image featured">
      <img src={user.links.image_path} alt="" />
    </a>
  {:else}
    <a href="#/users/{user.name}" class="image featured">
      <img height="auto" src="images/pic01.jpg" alt="" />
    </a>
  {/if}
   <footer>
    <ul class="actions">
      <li>
        <a href="#/users/{user.name}" class="button large">Learn more</a>
      </li>
    </ul>
    <ul class="stats">
      {#each user.ecosystem.memberships as membership}
        <li>
          <a href="#/users/tags/{membership}">{membership}</a>
        </li>
      {/each}
    </ul>
  </footer>

</article>
