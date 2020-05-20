<script>
  import MiniProjectList from "./MiniProjectList.svelte";
  import MiniUserList from "./MiniUserList.svelte";
  import TagCloud from "./TagCloud.svelte"

  import Footer from "./Footer.svelte";
  import { alltags } from "../../store.js";

  export let miniProjects = [];
  export let users = [];
</script>

<!-- Sidebar -->
<section id="sidebar">
  <!-- Intro -->
  <section id="intro">
    <!-- <a href="/" class="logo">
      <img src="images/logo.png" alt="" />
    </a> -->
    <header>
      <h1>Conscious Internet Alliance</h1>
      <p>
        
      </p>
    </header>
  </section>

  <TagCloud tags={$alltags} />

  <!-- Mini Projects -->
  

{#if location.href.includes("#/projects")}
<MiniProjectList {miniProjects} />  
{/if}

{#if location.href.includes("#/users")}
  <MiniUserList {users} />
{/if}

{#if location.href.includes("#/search")}
<MiniProjectList {miniProjects} />  
<MiniUserList {users} />
{/if}

{#if location.href.includes("#/allprojects")}
<MiniUserList {users} />
{/if}


  <!-- User List -->

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

  
</section>
