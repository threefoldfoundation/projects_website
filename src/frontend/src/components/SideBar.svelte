<script>
  import MiniArticles from "./MiniArticles.svelte";
  import UsersComponent from "./Users.svelte";

  let res = undefined;
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

  <!-- Footer -->
  <section id="footer">
    <ul class="icons">
      <li>
        <a href="#" class="icon brands fa-twitter">
          <span class="label">Twitter</span>
        </a>
      </li>
      <li>
        <a href="#" class="icon brands fa-facebook-f">
          <span class="label">Facebook</span>
        </a>
      </li>
      <li>
        <a href="#" class="icon brands fa-instagram">
          <span class="label">Instagram</span>
        </a>
      </li>
      <li>
        <a href="#" class="icon solid fa-rss">
          <span class="label">RSS</span>
        </a>
      </li>
      <li>
        <a href="#" class="icon solid fa-envelope">
          <span class="label">Email</span>
        </a>
      </li>
    </ul>
    <p class="copyright">
      &copy; Untitled. Design:
      <a href="http://html5up.net">HTML5 UP</a>
      . Images:
      <a href="http://unsplash.com">Unsplash</a>
      .
    </p>
  </section>

  <!--Javascript-->
  <script src="assets/js/jquery.min.js">

  </script>
  <script src="assets/js/browser.min.js">

  </script>
  <script src="assets/js/breakpoints.min.js">

  </script>
  <script src="assets/js/util.js">

  </script>
  <script src="assets/js/main.js">

  </script>
</section>
