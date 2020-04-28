<script>
    export let user
</script>

<article class="user">
  <header>
    <h3>
      <a href="#/users/{user.name}">{user.name}</a>
    </h3>
  </header>
  <a href="#/users/{user.name}" class="image">
    <img src="images/pic10.jpg" alt="" />
  </a>
</article>
