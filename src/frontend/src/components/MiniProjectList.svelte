<script>
  import MiniArticles from "./MiniArticles.svelte";
  import UsersComponent from "./Users.svelte";

  let res = undefined;

  // list of MiniProjects
</script>

<!-- Sidebar -->
<section id="sidebar">

  <!-- Intro -->
  <section id="intro">
    <a href="#" class="logo">
      <img src="images/logo.jpg" alt="" />
    </a>
    <header>
      <h2>Future Imperfect</h2>
      <p>
        Another fine responsive site template by
        <a href="http://html5up.net">HTML5 UP</a>
      </p>
    </header>
  </section>

  {#if res === undefined}
    <p />
  {:else}
    {#await res}

      <p>Loading...</p>

    {:then items}
      <!-- Mini Posts -->
      <MiniArticles miniarticles={items.projects} />
      <!-- users List -->
      <UsersComponent users={items.users} />
    {:catch error}
      {error.message}
    {/await}
  {/if}

  <!-- About -->
  <section class="blurb">
    <h2>About</h2>
    <p>
      Mauris neque quam, fermentum ut nisl vitae, convallis maximus nisl. Sed
      mattis nunc id lorem euismod amet placerat. Vivamus porttitor magna enim,
      ac accumsan tortor cursus at phasellus sed ultricies.
    </p>
    <ul class="actions">
      <li>
        <a href="#" class="button">Learn More</a>
      </li>
    </ul>
  </section>

</section>
