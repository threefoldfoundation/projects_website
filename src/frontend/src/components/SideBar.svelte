<script>
  import MiniProjectList from "./MiniProjectList.svelte";
  import MiniUserList from "./MiniUserList.svelte";
  import Footer from "./Footer.svelte";

  export let miniProjects = [];
  export let users = [];
</script>

<!-- Sidebar -->
<section id="sidebar">
  <!-- Intro -->
  <section id="intro">
    <a href="/" class="logo">
      <img src="images/logo.png" alt="" />
    </a>
    <header>
      <h2>Conscious Internet Alliance</h2>
      <p>
        Another fine responsive site template by
        <a href="http://html5up.net">HTML5 UP</a>
      </p>
    </header>
  </section>

  <!-- Mini Projects -->
  <MiniProjectList {miniProjects} />

  <!-- User List -->
  <section>
    <MiniUserList {users} />
  </section>

  <!-- About -->
  <!-- <section class="blurb">
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
  </section> -->

  <!-- Footer -->
  <Footer />
</section>
