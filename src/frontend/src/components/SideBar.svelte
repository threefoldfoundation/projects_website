<script>
  import MiniProjectList from "./MiniProjectList.svelte";
  import MiniUserList from "./MiniUserList.svelte";

  export let miniProjects = [];
  export let users = [];
</script>

<section id="sidebar">

  <!-- Mini Projects -->
  <MiniProjectList {miniProjects} />

  <!-- Users -->
  <MiniUserList {users} />

  <!-- About -->
  <!-- <section class="blurb">
            <h2>About</h2>
            <p>Mauris neque quam, fermentum ut nisl vitae, convallis maximus nisl. Sed mattis nunc id lorem euismod amet placerat. Vivamus porttitor magna enim, ac accumsan tortor cursus at phasellus sed ultricies.</p>
            <ul class="actions">
                <li><a href="#" class="button">Learn More</a></li>
            </ul>
        </section> -->

</section>
