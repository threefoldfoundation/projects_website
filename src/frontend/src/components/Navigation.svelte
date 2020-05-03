<script>
  import { link } from "svelte-spa-router";
</script>

<!-- Header -->
<header id="header">
  <div class="brand-logo">
    <a href="/">
      <img src="/images/TFN.svg" alt="" />
    </a>
  </div>

  <input type="checkbox" id="toggle-btn" />
  <label for="toggle-btn" class="show-menu-btn">
    <i class="fas fa-bars" />
  </label>

  <nav>
    <ul class="navigation" id="nav">
      <li>
        <a href="/" use:link class="nav-link">Home</a>
      </li>
      <li>
        <a href="/projects" use:link class="nav-link">Projects</a>
      </li>
      <li>
        <a href="/users" use:link class="nav-link">People</a>
      </li>
      <label for="toggle-btn" class="hide-menu-btn">
        <i class="fas fa-times" />
      </label>
    </ul>
  </nav>
</header>
