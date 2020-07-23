<script>
  export let user;

  function formatUser() {
    return user.name.replace(/_/g, " ");
  }
</script>

<style>
  h3 {
    text-transform: none;
  }
  .user-box p {
    color: #646464;
    font-size: 0.9em !important;
    margin-top: 0;
  }
  a:hover {
    text-decoration: none;
  }
  .post footer .stats li {
    margin: 0 0 0 1em;
  }
</style>

<div class="col-sm-12">
  <a class="image featured mb-0" href="#/people/{user.name}">

    <article class="post search_result row p-3 mb-4">
      <div class="col-sm-3">
        <img src={user.links.image_path} alt="" class="img-thumbnail" />
      </div>
      <div class="col-sm-9">
        <header>
          <div class="title">
            <h3 class="text-capitalize">{formatUser()}</h3>

            <div class="user-box">
              <p>
                {user.info.bio
                  .split(' ')
                  .slice(0, 20)
                  .join(' ')}...
              </p>
            </div>
          </div>
        </header>
        <footer class="m-auto">
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
  </a>
</div>
