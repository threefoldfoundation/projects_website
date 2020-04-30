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
    <iframe
      width="950"
      height="550"
      src="{user.links.video}?title=0&byline=0&portrait=0"
      title=""
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope;
      picture-in-picture"
      allowfullscreen />
  {:else if user.links.image_path !== ''}
    <a href="#/users/{user.name}" class="image featured">
      <img src={user.links.image_path} alt="" />
    </a>
  {:else}
    <a href="#/users/{user.name}" class="image featured">
      <img height="auto" src="images/pic01.jpg" alt="" />
    </a>
  {/if}
</article>
