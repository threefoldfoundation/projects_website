<script>
  import { link } from "svelte-spa-router";
</script>

<!-- <header id="header">
  <nav class="navbar navbar-expand-md fixed-top navbar-dark navbar-ontop">
    <div class="container-fluid">
      <div class="logo-liqued">
        <a
          href="https://wiki.threefold.io/docs/token/how_to_buy/index.html"
          target="_blank">
          <img src="images/ieo-comingcoon-sign.png" style="width:10%;" alt="" />  
        </a>
      </div>
      <button
        class="navbar-toggler navbar-toggler-right"
        type="button"
        data-toggle="collapse"
        data-target="#navbar2SupportedContent"
        aria-controls="navbar2SupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation">
        <span class="navbar-toggler-icon" />
      </button>
      <div
        class="collapse navbar-collapse justify-content-center"
        id="navbar2SupportedContent">
        <div class="icon">
          <a href="/">
            <img src="images/3fold_icon.png" alt="" height="45" />
          </a>
        </div>

        <div class="logo navbar-brand">
          <a href="/">
            <img src="images/TFN.svg" alt="" />
          </a>
        </div>
        <ul class="navbar-nav">
          <li class="nav-item mx-1">
            <a href="/" class="nav-link" use:link>Home</a>
          </li>

          <li class="nav-item mx-1">
            <a href="/projects" class="nav-link" use:link>Projects</a>
          </li>

          <li class="nav-item mx-1">
            <a href="/users" class="nav-link" use:link>Users</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="toogle_btn">
      <a id="show-hidden-menu" class="nav-icon">
        <span />
      </a>
    </div>
    <div class="toogle_btn">
      <a id="hidden-menu" class="nav-icon-close">
        <span />
      </a>
    </div>
  </nav>
</header> -->

<!-- Header -->
<header id="header">
  <div class="navbar-brand">
    <a href="/">
      <img src="/images/TFN.svg" alt="" />
    </a>
  </div>
  <nav class="links">
    <ul>
      <li>
        <a href="/" use:link>Home</a>
      </li>
      <li>
        <a href="/projects" use:link>Projects</a>
      </li>
      <li>
        <a href="/users" use:link>People</a>
      </li>
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
      <!-- <li>
        <a href="#">
          <h3>Lorem ipsum</h3>
          <p>Feugiat tempus veroeros dolor</p>
        </a>
      </li> -->

    </ul>
  </section>

</section>
