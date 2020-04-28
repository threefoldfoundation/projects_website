<script>
  import { link } from "svelte-spa-router";
</script>

<!--Nav-bar-->
<div>
  <header id="header">
    <h1>
      <a href="index.html">Planet First</a>
    </h1>
    <nav class="links">
      <ul>
        <nav>
          <li>
            <a href="/" use:link>Home</a>
          </li>
          <li>
            <a href="/projects" use:link>Projects</a>
          </li>
          <li>
            <a href="/users" use:link>Users</a>
          </li>
        </nav>
      </ul>
    </nav>
    <nav class="main">
      <ul>
        <li class="search">
          <a class="fa-search" href="#search">Search</a>
          <form id="search" method="get" action="#">
            <input type="text" name="query" placeholder="Search" />
          </form>
        </li>
        <li class="menu">
          <a class="fa-bars" href="#menu">Menu</a>
        </li>
      </ul>
    </nav>
  </header>
  <!-- Menu -->
  <section id="menu">

    <!-- Search -->
    <section>
      <form class="search" method="get" action="#">
        <input type="text" name="query" placeholder="Search" />
      </form>
    </section>

    <!-- Links -->
    <section>
      <ul class="links">
        <li>
          <a href="#">
            <h3>Lorem ipsum</h3>
            <p>Feugiat tempus veroeros dolor</p>
          </a>
        </li>
        <li>
          <a href="#">
            <h3>Dolor sit amet</h3>
            <p>Sed vitae justo condimentum</p>
          </a>
        </li>
        <li>
          <a href="#">
            <h3>Feugiat veroeros</h3>
            <p>Phasellus sed ultricies mi congue</p>
          </a>
        </li>
        <li>
          <a href="#">
            <h3>Etiam sed consequat</h3>
            <p>Porta lectus amet ultricies</p>
          </a>
        </li>
      </ul>
    </section>

    <!-- Actions -->
    <section>
      <ul class="actions stacked">
        <li>
          <a href="#" class="button large fit">Log In</a>
        </li>
      </ul>
    </section>

  </section>
</div>
