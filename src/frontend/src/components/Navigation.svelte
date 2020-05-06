<script>
  import { link } from "svelte-spa-router";

  function getActive(t) {
    if (t.includes("#/users") || t == "PEOPLE") {
      return "people";
    } else if (t.includes("#/projects") || t == "PROJECTS") {
      return "projects";
    } else if (t.includes("#/join") || t == "JOIN US") {
      return "join";
    }
    return "home";
  }

  $: active = getActive(location.href);

  let navcheck;
  function linkClick(evt) {
    navcheck.checked = false;
    var t = evt.target.innerText;
    active = getActive(t);
  }
</script>

<!-- Header -->
<header id="header">
  <div class="brand-logo">
    <a href="https://threefold.io/" target="_blank">
      <img src="/images/TFN.svg" alt="" />
    </a>
  </div>

  <input type="checkbox" id="toggle-btn" bind:this={navcheck} />
  <label for="toggle-btn" class="show-menu-btn">
    <i class="fas fa-bars" />
  </label>

  <nav class="">
    <ul class="navigation">
      <li>
        {#if active == 'home'}
          <a class="active" href="#/" on:click={linkClick}>Home</a>
        {:else}
          <a href="#/" on:click={linkClick}>Home</a>
        {/if}
      </li>
      <li>
        {#if active == 'projects'}
          <a class="active" href="#/projects" on:click={linkClick}>Projects</a>
        {:else}
          <a href="#/projects" on:click={linkClick}>Projects</a>
        {/if}
      </li>
      <li>
        {#if active == 'people'}
          <a class="active" href="#/users" on:click={linkClick}>People</a>
        {:else}
          <a href="#/users" on:click={linkClick}>People</a>
        {/if}
      </li>
      <li>
        {#if active == 'join'}
          <a class="active" href="#/join" on:click={linkClick}>Join us</a>
        {:else}
          <a href="#/join" on:click={linkClick}>Join us</a>
        {/if}
      </li>
      <label for="toggle-btn" class="hide-menu-btn">
        <i class="fas fa-times" />
      </label>
    </ul>
  </nav>
</header>
