<script>
  import { link } from "svelte-spa-router";
  let navcheck;
  function linkClick() {
    navcheck.checked = false;
  }
</script>

<!-- Header -->
<header id="header">
  <div class="brand-logo">
    <a href="http://threefold.io/" target="_blank">
      <img src="/images/TFN.svg" alt="" />
    </a>
  </div>

  <input type="checkbox" id="toggle-btn" bind:this={navcheck} />
  <label for="toggle-btn" class="show-menu-btn">
    <i class="fas fa-bars" />
  </label>

  <nav class="d-inline-block">
    <ul class="navigation">
      <li>
        <a href="#/" on:click={linkClick}>Home</a>
      </li>
      <li>
        <a href="#/projects" on:click={linkClick}>Projects</a>
      </li>
      <li>
        <a href="#/users" on:click={linkClick}>People</a>
      </li>
      <label for="toggle-btn" class="hide-menu-btn">
        <i class="fas fa-times" />
      </label>
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
    </ul>
  </nav>
</header>
