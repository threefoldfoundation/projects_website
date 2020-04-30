<script>
  export let user;
</script>

<div class="user">
  <header>
    <div class="title">
      <h2>
        <a href="#/users/{user.name}">{user.info.name}</a>
      </h2>
    </div>
  </header>
  {#if user.links.image_path != ''}
    <a href="#/users/{user.name}" class="image featured">
      <img height="250" src={user.links.image_path} alt="" />
    </a>
  {:else if user.links.video != ''}
    <iframe
      title=""
      width="800"
      height="415"
      src="{user.links.video}?title=0&byline=0&portrait=0"
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope;
      picture-in-picture"
      allowfullscreen />
  {:else}
    <a href="#/projects/{user.name}" class="image featured">
      <img height="250" src="images/pic01.jpg" alt="" />
    </a>
  {/if}

</div>


