<script>
  export let user;
</script>

<div class="col-sm-12">
  <article class="post search_result row p-3 mb-4">
    <div class="col-sm-3">
      <a class="image featured mb-0" href="#/people/{user.name}">
        <img src={user.links.image_path} alt="" class="img-thumbnail" />
      </a>
    </div>
    <div class="col-sm-9">
      <header>
        <div class="title">
          <h3>{user.name}</h3>

          <div>
            {user.info.bio
              .split(' ')
              .slice(0, 20)
              .join(' ')} .....

          </div>
        </div>
      </header>
      <footer class="ml-auto">
        <ul class="stats">
          {#each user.ecosystem.memberships as membership}
            <li>
              <a class="text-uppercase" href="#/people/tags/{membership}">
                {membership}
              </a>
            </li>
          {/each}
        </ul>
      </footer>
    </div>

  </article>
</div>
